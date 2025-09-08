from sqlmodel import SQLModel
from pydantic import EmailStr
from typing import Optional,Any
from uuid import UUID

class UserCreate(SQLModel):
    email : EmailStr
    full_name : str
    password : str

class UserUpdate(SQLModel):
    email:Optional[str] = None
    full_name : Optional[str] = None
    password : Optional[str] = None

class UserResponse(SQLModel):
    id : UUID
    email : EmailStr
    full_name : str

class UserLogin(SQLModel):
    email : EmailStr
    password : str


class UserInDB(UserResponse):
    password_hash : str