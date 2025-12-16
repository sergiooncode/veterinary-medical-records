import tempfile
from pathlib import Path

import pytest

from documents.storage import LocalStorage


@pytest.fixture
def temp_dir():
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def storage(temp_dir):
    return LocalStorage(temp_dir)


@pytest.mark.asyncio
async def test_save_creates_file(storage, temp_dir):
    file_id = "test-123"
    content = b"test content"
    file_ext = ".txt"

    filename = await storage.save(file_id, content, file_ext)

    assert filename == f"{file_id}{file_ext}"
    file_path = temp_dir / filename
    assert file_path.exists()
    assert file_path.read_bytes() == content


@pytest.mark.asyncio
async def test_get_file_content_returns_content(storage, temp_dir):
    file_id = "test-456"
    content = b"test file content"
    file_ext = ".pdf"

    await storage.save(file_id, content, file_ext)
    retrieved = await storage.get_file_content(file_id, file_ext)

    assert retrieved == content


@pytest.mark.asyncio
async def test_get_file_content_raises_on_missing_file(storage):
    with pytest.raises(FileNotFoundError):
        await storage.get_file_content("nonexistent", ".txt")

