from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class LessonContentType(str, enum.Enum):
    VIDEO = "video"
    AUDIO = "audio"
    PDF = "pdf"


class ProductLesson(Base):
    """A single piece of viewable content within a product (course lesson or book)."""

    __tablename__ = "product_lessons"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    content_type = Column(Enum(LessonContentType), nullable=False)
    # Storage-backend-agnostic key (e.g. relative path today, S3 object key tomorrow).
    storage_key = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False, default=0)
    duration_seconds = Column(Integer, nullable=True)
    order_index = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="lessons")
