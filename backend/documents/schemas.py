from pathlib import Path

from pydantic import BaseModel, ValidationError, model_validator

from .exceptions import FileValidationError


ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 50 * 1024 * 1024


class ValidatedFile(BaseModel):
    filename: str
    content: bytes
    content_type: str

    def __init__(self, **data):
        try:
            super().__init__(**data)
        except ValidationError as e:
            raise FileValidationError(e.errors()[0]["msg"])

    @model_validator(mode="after")
    def validate_file(self):
        file_ext = Path(self.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise FileValidationError(
                f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        if len(self.content) == 0:
            raise FileValidationError("File is empty")
        if len(self.content) > MAX_FILE_SIZE:
            raise FileValidationError(
                f"File too large. Maximum size: {MAX_FILE_SIZE / (1024 * 1024):.0f} MB"
            )
        return self

    @property
    def file_ext(self) -> str:
        return Path(self.filename).suffix.lower()


class ProcessRequest(BaseModel):
    file_id: str
