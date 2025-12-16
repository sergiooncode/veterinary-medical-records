import uuid

from common.logging import get_logger
from documents.storage import storage
from fastapi import APIRouter, UploadFile, File, HTTPException, Body, Depends
from fastapi.responses import JSONResponse

from .exceptions import (
    FileValidationError,
    TextExtractionError,
    UnsupportedFileTypeError,
)
from .schemas import ValidatedFile, ProcessRequest
from .services.text_extraction.extractors import extract_text_from_file

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    logger=Depends(get_logger),
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

    try:
        safe_filename = await storage.save(
            file_id, validated.content, validated.file_ext
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

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
):
    """Process an uploaded document to extract text and structured data."""
    file_id = request.file_id

    file_path = await storage.find_file(file_id)
    if not file_path:
        raise HTTPException(
            status_code=404, detail=f"File not found for file_id: {file_id}"
        )

    try:
        extracted_text = extract_text_from_file(file_path)
        structured_data = {
            "pet_name": None,
            "species": "Canine",
            "breed": None,
            "weight": None,
            "diagnoses": [],
            "past_medical_issues": [],
            "chronic_conditions": [],
            "procedures": [],
            "medications": [],
            "symptom_onset_date": None,
            "notes": "notes",
            "clinic_info": {
                "name": None,
                "address": None,
                "phone": None,
                "veterinarian": None,
            },
        }

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
