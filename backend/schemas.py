"""
schemas.py - Pydantic Schemas (Data Validation & Serialization)
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        examples=["Alice Johnson"],
    )
    email: EmailStr = Field(
        ...,
        examples=["alice@example.com"],
    )
    age: int = Field(
        ...,
        ge=1,
        le=150,
        examples=[25],
    )


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    age: Optional[int] = Field(None, ge=1, le=150)


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    age: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str
    source: Optional[str] = None
