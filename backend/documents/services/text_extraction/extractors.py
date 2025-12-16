from pathlib import Path

import pytesseract
from PIL import Image
from PyPDF2 import PdfReader

from documents.exceptions import TextExtractionError, UnsupportedFileTypeError


def extract_text_from_file(file_path: Path) -> str:
    """Extract text from various file types."""
    file_ext = file_path.suffix.lower()

    if file_ext == ".pdf":
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            raise TextExtractionError(f"Failed to extract text from PDF: {str(e)}")

    elif file_ext in {".jpg", ".jpeg", ".png"}:
        try:
            image = Image.open(file_path)
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")
            text = pytesseract.image_to_string(image, config="--psm 6")
            return text.strip()
        except Exception as e:
            raise TextExtractionError(f"Failed to extract text from image: {str(e)}")

    elif file_ext in {".doc", ".docx"}:
        try:
            return "Word document text extraction - to be implemented with python-docx"
        except Exception as e:
            raise TextExtractionError(
                f"Failed to extract text from Word document: {str(e)}"
            )

    else:
        raise UnsupportedFileTypeError(
            f"Unsupported file type for processing: {file_ext}"
        )
