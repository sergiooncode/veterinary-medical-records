import tempfile
from pathlib import Path

import pytest

from documents.exceptions import TextExtractionError, UnsupportedFileTypeError
from documents.services.text_extraction.extractors import extract_text_from_file


def test_extract_text_unsupported_file_type():
    with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
        f.write(b"test content")
        file_path = Path(f.name)

    with pytest.raises(UnsupportedFileTypeError):
        extract_text_from_file(file_path)

    file_path.unlink()


@pytest.fixture
def sample_pdf(tmp_path):
    from pypdf import PdfWriter

    pdf_path = tmp_path / "sample.pdf"
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    with pdf_path.open("wb") as f:
        writer.write(f)
    return pdf_path


@pytest.fixture
def sample_png(tmp_path):
    from PIL import Image

    png_path = tmp_path / "sample.png"
    image = Image.new("RGB", (10, 10), color="white")
    image.save(png_path, format="PNG")
    return png_path


def test_extract_text_non_implemented_file_type():
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as f:
        f.write(b"test content")
        file_path = Path(f.name)

    extract_text_from_file(file_path)

    file_path.unlink()


def test_extract_text_supported_pdf_file_type(sample_pdf):
    extract_text_from_file(sample_pdf)


def test_extract_text_supported_png_file_type(sample_png):
    extract_text_from_file(sample_png)

