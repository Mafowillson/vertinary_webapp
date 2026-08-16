import base64
import hashlib
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

PASSWORD_HASH_PREFIX = "bcrypt_sha256$"


def _bcrypt_sha256_secret(password: str) -> bytes:
    """Pre-hash before bcrypt so long passwords are handled safely."""
    digest = hashlib.sha256(password.encode("utf-8")).digest()
    return base64.b64encode(digest)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        if hashed_password.startswith(PASSWORD_HASH_PREFIX):
            stored_hash = hashed_password[len(PASSWORD_HASH_PREFIX) :].encode("utf-8")
            return bcrypt.checkpw(_bcrypt_sha256_secret(plain_password), stored_hash)

        # Backward compatibility for existing raw bcrypt hashes.
        if hashed_password.startswith("$2"):
            return bcrypt.checkpw(
                plain_password.encode("utf-8"), hashed_password.encode("utf-8")
            )
        return False
    except (ValueError, TypeError):
        return False


def get_password_hash(password: str) -> str:
    """Hash a password."""
    hashed = bcrypt.hashpw(_bcrypt_sha256_secret(password), bcrypt.gensalt())
    return f"{PASSWORD_HASH_PREFIX}{hashed.decode('utf-8')}"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    to_encode["kind"] = "access"
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT refresh token (long-lived; not accepted as a Bearer for API routes)."""
    to_encode = data.copy()
    to_encode["kind"] = "refresh"
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT access token (rejects refresh tokens)."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("kind") == "refresh":
            return None
        return payload
    except JWTError:
        return None


def decode_refresh_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT refresh token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("kind") != "refresh":
            return None
        return payload
    except JWTError:
        return None


def create_media_token(user_id: int, lesson_id: int) -> str:
    """
    Short-lived token scoped to a single lesson, for use as a query param on
    <video>/<audio>/<iframe> src URLs, which cannot carry an Authorization header.
    """
    to_encode = {
        "kind": "media",
        "sub": str(user_id),
        "lesson_id": lesson_id,
        "exp": datetime.utcnow() + timedelta(minutes=settings.MEDIA_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_media_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("kind") != "media":
            return None
        return payload
    except JWTError:
        return None

