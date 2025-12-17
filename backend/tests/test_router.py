

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


def test_list_documents_includes_uploaded_file(client):
    upload_resp = client.post(
        "/api/documents/upload",
        files={"file": ("list-test.pdf", b"content", "application/pdf")},
    )
    assert upload_resp.status_code == 200
    file_id = upload_resp.json()["id"]

    list_resp = client.get("/api/documents")
    assert list_resp.status_code == 200
    payload = list_resp.json()
    assert "documents" in payload
    docs = payload["documents"]
    assert any(
        doc["id"] == file_id and doc["filename"] == "list-test.pdf" for doc in docs
    )


def test_retrieve_document_returns_details(client):
    upload_resp = client.post(
        "/api/documents/upload",
        files={"file": ("detail-test.pdf", b"content", "application/pdf")},
    )
    assert upload_resp.status_code == 200
    file_id = upload_resp.json()["id"]

    detail_resp = client.get(f"/api/documents/{file_id}")
    assert detail_resp.status_code == 200
    data = detail_resp.json()
    assert data["file_id"] == file_id
    assert data["filename"] == "detail-test.pdf"
    assert "extracted_text" in data
    assert "structured_data" in data
    assert data["status"] in {"uploaded", "processed"}


def test_retrieve_document_not_found(client):
    resp = client.get("/api/documents/non-existent-id")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()
