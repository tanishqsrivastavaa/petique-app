from sqlmodel import Field, Relationship, Column
from datetime import datetime
from uuid import UUID,uuid4
from typing import TYPE_CHECKING
from .base import BaseModel
from .enums import BookingStatus
from sqlalchemy import Column, Enum as SAEnum, TIMESTAMP

if TYPE_CHECKING:
    from .users import Users
    from .pets import Pets
    from .vets import Vets

class Bookings(BaseModel, table=True):
    __tablename__ = "bookings"

    id : UUID = Field(default_factory = uuid4,primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", description="User who made the booking")
    pet_id: int = Field(foreign_key="pets.id")
    vet_id: UUID = Field(foreign_key="vets.id")
    start_at: datetime = Field(sa_column = Column(TIMESTAMP(timezone = True),nullable=False),description="Appointment start time")
    end_at: datetime = Field(sa_column = Column(TIMESTAMP(timezone = True),nullable=False),description="Appointment end time")
    booking_status: BookingStatus = Field(default=BookingStatus.PENDING, description="Booking status")
    reason: str | None = Field(default=None, description="Reason for appointment")
    
    # Relationships
    user: "Users" = Relationship(back_populates="bookings")
    pet: "Pets" = Relationship(back_populates="bookings")
    vet: "Vets" = Relationship(back_populates="bookings")
