from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List, Optional
from app.schema.database import get_session
from app.models.pets import Pets
from app.models.users import Users
from sqlmodel import SQLModel
from uuid import UUID
from app.core.security import get_current_user
from app.schema.pets import PetCreate
from app.crud.pets import create_pet

router = APIRouter(tags=["pets"])

@router.post("/pets/",status_code=status.HTTP_201_CREATED)
async def create_new_pet(
    pet_data : PetCreate,
    current_user : Users = Depends(get_current_user),
    session : Session = Depends(get_session)
):
    new_pet = create_pet(session = session, pet_data = pet_data,user_id = current_user.id)
    return new_pet