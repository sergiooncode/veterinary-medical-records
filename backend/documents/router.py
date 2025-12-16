import uuid

from common.logging import get_logger
from documents.storage import storage
from fastapi import APIRouter, Body, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from datetime import datetime, UTC

from common.database import get_session
from .exceptions import (
    FileValidationError,
    TextExtractionError,
    UnsupportedFileTypeError,
)
from .models import Document
from .schemas import ProcessRequest, ValidatedFile
from .services.structured_info.parsers import parse_structured_data
from .services.text_extraction.extractors import extract_text_from_file

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    logger=Depends(get_logger),
    session: Session = Depends(get_session),
):
    """Upload a document file."""
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

    document = Document(
        id=file_id,
        filename=original_filename,
        document_type=validated.file_ext,
        file_path=str(storage.get_full_path(file_id, validated.file_ext)),
    )
    session.add(document)
    session.commit()
    session.refresh(document)

    logger.info(f"Document uploaded: {file_id} - {validated.filename}")

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
    """Process an uploaded document to extract text and structured data."""
    file_id = request.file_id

    statement = select(Document).where(Document.id == file_id)
    document = session.exec(statement).first()

    file_path = await storage.find_file(file_id)
    if not file_path:
        raise HTTPException(
            status_code=404, detail=f"File not found for file_id: {file_id}"
        )

    try:
        extracted_text = extract_text_from_file(file_path)
        structured_data = parse_structured_data(extracted_text, logger)

        document.extracted_text = extracted_text
        document.structured_data = structured_data
        document.updated_at = datetime.now(UTC)
        session.add(document)
        session.commit()
        session.refresh(document)

        logger.info(f"Document processed: {file_id}")

        result_data = {
            "file_id": file_id,
            "filename": "filename",
            "extracted_text": extracted_text,
            "structured_data": structured_data,
            "status": "processed",
        }

        return JSONResponse(status_code=200, content=result_data)
    except UnsupportedFileTypeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except TextExtractionError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process document: {str(e)}"
        )


@router.get("")
async def list_documents(
    session: Session = Depends(get_session),
    logger=Depends(get_logger),
):
    """List all documents."""
    statement = select(Document).order_by(Document.created_at.desc())
    documents = session.exec(statement).all()

    result = [
        {
            "id": doc.id,
            "filename": doc.filename,
            "document_type": doc.document_type,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
            "updated_at": doc.updated_at.isoformat() if doc.updated_at else None,
            "status": "processed" if doc.extracted_text else "uploaded",
        }
        for doc in documents
    ]

    logger.info(f"Listed {len(result)} documents")

    return JSONResponse(status_code=200, content={"documents": result})


@router.get("/{file_id}")
async def retrieve_document(
    file_id: str,
    session: Session = Depends(get_session),
):
    """Retrieve processed document results."""
    statement = select(Document).where(Document.id == file_id)
    document = session.exec(statement).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail=f"Document with ID {file_id} not found",
        )

    result_data = {
        "file_id": document.id,
        "filename": document.filename,
        "extracted_text": document.extracted_text,
        "structured_data": document.structured_data,
        "status": "processed" if document.extracted_text else "uploaded",
    }

    return JSONResponse(status_code=200, content=result_data)
