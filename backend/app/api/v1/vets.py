from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session
from typing import List
from uuid import UUID
from app.schema.database import get_session
from app.core.security import get_current_user, require_vet, get_current_vet_profile
from app.schema.vets import VetResponse, VetUpdate
from app.schema.vet_working_hours import VetWorkingHoursCreate, VetWorkingHoursResponse
from app.schema.vet_time_off import VetTimeOffCreate, VetTimeOffResponse
from app.models.users import Users
from app.models.vets import Vets
from app.crud.vets import get_vets, get_vet_by_id, update_vet
from app.crud.vet_working_hours import (
    create_working_hour,
    get_working_hours_by_vet,
    get_working_hour_by_id,
    delete_working_hour,
)
from app.crud.vet_time_off import (
    create_time_off,
    get_time_off_by_vet,
    get_time_off_by_id,
    delete_time_off,
)

router = APIRouter(tags=["vets"])


# ── Public / any authenticated user ──────────────────────────────────────────

@router.get("/vets", response_model=List[VetResponse])
async def read_all_vets(
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user),
):
    return get_vets(session=session)


@router.get("/vets/me", response_model=VetResponse)
async def read_own_vet_profile(
    vet: Vets = Depends(get_current_vet_profile),
):
    return vet


@router.get("/vets/{vet_id}", response_model=VetResponse)
async def read_vet_by_id(
    vet_id: UUID,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user),
):
    specific_vet = get_vet_by_id(session=session, vet_id=vet_id)
    if not specific_vet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vet not found.")
    return specific_vet


# ── Vet self-management ──────────────────────────────────────────────────────

@router.patch("/vets/me", response_model=VetResponse)
async def update_own_vet_profile(
    vet_data: VetUpdate,
    vet: Vets = Depends(get_current_vet_profile),
    session: Session = Depends(get_session),
):
    return update_vet(session=session, vet=vet, vet_data=vet_data)


# ── Working Hours ────────────────────────────────────────────────────────────

@router.post("/vets/me/working-hours", response_model=VetWorkingHoursResponse, status_code=status.HTTP_201_CREATED)
async def create_vet_working_hour(
    new_vet_time: VetWorkingHoursCreate,
    vet: Vets = Depends(get_current_vet_profile),
    session: Session = Depends(get_session),
):
    return create_working_hour(session=session, vet_working_time_create=new_vet_time, vet_id=vet.id)


@router.get("/vets/{vet_id}/working-hours", response_model=List[VetWorkingHoursResponse])
async def read_vet_working_hours(
    vet_id: UUID,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user),
):
    vet = get_vet_by_id(session=session, vet_id=vet_id)
    if not vet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vet not found.")
    return get_working_hours_by_vet(session=session, vet_id=vet_id)


@router.delete("/vets/me/working-hours/{working_hour_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vet_working_hour(
    working_hour_id: UUID,
    vet: Vets = Depends(get_current_vet_profile),
    session: Session = Depends(get_session),
):
    working_hour = get_working_hour_by_id(session=session, working_hour_id=working_hour_id)
    if not working_hour or working_hour.vet_id != vet.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Working hour not found.")
    delete_working_hour(session=session, working_hour=working_hour)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ── Time Off ─────────────────────────────────────────────────────────────────

@router.post("/vets/me/time-off", response_model=VetTimeOffResponse, status_code=status.HTTP_201_CREATED)
async def create_vet_time_off(
    time_off_data: VetTimeOffCreate,
    vet: Vets = Depends(get_current_vet_profile),
    session: Session = Depends(get_session),
):
    if time_off_data.start_at >= time_off_data.end_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_at must be before end_at.",
        )
    return create_time_off(session=session, time_off_data=time_off_data, vet_id=vet.id)


@router.get("/vets/{vet_id}/time-off", response_model=List[VetTimeOffResponse])
async def read_vet_time_off(
    vet_id: UUID,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user),
):
    vet = get_vet_by_id(session=session, vet_id=vet_id)
    if not vet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vet not found.")
    return get_time_off_by_vet(session=session, vet_id=vet_id)


@router.delete("/vets/me/time-off/{time_off_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vet_time_off(
    time_off_id: UUID,
    vet: Vets = Depends(get_current_vet_profile),
    session: Session = Depends(get_session),
):
    time_off = get_time_off_by_id(session=session, time_off_id=time_off_id)
    if not time_off or time_off.vet_id != vet.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Time off not found.")
    delete_time_off(session=session, time_off=time_off)
    return Response(status_code=status.HTTP_204_NO_CONTENT)