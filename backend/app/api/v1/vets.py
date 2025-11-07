from app.crud.vets import get_vets,get_vet_by_id
from sqlmodel import Session
from fastapi import APIRouter, Depends, HTTPException
from app.schema.database import get_session
from app.core.security import get_current_user
from app.schema.vets import VetResponse
from app.models.users import Users
from typing import List
from uuid import UUID
from app.schema.vet_working_hours import VetWorkingHoursCreate
from app.crud.vet_working_hours import create_working_hour

router = APIRouter(tags=["vets"])

@router.get("/vets", response_model=List[VetResponse])
async def read_all_vets(
    session: Session = Depends(get_session),
    current_user : Users = Depends(get_current_user)
    ):
    all_vets = get_vets(session=session,user_id=current_user.id)
    return all_vets


@router.get("/vets/{vet_id}", response_model=VetResponse)
async def read_vet_by_id(
    user_id: UUID,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user)
):

    specific_vet = get_vet_by_id(session = session,user_id = current_user.id,vet_id = vet_id)
    if not specific_vet:
        raise HTTPException(status_code=404, detail = "Vet not found.")
    return specific_vet


@router.post("/vets/working_hour_create")
async def create_vet_working_hour(
    new_vet_time : VetWorkingHoursCreate,
    session : Session = Depends(get_session),
    current_user : Users = Depends(get_current_user)
):
    vet = create_working_hour(
        session=session,
        vet_working_time_create=new_vet_time,
        user_id=current_user.id,
    )
    if not vet:
        raise HTTPException(status_code=404, detail="Vet not found.")
    return vet
    