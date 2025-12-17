import uuid
from datetime import datetime, UTC
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field, Column, JSON, Text


class DocumentProcessingRun(SQLModel, table=True):
    """Database model for a single processing run of a veterinary medical record document.
    
    A document file can be processed multiple times, each creating a new processing run
    with potentially different extracted text and structured data.
    """

    __tablename__ = "document_processing_runs"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    filename: str
    document_type: str = Field(description="File extension/type (e.g., .pdf, .docx)")
    file_path: Optional[str] = Field(default=None, description="Path to stored file")
    extracted_text: Optional[str] = Field(default=None, sa_column=Column(Text))
    structured_data: Optional[Dict[str, Any]] = Field(
        default=None, sa_column=Column(JSON)
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
