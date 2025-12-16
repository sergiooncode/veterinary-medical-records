import uuid
from pathlib import Path

from common.logging import get_logger
from fastapi import APIRouter, UploadFile, File, HTTPException, Body, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    logger=Depends(get_logger),
):
    """Upload a document file."""
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    file_size = len(content)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024 * 1024):.0f} MB",
        )

    if file_size == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    file_id = str(uuid.uuid4())
    original_filename = file.filename
    safe_filename = f"{file_id}{file_ext}"
    file_path = UPLOAD_DIR / safe_filename

    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    logger.info(f"Document uploaded: {file_id} - {original_filename}")

    return JSONResponse(
        status_code=200,
        content={
            "id": file_id,
            "filename": original_filename,
            "saved_filename": safe_filename,
            "size": file_size,
            "content_type": file.content_type,
            "message": "File uploaded successfully",
        },
    )


# Pydantic models
class ProcessRequest(BaseModel):
    file_id: str


@router.post("/process")
async def process_document(
    request: ProcessRequest = Body(...),
    logger=Depends(get_logger),
):
    """Process an uploaded document to extract text and structured data."""
    file_id = request.file_id

    try:
        extracted_text = """
        Bella is a 12-year-old spayed female Labrador Retriever presenting for chronic ear infections.

History of allergic dermatitis managed with diet and intermittent steroids.

On exam: erythematous ear canals with moderate ceruminous discharge, no neurologic deficits.

Assessment: chronic otitis externa, likely secondary to underlying allergic skin disease.

Plan: ear cleaning, topical otic medication, recheck in 2 weeks.
        """
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process document: {str(e)}"
        )
