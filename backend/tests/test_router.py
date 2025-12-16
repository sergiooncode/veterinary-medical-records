import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi import APIRouter, FastAPI
from fastapi.testclient import TestClient

from documents.router import router
from documents.storage import LocalStorage

app = FastAPI()
api_router = APIRouter(prefix="/api")
api_router.include_router(router)
app.include_router(api_router)


@pytest.fixture
def temp_storage():
    with tempfile.TemporaryDirectory() as tmpdir:
        storage = LocalStorage(Path(tmpdir))
        with patch("documents.router.storage", storage):
            yield storage


@pytest.fixture
def client(temp_storage):
    return TestClient(app)


def test_upload_valid_file(client):
    content = b"test pdf content"
    response = client.post(
        "/api/documents/upload",
        files={"file": ("test.pdf", content, "application/pdf")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["filename"] == "test.pdf"
    assert data["size"] == len(content)
    assert data["message"] == "File uploaded successfully"


def test_upload_invalid_extension(client):
    response = client.post(
        "/api/documents/upload",
        files={"file": ("test.exe", b"content", "application/x-msdownload")},
    )
    assert response.status_code == 400
    assert "not allowed" in response.json()["detail"].lower()


def test_upload_empty_file(client):
    response = client.post(
        "/api/documents/upload",
        files={"file": ("test.pdf", b"", "application/pdf")},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_process_document(client):
    upload_resp = client.post(
        "/api/documents/upload",
        files={
            "file": (
                "test.docx",
                b"fake docx content",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
    )
    assert upload_resp.status_code == 200
    file_id = upload_resp.json()["id"]

    response = client.post(
        "/api/documents/process",
        json={"file_id": file_id},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["file_id"] == file_id
    assert "extracted_text" in data
    assert "structured_data" in data
    assert data["status"] == "processed"
