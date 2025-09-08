from sqlmodel import Field, Relationship
from datetime import datetime
from uuid import UUID
from typing import TYPE_CHECKING
from .base import BaseModel
from .enums import BookingStatus

if TYPE_CHECKING:
    from .users import Users
    from .pets import Pets
    from .vets import Vets

class Bookings(BaseModel, table=True):
    __tablename__ = "bookings"
    
    user_id: UUID = Field(foreign_key="users.id", description="User who made the booking")
    pet_id: UUID = Field(foreign_key="pets.id", description="Pet being treated")
    vet_id: UUID = Field(foreign_key="vets.id", description="Veterinarian assigned")
    start_at: datetime = Field(description="Appointment start time")
    end_at: datetime = Field(description="Appointment end time")
    status: BookingStatus = Field(default=BookingStatus.PENDING, description="Booking status")
    reason: str | None = Field(default=None, description="Reason for appointment")
    
    # Relationships
    user: "Users" = Relationship(back_populates="bookings")
    pet: "Pets" = Relationship(back_populates="bookings")
    vet: "Vets" = Relationship(back_populates="bookings")
