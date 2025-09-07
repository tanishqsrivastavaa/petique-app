from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List,Optional
from app.schema.database import get_session
from app.models.users import Users
from sqlmodel import SQLModel
from passlib.context import CryptContext
from pydantic import EmailStr
from uuid import uuid4,UUID
from app.core.security import create_access_token
from dotenv import load_dotenv
load_dotenv()


router = APIRouter(tags =["users"])

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




@router.post("/auth/login")
async def user_login(user_data : UserLogin, session:Session = Depends(get_session)):
    #checking if the user exists or not
    user = session.exec(select(Users).where(Users.email == user_data.email)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail = "Incorrect email or password",
        )

    #verifying password
    if not pwd_context.verify(user_data.password , user.password_hash):
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail = "Incorrect email or password",
        )

    #creating JWT token
    access_token = create_access_token(
        data = {"sub" : str(user.id)}
    )

    #returning the access token to the client
    return {"access_token" : access_token, "token_type" : "bearer"} 