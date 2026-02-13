from datetime import datetime, timedelta
from typing import Any
from jose import jwt, JWTError
from fastapi import HTTPException,status, Depends
from app.models.users import Users
from app.models.vets import Vets
from app.models.enums import UserRole
from sqlmodel import Session,select
from fastapi.security import HTTPBearer
from app.schema.database import get_session
import os
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("jwt_token_secret_key")
ALGORITHM = "HS256" #HMAC using SHA-256 hash algorithm
EXP_TOKEN = 30 #30 minutes

bearer_scheme = HTTPBearer()

def create_access_token(data : dict, expires_delta : timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now()+expires_delta
    else:
        expire = datetime.now() + timedelta(minutes = EXP_TOKEN)
    
    to_encode.update({"exp":expire})

    encoded_jwt = jwt.encode(to_encode,SECRET_KEY,algorithm = ALGORITHM)
    return encoded_jwt

def verify_token(token : str) -> dict[str,Any]:
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED,detail = "Could not validate credentials")



def get_current_user(token:str = Depends(bearer_scheme),session : Session = Depends(get_session)):
    try:
        token_string = token.credentials

        payload = jwt.decode(token_string,SECRET_KEY,algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code = status.HTTP_401_UNAUTHORIZED,
                detail = "Invalid authentication credentials"
            ,)

    #querying the db to get user object
        user = session.exec(select(Users).where(Users.id == user_id)).first()
        if user is None:
                raise HTTPException(
                    status_code = status.HTTP_401_UNAUTHORIZED,
                    detail = "User not found"
                ,)

        return user
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


def require_owner(current_user: Users = Depends(get_current_user)):
    if current_user.role != UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only pet owners can access this resource",
        )
    return current_user


def require_vet(current_user: Users = Depends(get_current_user)):
    if current_user.role != UserRole.VET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only veterinarians can access this resource",
        )
    return current_user


def get_current_vet_profile(
    current_user: Users = Depends(require_vet),
    session: Session = Depends(get_session),
):
    vet = session.exec(select(Vets).where(Vets.user_id == current_user.id)).first()
    if not vet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vet profile not found",
        )
    return vet
