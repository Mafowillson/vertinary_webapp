import re
from pydantic import BaseModel, ConfigDict, EmailStr, Field, computed_field, field_validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must include at least one uppercase letter")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must include at least one lowercase letter")
        if not re.search(r"\d", value):
            raise ValueError("Password must include at least one number")
        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError("Password must include at least one special character")
        return value

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserLanguageUpdate(BaseModel):
    language: str

    @field_validator("language")
    @classmethod
    def language_must_be_supported(cls, value: str) -> str:
        from app.i18n import SUPPORTED_LANGUAGES

        code = value.strip().lower().split("-")[0]
        if code not in SUPPORTED_LANGUAGES:
            raise ValueError("language must be one of: " + ", ".join(SUPPORTED_LANGUAGES))
        return code

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    is_active: bool
    is_verified: bool
    preferred_language: str
    created_at: datetime

    @computed_field
    @property
    def isActive(self) -> bool:
        return self.is_active

    @computed_field
    @property
    def createdAt(self) -> datetime:
        return self.created_at

    @computed_field
    @property
    def isVerified(self) -> bool:
        return self.is_verified

    @computed_field
    @property
    def preferredLanguage(self) -> str:
        return self.preferred_language


class AdminUserResponse(UserResponse):
    """UserResponse plus admin-only aggregate (order count)."""

    orders_count: int = 0

    @computed_field
    @property
    def ordersCount(self) -> int:
        return self.orders_count


class UserStatusUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    is_active: bool = Field(..., alias="isActive")


class UserRoleUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    role: str

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, value: str) -> str:
        if value not in ("user", "admin"):
            raise ValueError("role must be 'user' or 'admin'")
        return value

