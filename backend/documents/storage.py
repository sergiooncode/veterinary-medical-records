from abc import ABC, abstractmethod
from pathlib import Path


class StorageBackend(ABC):
    @abstractmethod
    async def save(self, file_id: str, content: bytes, file_ext: str) -> str:
        pass

    @abstractmethod
    async def get_file_content(self, file_id: str, file_ext: str) -> bytes:
        pass


class LocalStorage(StorageBackend):
    def __init__(self, upload_dir: Path):
        self.upload_dir = upload_dir
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def save(self, file_id: str, content: bytes, file_ext: str) -> str:
        safe_filename = f"{file_id}{file_ext}"
        file_path = self.upload_dir / safe_filename
        with open(file_path, "wb") as f:
            f.write(content)
        return safe_filename

    async def get_file_content(self, file_id: str, file_ext: str) -> bytes:
        safe_filename = f"{file_id}{file_ext}"
        file_path = self.upload_dir / safe_filename
        with open(file_path, "rb") as f:
            return f.read()


storage = LocalStorage(Path("/app/backend/uploads"))
