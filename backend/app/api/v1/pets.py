from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session
from typing import List
from app.schema.database import get_session
from app.core.security import get_current_user, require_owner
from app.schema.pets import PetCreate, PetResponse, PetUpdate
from app.models.users import Users
from app.crud.pets import create_pet, get_pets_by_user, get_pet_by_id, update_pet, delete_pet
from uuid import UUID

router = APIRouter(tags=["pets"])

@router.post("/pets/", status_code=status.HTTP_201_CREATED, response_model=PetResponse)
async def create_new_pet(
    pet_data : PetCreate,
    current_user : Users = Depends(require_owner),
    session : Session = Depends(get_session)
):
    new_pet = create_pet(session=session, pet_data=pet_data, user_id=current_user.id)
    return new_pet


@router.get("/pets", response_model=List[PetResponse])
async def list_pets(
    current_user: Users = Depends(require_owner),
    session: Session = Depends(get_session),
):
    return get_pets_by_user(session=session, user_id=current_user.id)


@router.get("/pets/{pet_id}", response_model=PetResponse)
async def get_pet(
    pet_id: UUID,
    current_user: Users = Depends(require_owner),
    session: Session = Depends(get_session),
):
    pet = get_pet_by_id(session=session, pet_id=pet_id, user_id=current_user.id)
    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found.")
    return pet


@router.patch("/pets/{pet_id}", response_model=PetResponse)
async def update_existing_pet(
    pet_id: UUID,
    pet_data: PetUpdate,
    current_user: Users = Depends(require_owner),
    session: Session = Depends(get_session),
):
    pet = get_pet_by_id(session=session, pet_id=pet_id, user_id=current_user.id)
    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found.")
    return update_pet(session=session, pet=pet, pet_data=pet_data)


@router.delete("/pets/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_pet(
    pet_id: UUID,
    current_user: Users = Depends(require_owner),
    session: Session = Depends(get_session),
):
    pet = get_pet_by_id(session=session, pet_id=pet_id, user_id=current_user.id)
    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found.")
    delete_pet(session=session, pet=pet)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
