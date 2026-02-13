from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session, select

from app.core.security import get_current_user, get_current_vet_profile
from app.crud.bookings import (
    create_booking,
    delete_booking,
    get_booking_by_id,
    list_bookings_for_user,
    list_bookings_for_vet,
    update_booking,
)
from app.models.pets import Pets
from app.models.users import Users
from app.models.vets import Vets
from app.schema.bookings import BookingCreate, BookingResponse, BookingUpdate
from app.schema.database import get_session


router = APIRouter(tags=["bookings"])


@router.get("/bookings", response_model=List[BookingResponse])
async def list_bookings(
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user),
):
    return list_bookings_for_user(session=session, user_id=current_user.id)


@router.get("/bookings/vet", response_model=List[BookingResponse])
async def list_vet_bookings(
    session: Session = Depends(get_session),
    vet: Vets = Depends(get_current_vet_profile),
):
    return list_bookings_for_vet(session=session, vet_id=vet.id)


@router.get("/bookings/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: UUID,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user),
):
    booking = get_booking_by_id(session=session, booking_id=booking_id, user_id=current_user.id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")
    return booking


@router.post("/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_new_booking(
    booking_in: BookingCreate,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user),
):
    if booking_in.start_at >= booking_in.end_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_at must be before end_at.",
        )

    pet = session.exec(
        select(Pets).where(Pets.id == booking_in.pet_id, Pets.user_id == current_user.id)
    ).first()
    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found.")

    vet = session.exec(select(Vets).where(Vets.id == booking_in.vet_id, Vets.is_active == True)).first()
    if not vet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vet not found or inactive.")

    booking = create_booking(session=session, booking_in=booking_in, user_id=current_user.id)
    return booking


@router.patch("/bookings/{booking_id}", response_model=BookingResponse)
async def update_existing_booking(
    booking_id: UUID,
    booking_in: BookingUpdate,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user),
):
    booking = get_booking_by_id(session=session, booking_id=booking_id, user_id=current_user.id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    if booking_in.pet_id:
        pet = session.exec(
            select(Pets).where(Pets.id == booking_in.pet_id, Pets.user_id == current_user.id)
        ).first()
        if not pet:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found.")

    if booking_in.vet_id:
        vet = session.exec(select(Vets).where(Vets.id == booking_in.vet_id, Vets.is_active == True)).first()
        if not vet:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vet not found or inactive.")

    next_start = booking_in.start_at or booking.start_at
    next_end = booking_in.end_at or booking.end_at
    if next_start >= next_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_at must be before end_at.",
        )

    return update_booking(session=session, booking=booking, booking_in=booking_in)


@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_booking_endpoint(
    booking_id: UUID,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user),
):
    booking = get_booking_by_id(session=session, booking_id=booking_id, user_id=current_user.id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    delete_booking(session=session, booking=booking)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

