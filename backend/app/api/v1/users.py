from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List,Optional
from app.schema.database import get_session
from app.models.users import Users
#from app.crud import users as user_crud
from sqlmodel import SQLModel
from pydantic import EmailStr


router = APIRouter()

class UserCreate(SQLModel):
    email : EmailStr
    full_name : str
    password : str

class UserUpdate(SQLModel):
    email:Optional[EmailStr] = None
    full_name : Optional[str] = None
    password : Optional[str] = None

class UserRead(SQLModel):
    id : UUID
    email : str
    full_name : str
    is_active : bool
    created_at : str
    updated_at : str

class UserReadWithRelations(UserRead):
    pets : List[dict] = []
    bookings : List[dict] = []


#@router.post("/",response)