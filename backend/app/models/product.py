from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base




class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    image_url = Column(String, nullable=True)
    stock = Column(Integer, default=0)
    sold = Column(Integer, default=0)
    # Optional merchandising / catalog fields used by the frontend
    category = Column(String, nullable=True)
    # DB column name "format" — attribute avoids shadowing builtin `format`
    content_format = Column("format", String, nullable=True)
    pages = Column(Integer, nullable=True)
    bestseller = Column(Boolean, default=False)
    offer_end_date = Column(DateTime(timezone=True), nullable=True)
    featured = Column(Boolean, default=False)
    purchase_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    orders = relationship("Order", back_populates="product")
    reviews = relationship(
        "Review", back_populates="product", cascade="all, delete-orphan"
    )
    likes = relationship(
        "ProductLike", back_populates="product", cascade="all, delete-orphan"
    )
    lessons = relationship(
        "ProductLesson",
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductLesson.order_index",
    )

