from typing import List, Optional
from uuid import UUID

from sqlmodel import Session, select

from app.models.bookings import Bookings
from app.schema.bookings import BookingCreate, BookingUpdate


def list_bookings_for_user(session: Session, user_id: UUID) -> List[Bookings]:
    statement = select(Bookings).where(Bookings.user_id == user_id)
    return session.exec(statement).all()


def list_bookings_for_vet(session: Session, vet_id: UUID) -> List[Bookings]:
    statement = select(Bookings).where(Bookings.vet_id == vet_id)
    return session.exec(statement).all()


def get_booking_by_id(session: Session, booking_id: UUID, user_id: UUID) -> Optional[Bookings]:
    statement = select(Bookings).where(
        Bookings.id == booking_id,
        Bookings.user_id == user_id,
    )
    return session.exec(statement).first()


def create_booking(session: Session, booking_in: BookingCreate, user_id: UUID) -> Bookings:
    booking = Bookings(user_id=user_id, **booking_in.model_dump())
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


def update_booking(session: Session, booking: Bookings, booking_in: BookingUpdate) -> Bookings:
    update_data = booking_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


def delete_booking(session: Session, booking: Bookings) -> None:
    session.delete(booking)
    session.commit()

