import mimetypes
import re
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_media_token, decode_media_token
from app.core.storage import StorageError, get_storage
from app.db.database import get_db
from app.api.dependencies import get_current_admin_user, get_current_user
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.product_lesson import LessonContentType, ProductLesson
from app.models.user import User
from app.schemas.lesson import LessonAccessResponse, LessonResponse, LessonUpdate

router = APIRouter()

ALLOWED_EXTENSIONS = {
    LessonContentType.VIDEO: {".mp4", ".webm", ".mov", ".m4v"},
    LessonContentType.AUDIO: {".mp3", ".wav", ".m4a", ".ogg"},
    LessonContentType.PDF: {".pdf"},
}

CONTENT_TYPE_DEFAULTS = {
    LessonContentType.VIDEO: "video/mp4",
    LessonContentType.AUDIO: "audio/mpeg",
    LessonContentType.PDF: "application/pdf",
}

RANGE_RE = re.compile(r"bytes=(\d+)-(\d*)")


@router.post("/{product_id}/lessons", response_model=LessonResponse, status_code=201)
async def upload_lesson(
    product_id: int,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    content_type: str = Form(...),
    order_index: int = Form(0),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Upload a lesson file (video/audio/pdf) for a product (admin only)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        ctype = LessonContentType(content_type)
    except ValueError:
        raise HTTPException(status_code=422, detail="content_type must be one of: video, audio, pdf")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS[ctype]:
        allowed = ", ".join(sorted(ALLOWED_EXTENSIONS[ctype]))
        raise HTTPException(status_code=422, detail=f"Invalid file type for {ctype.value}. Allowed: {allowed}")

    storage_key = f"products/{product_id}/{uuid.uuid4().hex}{ext}"
    storage = get_storage()
    max_bytes = settings.MAX_LESSON_FILE_SIZE_MB * 1024 * 1024
    try:
        size = storage.save(storage_key, file, max_bytes=max_bytes)
    except StorageError as e:
        raise HTTPException(status_code=413, detail=str(e))

    lesson = ProductLesson(
        product_id=product_id,
        title=title,
        description=description,
        content_type=ctype,
        storage_key=storage_key,
        file_size=size,
        order_index=order_index,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.get("/{product_id}/lessons", response_model=List[LessonResponse])
async def list_lessons(product_id: int, db: Session = Depends(get_db)):
    """List a product's lessons (curriculum preview — metadata only, no file access)."""
    return (
        db.query(ProductLesson)
        .filter(ProductLesson.product_id == product_id)
        .order_by(ProductLesson.order_index)
        .all()
    )


@router.put("/{product_id}/lessons/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    product_id: int,
    lesson_id: int,
    payload: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    lesson = (
        db.query(ProductLesson)
        .filter(ProductLesson.id == lesson_id, ProductLesson.product_id == product_id)
        .first()
    )
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if payload.title is not None:
        lesson.title = payload.title
    if payload.description is not None:
        lesson.description = payload.description
    if payload.order_index is not None:
        lesson.order_index = payload.order_index

    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/{product_id}/lessons/{lesson_id}")
async def delete_lesson(
    product_id: int,
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    lesson = (
        db.query(ProductLesson)
        .filter(ProductLesson.id == lesson_id, ProductLesson.product_id == product_id)
        .first()
    )
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    storage = get_storage()
    try:
        storage.delete(lesson.storage_key)
    except StorageError:
        pass

    db.delete(lesson)
    db.commit()
    return {"message": "Lesson deleted"}


@router.post("/{product_id}/lessons/{lesson_id}/access", response_model=LessonAccessResponse)
async def get_lesson_access(
    product_id: int,
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Verify the user purchased this product, then issue a short-lived token
    scoped to this one lesson for use on the streaming URL.
    """
    lesson = (
        db.query(ProductLesson)
        .filter(ProductLesson.id == lesson_id, ProductLesson.product_id == product_id)
        .first()
    )
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    is_admin = current_user.role.value == "admin"
    if not is_admin:
        owns = (
            db.query(Order.id)
            .filter(
                Order.user_id == current_user.id,
                Order.product_id == product_id,
                Order.status == OrderStatus.COMPLETED,
            )
            .first()
        )
        if not owns:
            raise HTTPException(status_code=403, detail="You have not purchased this product")

    token = create_media_token(current_user.id, lesson_id)
    # Path only (no /api prefix) — the frontend joins this with its configured API base,
    # which may or may not be same-origin with the SPA in production.
    stream_url = f"/products/{product_id}/lessons/{lesson_id}/stream?token={token}"
    return LessonAccessResponse(
        token=token,
        stream_url=stream_url,
        expires_in_minutes=settings.MEDIA_TOKEN_EXPIRE_MINUTES,
    )


@router.get("/{product_id}/lessons/{lesson_id}/stream")
async def stream_lesson(
    product_id: int,
    lesson_id: int,
    request: Request,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    """
    Serve the lesson file inline (never as an attachment) with HTTP Range
    support so video/audio can seek. Access is gated by a short-lived token
    from /access, not by cookies/headers a browser can't attach to <video src>.
    """
    payload = decode_media_token(token)
    if not payload or payload.get("lesson_id") != lesson_id:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")

    lesson = (
        db.query(ProductLesson)
        .filter(ProductLesson.id == lesson_id, ProductLesson.product_id == product_id)
        .first()
    )
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    storage = get_storage()
    if not storage.exists(lesson.storage_key):
        raise HTTPException(status_code=404, detail="File not found on server")

    file_size = storage.size(lesson.storage_key)
    media_type = mimetypes.guess_type(lesson.storage_key)[0] or CONTENT_TYPE_DEFAULTS[lesson.content_type]

    headers = {
        "Accept-Ranges": "bytes",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=0, no-store",
    }

    range_header = request.headers.get("range")
    if range_header:
        match = RANGE_RE.match(range_header)
        if not match:
            raise HTTPException(status_code=416, detail="Invalid Range header")
        start = int(match.group(1))
        end = int(match.group(2)) if match.group(2) else file_size - 1
        end = min(end, file_size - 1)
        if start > end or start >= file_size:
            raise HTTPException(status_code=416, detail="Range not satisfiable")
        length = end - start + 1
        headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"
        headers["Content-Length"] = str(length)
        return StreamingResponse(
            storage.open_range(lesson.storage_key, start, length),
            status_code=206,
            media_type=media_type,
            headers=headers,
        )

    headers["Content-Length"] = str(file_size)
    return StreamingResponse(
        storage.open_range(lesson.storage_key, 0, file_size),
        media_type=media_type,
        headers=headers,
    )
