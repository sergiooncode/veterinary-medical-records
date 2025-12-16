from abc import ABC, abstractmethod
from pathlib import Path

from .schemas import ALLOWED_EXTENSIONS


class StorageBackend(ABC):
    @abstractmethod
    async def save(self, file_id: str, content: bytes, file_ext: str) -> str:
        pass

    @abstractmethod
    async def get_file_content(self, file_id: str, file_ext: str) -> bytes:
        pass

    @abstractmethod
    async def exists(self, file_id: str, file_ext: str) -> bool:
        pass

    @abstractmethod
    async def find_file(self, file_id: str) -> Path | None:
        pass


class LocalStorage(StorageBackend):
    def __init__(self, upload_dir: Path):
        self.upload_dir = upload_dir
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def get_full_path(self, file_id: str, file_ext: str) -> Path:
        safe_filename = f"{file_id}{file_ext}"
        return self.upload_dir / safe_filename

    async def save(self, file_id: str, content: bytes, file_ext: str) -> str:
        file_path = self.get_full_path(file_id, file_ext)
        with open(file_path, "wb") as f:
            f.write(content)
        return file_path.name

    async def get_file_content(self, file_id: str, file_ext: str) -> bytes:
        file_path = self.get_full_path(file_id, file_ext)
        with open(file_path, "rb") as f:
            return f.read()

    async def exists(self, file_id: str, file_ext: str) -> bool:
        return self.get_full_path(file_id, file_ext).exists()

    async def find_file(self, file_id: str) -> Path | None:
        for ext in ALLOWED_EXTENSIONS:
            if await self.exists(file_id, ext):
                return self.get_full_path(file_id, ext)
        return None


storage = LocalStorage(Path("/app/backend/uploads"))
