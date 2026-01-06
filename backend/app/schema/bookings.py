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
    booking_status: BookingStatus

