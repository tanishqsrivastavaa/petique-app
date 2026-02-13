from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.schema.database import get_session
from app.models.users import Users
from passlib.context import CryptContext
from app.core.security import create_access_token, get_current_user
from app.schema.users import UserCreate, UserUpdate, UserResponse, UserLogin
from app.schema.vets import VetRegister, VetResponse, VetCreate
from app.crud.users import get_user_by_email, create_user
from app.crud.vets import create_vet
from app.models.enums import UserRole


router = APIRouter(tags =["users"])


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
    new_user = create_user(session, user_data, hashed_password, role=user_data.role)

    return {"message" : "User registered succesfully", "id" : new_user.id}


@router.post("/vets/register")
async def vet_register(vet_data: VetRegister, session: Session = Depends(get_session)):

    #checking if the user already exists or not
    existing_user = get_user_by_email(session, vet_data.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    #hashing password
    hashed_password = hash_password(vet_data.password)

    #create user account with vet role
    user_create = UserCreate(
        email=vet_data.email,
        full_name=vet_data.full_name,
        password=vet_data.password,
        role=UserRole.VET,
    )
    new_user = create_user(session, user_create, hashed_password, role=UserRole.VET)

    #create linked vet profile
    vet_profile_data = VetCreate(
        specialty=vet_data.specialty,
        bio=vet_data.bio,
        phone=vet_data.phone,
        clinic_name=vet_data.clinic_name,
        clinic_address=vet_data.clinic_address,
        city=vet_data.city,
        state_region=vet_data.state_region,
        postal_code=vet_data.postal_code,
        country=vet_data.country,
    )
    new_vet = create_vet(
        session=session,
        vet_data=vet_profile_data,
        user_id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email,
    )

    return {"message": "Vet registered successfully", "user_id": new_user.id, "vet_id": new_vet.id}


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
    return {"access_token" : access_token, "token_type" : "bearer", "role" : user.role} 


#implementing a protected endpoint
@router.get("/users/me",response_model = UserResponse)
async def read_current_user(current_user : Users = Depends(get_current_user)):
    return current_user
