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
from app.core.security import get_current_user
from app.schema.users import UserCreate,UserUpdate,UserResponse, UserLogin, UserInDB
from app.crud.users import get_user_by_email,create_user
from dotenv import load_dotenv
load_dotenv()


router = APIRouter(tags =["users"])


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
    existing_user = get_user_by_email(session,user_data.email)

    if existing_user:
        raise HTTPException(status_code = status.HTTP_409_CONFLICT,detail  = "Email already registered")

    #hashing password
    hashed_password=  hash_password(user_data.password)

    #Create a new user object

    new_user = create_user(session,user_data,hashed_password)

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


#implementing a protected endpoint
@router.get("/users/me",response_model = UserResponse)
async def read_current_user(current_user : Users = Depends(get_current_user)):
    return current_user
