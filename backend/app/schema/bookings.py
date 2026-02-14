from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlmodel import SQLModel, Field
from pydantic import ConfigDict

from app.models.enums import BookingStatus


class BookingBase(SQLModel):
    pet_id: UUID = Field(description="ID of the pet for the appointment")
    vet_id: UUID = Field(description="ID of the vet for the appointment")
    start_at: datetime = Field(description="Appointment start time")
    end_at: datetime = Field(description="Appointment end time")
    reason: Optional[str] = Field(default=None, description="Reason for the visit")


class BookingCreate(BookingBase):
    pass


class BookingUpdate(SQLModel):
    pet_id: Optional[UUID] = None
    vet_id: Optional[UUID] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    booking_status: Optional[BookingStatus] = None
    reason: Optional[str] = None


class BookingResponse(BookingBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    booking_status: BookingStatus


class PetSummary(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    species: str
    breed: Optional[str] = None
    date_of_birth: Optional[str] = None
    sex: Optional[str] = None
    notes: Optional[str] = None


class OwnerSummary(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: str


class VetBookingDetailResponse(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    pet_id: UUID
    vet_id: UUID
    user_id: UUID
    start_at: datetime
    end_at: datetime
    reason: Optional[str] = None
    booking_status: BookingStatus
    pet: PetSummary
    owner: OwnerSummary


class VetBookingStatusUpdate(SQLModel):
    booking_status: BookingStatus

