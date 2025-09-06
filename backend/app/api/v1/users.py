from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List,Optional
from app.schema.database import get_session
from app.models.users import Users
#from app.crud import users as user_crud
from sqlmodel import SQLModel
from passlib.context import CryptContext
from pydantic import EmailStr
from uuid import uuid4,UUID

router = APIRouter()

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

# class UserReadWithRelations(UserRead):
#     pets : List[dict] = []
#     bookings : List[dict] = []

"""password hashing"""
pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")
def hash_password(password:str) -> str:
    return pwd_context.hash(password)



"""API ENDPOINTS HERE"""

@router.post("/users/register")
async def user_register(user_data : UserCreate, session : Session = Depends(get_session)):
    
    #checking if the user already exists or not
    existing_user = session.exec(select(Users).where(Users.email == user_data.email)).first()

    if existing_user:
        raise HTTPException(status_code = status.HTTP_409_CONFLICT,detail  = "Email already registered")

    #hashing password
    hashed_password=  hash_password(user_data.password)

    #Create a new user object

    new_user = Users(
        email = user_data.email,
        full_name = user_data.full_name,
        password_hash = hashed_password
    )


    #saving the new user to db
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {"message" : "User registered succesfully", "id" : new_user.id}