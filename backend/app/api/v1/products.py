import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.db.database import get_db
from app.models.product import Product
from app.models.review import Review
from app.models.product_like import ProductLike
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductDetailResponse,
    product_payload_to_orm_dict,
)
from app.api.dependencies import get_current_admin_user, get_optional_current_user
from app.core.storage import StorageError, get_storage
from app.models.user import User
from app.dependencies.locale import get_locale
from app.i18n import get_translation

router = APIRouter()

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_IMAGE_SIZE_MB = 10

@router.get("", response_model=List[ProductResponse])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all products with optional filtering."""
    query = db.query(Product)
    
    if search:
        query = query.filter(
            Product.title.ilike(f"%{search}%") |
            Product.description.ilike(f"%{search}%")
        )
    
    if featured is not None:
        query = query.filter(Product.featured == featured)
    
    products = query.offset(skip).limit(limit).all()
    return [ProductResponse.model_validate(p) for p in products]

@router.get("/search", response_model=List[ProductResponse])
async def search_products(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    """Search products by query."""
    products = db.query(Product).filter(
        Product.title.ilike(f"%{q}%") |
        Product.description.ilike(f"%{q}%")
    ).all()
    return [ProductResponse.model_validate(p) for p in products]

@router.get("/{product_id}", response_model=ProductDetailResponse)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
    locale: str = Depends(get_locale),
):
    """Get a product by ID (includes like/review counts; optional Bearer sets liked_by_me)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_translation("errors.product_not_found", lang=locale),
        )
    like_count = (
        db.query(func.count(ProductLike.id)).filter(ProductLike.product_id == product_id).scalar() or 0
    )
    review_count = (
        db.query(func.count(Review.id)).filter(Review.product_id == product_id).scalar() or 0
    )
    liked_by_me: Optional[bool] = None
    if current_user is not None:
        liked_by_me = (
            db.query(ProductLike.id)
            .filter(
                ProductLike.product_id == product_id,
                ProductLike.user_id == current_user.id,
            )
            .first()
            is not None
        )
    base = ProductResponse.model_validate(product).model_dump()
    return ProductDetailResponse(
        **base,
        like_count=like_count,
        review_count=review_count,
        liked_by_me=liked_by_me,
    )

@router.post("/images", status_code=status.HTTP_201_CREATED)
async def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Upload a product cover image (admin only). Returns a public URL to use as
    `image_url` on product create/update — images are public, unlike lesson
    content which always stays behind the token-gated stream endpoint.
    """
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_IMAGE_EXTENSIONS))
        raise HTTPException(status_code=422, detail=f"Invalid image type. Allowed: {allowed}")

    storage = get_storage()
    key = f"covers/{uuid.uuid4().hex}{ext}"
    try:
        storage.save(key, file, max_bytes=MAX_IMAGE_SIZE_MB * 1024 * 1024)
    except StorageError as e:
        raise HTTPException(status_code=413, detail=str(e))

    return {"url": storage.public_url(key)}

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new product (admin only)."""
    db_product = Product(**product_payload_to_orm_dict(product_data.model_dump()))
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return ProductResponse.model_validate(db_product)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    locale: str = Depends(get_locale),
):
    """Update a product (admin only)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_translation("errors.product_not_found", lang=locale),
        )
    
    update_data = product_data.model_dump(exclude_unset=True)
    update_data = product_payload_to_orm_dict(update_data)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return ProductResponse.model_validate(product)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    locale: str = Depends(get_locale),
):
    """Delete a product (admin only)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=get_translation("errors.product_not_found", lang=locale),
        )
    
    db.delete(product)
    db.commit()
    return None

