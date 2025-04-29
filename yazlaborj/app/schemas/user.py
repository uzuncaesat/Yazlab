from pydantic import BaseModel, EmailStr, Field, validator
import re
from typing import Optional
from datetime import datetime

from app.models.user import UserRole

class UserBase(BaseModel):
    tc_kimlik: str
    name: str
    email: EmailStr
    
    @validator('tc_kimlik')
    def validate_tc_kimlik(cls, v):
        if not v.isdigit() or len(v) != 11:
            raise ValueError('TC Kimlik must be 11 digits')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.CANDIDATE

class UserLogin(BaseModel):
    tc_kimlik: str
    password: str
    
    @validator('tc_kimlik')
    def validate_tc_kimlik(cls, v):
        if not v.isdigit() or len(v) != 11:
            raise ValueError('TC Kimlik must be 11 digits')
        return v

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    birth_date: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    phone: Optional[str] = None
    address: Optional[str] = None
    birth_date: Optional[str] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[UserRole] = None
