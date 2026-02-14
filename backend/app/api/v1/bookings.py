from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session, select

from app.core.security import get_current_user, get_current_vet_profile
from app.crud.bookings import (
    create_booking,
    delete_booking,
    get_booking_by_id,
    get_booking_by_id_for_vet,
    list_bookings_for_user,
    list_bookings_for_vet,
    update_booking,
)
from app.models.pets import Pets
from app.models.users import Users
from app.models.vets import Vets
from app.schema.bookings import (
    BookingCreate,
    BookingResponse,
    BookingUpdate,
    VetBookingDetailResponse,
    VetBookingStatusUpdate,
    PetSummary,
    OwnerSummary,
)
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


@router.get("/bookings/vet/{booking_id}", response_model=VetBookingDetailResponse)
async def get_vet_booking_detail(
    booking_id: UUID,
    session: Session = Depends(get_session),
    vet: Vets = Depends(get_current_vet_profile),
):
    booking = get_booking_by_id_for_vet(session=session, booking_id=booking_id, vet_id=vet.id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    pet = session.exec(select(Pets).where(Pets.id == booking.pet_id)).first()
    owner = session.exec(select(Users).where(Users.id == booking.user_id)).first()

    return VetBookingDetailResponse(
        id=booking.id,
        pet_id=booking.pet_id,
        vet_id=booking.vet_id,
        user_id=booking.user_id,
        start_at=booking.start_at,
        end_at=booking.end_at,
        reason=booking.reason,
        booking_status=booking.booking_status,
        pet=PetSummary(
            id=pet.id,
            name=pet.name,
            species=pet.species,
            breed=pet.breed,
            date_of_birth=str(pet.date_of_birth) if pet.date_of_birth else None,
            sex=pet.sex,
            notes=pet.notes,
        ),
        owner=OwnerSummary(
            id=owner.id,
            full_name=owner.full_name,
            email=owner.email,
        ),
    )


@router.patch("/bookings/vet/{booking_id}", response_model=BookingResponse)
async def update_vet_booking_status(
    booking_id: UUID,
    status_in: VetBookingStatusUpdate,
    session: Session = Depends(get_session),
    vet: Vets = Depends(get_current_vet_profile),
):
    booking = get_booking_by_id_for_vet(session=session, booking_id=booking_id, vet_id=vet.id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    booking.booking_status = status_in.booking_status
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


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

