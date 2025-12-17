from datetime import datetime, UTC
from pathlib import Path
from typing import Any, Optional
import logging

from sqlmodel import Session, select
from celery import shared_task

from common.database import engine
from documents.models import DocumentProcessingRun, RunStatus
from documents.services.structured_info.parsers import parse_structured_data
from documents.services.text_extraction.extractors import extract_text_from_file
from metrics.tasks import create_metrics_task


logger = logging.getLogger("documents.tasks")


@shared_task
def process_document_task(
    file_id: str,
    file_path_str: str,
) -> Optional[dict[str, Any]]:
    file_path = Path(file_path_str)

    with Session(engine) as session:
        statement = select(DocumentProcessingRun).where(DocumentProcessingRun.id == file_id)
        processing_run = session.exec(statement).first()

        if not processing_run:
            return None

        try:
            processing_run.run_status = RunStatus.PROCESSING
            processing_run.updated_at = datetime.now(UTC)
            session.add(processing_run)
            session.commit()

            start_time = datetime.now(UTC).timestamp()
            extracted_text = extract_text_from_file(file_path)
            structured_data, prompt_tokens, completion_tokens, model_name = parse_structured_data(
                extracted_text, logger=logger
            )
            processing_time = datetime.now(UTC).timestamp() - start_time

            processing_run.extracted_text = extracted_text
            processing_run.structured_data = structured_data
            processing_run.updated_at = datetime.now(UTC)
            processing_run.run_status = RunStatus.COMPLETED
            session.add(processing_run)
            session.commit()
            session.refresh(processing_run)

            create_metrics_task.apply_async(
                args=[
                    file_id,
                    extracted_text,
                    structured_data,
                    str(file_path),
                    prompt_tokens,
                    completion_tokens,
                    model_name,
                    processing_time,
                ]
            )

            return {
                "file_id": file_id,
                "filename": processing_run.filename,
                "extracted_text": extracted_text,
                "structured_data": structured_data,
                "status": processing_run.run_status,
            }
        except Exception as exc:
            logger.exception("Document processing task failed for %s: %s", file_id, exc)
            processing_run.run_status = RunStatus.FAILED
            processing_run.updated_at = datetime.now(UTC)
            session.add(processing_run)
            session.commit()
            return None


