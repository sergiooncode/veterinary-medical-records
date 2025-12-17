import uuid
import time

from common.logging import get_logger
from documents.storage import storage
from fastapi import APIRouter, Body, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from sqlalchemy import desc, func
from datetime import datetime, UTC

from common.database import get_session
from .exceptions import (
    FileValidationError,
    TextExtractionError,
    UnsupportedFileTypeError,
)
from .models import DocumentProcessingRun
from .schemas import ProcessRequest, ValidatedFile
from .tasks import process_document_task

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    logger=Depends(get_logger),
    session: Session = Depends(get_session),
):
    """Upload a document file and create a processing run."""
    content = await file.read()

    try:
        validated = ValidatedFile(
            filename=file.filename,
            content=content,
            content_type=file.content_type,
        )
    except FileValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

    file_id = str(uuid.uuid4())
    original_filename = file.filename

    try:
        safe_filename = await storage.save(
            file_id, validated.content, validated.file_ext
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    processing_run = DocumentProcessingRun(
        id=file_id,
        filename=original_filename,
        document_type=validated.file_ext,
        file_path=str(storage.get_full_path(file_id, validated.file_ext)),
    )
    session.add(processing_run)
    session.commit()
    session.refresh(processing_run)

    logger.info(f"Processing run created: {file_id} - {validated.filename}")

    return JSONResponse(
        status_code=200,
        content={
            "id": file_id,
            "filename": validated.filename,
            "saved_filename": safe_filename,
            "size": len(validated.content),
            "content_type": validated.content_type,
            "message": "File uploaded successfully",
        },
    )


@router.post("/process")
async def process_document(
    request: ProcessRequest = Body(...),
    logger=Depends(get_logger),
    session: Session = Depends(get_session),
):
    """Process a document processing run to extract text and structured data."""
    file_id = request.file_id

    statement = select(DocumentProcessingRun).where(DocumentProcessingRun.id == file_id)
    processing_run = session.exec(statement).first()

    if not processing_run:
        raise HTTPException(
            status_code=404, detail=f"Processing run with ID {file_id} not found"
        )

    file_path = await storage.find_file(file_id)
    if not file_path:
        raise HTTPException(
            status_code=404, detail=f"File not found for file_id: {file_id}"
        )

    try:
        processing_run.run_status = "processing"
        processing_run.updated_at = datetime.now(UTC)
        session.add(processing_run)
        session.commit()

        process_document_task.apply_async(
            args=[
                file_id,
                str(file_path),
            ]
        )

        poll_url = f"/api/documents/{file_id}/status"

        return JSONResponse(
            status_code=201,
            content={
                "file_id": file_id,
                "status": "processing",
                "status_url": poll_url,
            },
        )
    except UnsupportedFileTypeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except TextExtractionError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process document run: {str(e)}"
        )


@router.get("")
async def list_documents(
    session: Session = Depends(get_session),
    logger=Depends(get_logger),
):
    """List the latest document processing run for each unique filename."""
    subquery = (
        select(
            DocumentProcessingRun.filename,
            func.max(DocumentProcessingRun.created_at).label("max_created_at")
        )
        .group_by(DocumentProcessingRun.filename)
    ).subquery()

    statement = (
        select(DocumentProcessingRun)
        .join(
            subquery,
            (DocumentProcessingRun.filename == subquery.c.filename)
            & (DocumentProcessingRun.created_at == subquery.c.max_created_at)
        )
        .order_by(desc(DocumentProcessingRun.created_at))  # type: ignore[arg-type]
    )
    processing_runs = session.exec(statement).all()

    result = [
        {
            "id": run.id,
            "filename": run.filename,
            "document_type": run.document_type,
            "created_at": run.created_at.isoformat() if run.created_at else None,
            "updated_at": run.updated_at.isoformat() if run.updated_at else None,
            "status": run.run_status,
        }
        for run in processing_runs
    ]

    logger.info(f"Listed {len(result)} latest processing runs (grouped by filename)")

    return JSONResponse(status_code=200, content={"documents": result})


@router.get("/{file_id}")
async def retrieve_document(
    file_id: str,
    session: Session = Depends(get_session),
):
    """Retrieve a document processing run and its results."""
    statement = select(DocumentProcessingRun).where(DocumentProcessingRun.id == file_id)
    processing_run = session.exec(statement).first()

    if not processing_run:
        raise HTTPException(
            status_code=404,
            detail=f"Processing run with ID {file_id} not found",
        )

    result_data = {
        "file_id": processing_run.id,
        "filename": processing_run.filename,
        "extracted_text": processing_run.extracted_text,
        "structured_data": processing_run.structured_data,
        "status": processing_run.run_status,
    }

    return JSONResponse(status_code=200, content=result_data)


@router.get("/{file_id}/status")
async def retrieve_document_status(
    file_id: str,
    session: Session = Depends(get_session),
):
    """Retrieve processing status for a document processing run."""
    statement = select(DocumentProcessingRun).where(DocumentProcessingRun.id == file_id)
    processing_run = session.exec(statement).first()

    if not processing_run:
        raise HTTPException(
            status_code=404,
            detail=f"Processing run with ID {file_id} not found",
        )

    return JSONResponse(
        status_code=200,
        content={"file_id": processing_run.id, "status": processing_run.run_status},
    )
