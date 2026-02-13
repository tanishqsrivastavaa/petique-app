from sqlmodel import SQLModel
from pydantic import EmailStr
from typing import Optional
from uuid import UUID
from app.models.enums import UserRole

class UserCreate(SQLModel):
    email : EmailStr
    full_name : str
    password : str
    role : UserRole = UserRole.OWNER

class UserUpdate(SQLModel):
    email: Optional[str] = None
    full_name : Optional[str] = None
    password : Optional[str] = None

class UserResponse(SQLModel):
    id : UUID
    email : EmailStr
    full_name : str
    role : UserRole

class UserLogin(SQLModel):
    email : EmailStr
    password : str

class UserInDB(UserResponse):
    password_hash : str