from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, computed_field, field_validator


class LessonResponse(BaseModel):
    """Public-safe lesson metadata — never exposes the storage key/path."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    title: str
    description: Optional[str] = None
    content_type: str
    file_size: int
    duration_seconds: Optional[int] = None
    order_index: int
    created_at: datetime

    @computed_field
    @property
    def contentType(self) -> str:
        return self.content_type

    @computed_field
    @property
    def fileSize(self) -> int:
        return self.file_size

    @computed_field
    @property
    def durationSeconds(self) -> Optional[int]:
        return self.duration_seconds

    @computed_field
    @property
    def orderIndex(self) -> int:
        return self.order_index

    @computed_field
    @property
    def productId(self) -> int:
        return self.product_id

    @computed_field
    @property
    def createdAt(self) -> datetime:
        return self.created_at


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None


class LessonAccessResponse(BaseModel):
    token: str
    stream_url: str
    expires_in_minutes: int

    @computed_field
    @property
    def streamUrl(self) -> str:
        return self.stream_url

    @computed_field
    @property
    def expiresInMinutes(self) -> int:
        return self.expires_in_minutes
