"""
Storage abstraction for uploaded course/book content.

Today only `LocalStorage` (VPS disk) is implemented. The interface is
deliberately storage-agnostic — a future `S3Storage` (AWS S3 / Cloudflare R2 /
Backblaze B2, all S3-compatible) can implement the same methods without any
caller (lessons router, admin upload) needing to change. Switch backends via
the `STORAGE_BACKEND` env var.
"""

from __future__ import annotations

import os
import re
from pathlib import Path
from typing import BinaryIO, Iterator, Optional, Tuple

from fastapi import UploadFile

from app.core.config import settings


class StorageError(Exception):
    pass


class StorageBackend:
    """Abstract interface every storage backend must implement."""

    def save(self, key: str, upload_file: UploadFile, max_bytes: Optional[int] = None) -> int:
        """Stream `upload_file` to `key`. Returns the number of bytes written."""
        raise NotImplementedError

    def delete(self, key: str) -> None:
        raise NotImplementedError

    def exists(self, key: str) -> bool:
        raise NotImplementedError

    def size(self, key: str) -> int:
        raise NotImplementedError

    def open_range(self, key: str, start: int, length: int) -> Iterator[bytes]:
        """Yield up to `length` bytes starting at `start`, in chunks."""
        raise NotImplementedError

    def public_url(self, key: str) -> str:
        """
        URL for content that's fine to serve directly, unauthenticated (e.g. product
        cover images) — unlike lessons, which always go through the token-gated
        /stream route regardless of backend.
        """
        raise NotImplementedError


class LocalStorage(StorageBackend):
    """Stores files directly on the server's local disk (VPS)."""

    CHUNK_SIZE = 1024 * 1024  # 1MB

    def __init__(self, base_dir: str):
        self.base_dir = Path(base_dir).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _resolve(self, key: str) -> Path:
        # Guard against path traversal via a crafted key.
        if not re.match(r"^[A-Za-z0-9_\-./]+$", key):
            raise StorageError("Invalid storage key")
        path = (self.base_dir / key).resolve()
        if self.base_dir not in path.parents and path != self.base_dir:
            raise StorageError("Invalid storage key")
        return path

    def save(self, key: str, upload_file: UploadFile, max_bytes: Optional[int] = None) -> int:
        path = self._resolve(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        total = 0
        try:
            with open(path, "wb") as out:
                while True:
                    chunk = upload_file.file.read(self.CHUNK_SIZE)
                    if not chunk:
                        break
                    total += len(chunk)
                    if max_bytes is not None and total > max_bytes:
                        raise StorageError("File exceeds maximum allowed size")
                    out.write(chunk)
        except Exception:
            if path.exists():
                path.unlink()
            raise
        return total

    def delete(self, key: str) -> None:
        path = self._resolve(key)
        if path.exists():
            path.unlink()

    def exists(self, key: str) -> bool:
        return self._resolve(key).exists()

    def size(self, key: str) -> int:
        return self._resolve(key).stat().st_size

    def open_range(self, key: str, start: int, length: int) -> Iterator[bytes]:
        path = self._resolve(key)
        with open(path, "rb") as f:
            f.seek(start)
            remaining = length
            while remaining > 0:
                chunk = f.read(min(self.CHUNK_SIZE, remaining))
                if not chunk:
                    break
                remaining -= len(chunk)
                yield chunk

    def public_url(self, key: str) -> str:
        # Served by the StaticFiles mount at /uploads in app/main.py.
        return f"/uploads/{key}"


_storage_instance: Optional[StorageBackend] = None


def get_storage() -> StorageBackend:
    global _storage_instance
    if _storage_instance is not None:
        return _storage_instance

    backend = settings.STORAGE_BACKEND
    if backend == "local":
        _storage_instance = LocalStorage(settings.UPLOAD_DIR)
    else:
        raise NotImplementedError(
            f"Storage backend '{backend}' is not implemented yet. "
            "Implement a StorageBackend subclass (e.g. S3Storage) in app/core/storage.py."
        )
    return _storage_instance
