from pathlib import Path
from typing import Any, Dict, Optional

from celery import shared_task
from sqlmodel import Session

from common.database import engine
from metrics.services import create_processing_metrics


@shared_task
def create_metrics_task(
    document_id: str,
    extracted_text: str,
    structured_data: Dict[str, Any],
    file_path_str: str,
    prompt_tokens: Optional[int],
    completion_tokens: Optional[int],
    model_name: str,
    processing_time: Optional[float],
) -> None:
    file_path = Path(file_path_str)

    with Session(engine) as session:
        metrics = create_processing_metrics(
            document_id=document_id,
            extracted_text=extracted_text,
            structured_data=structured_data,
            file_path=file_path,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            model=model_name,
            processing_time=processing_time,
        )
        session.add(metrics)
        session.commit()


