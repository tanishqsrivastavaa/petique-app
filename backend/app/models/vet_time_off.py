from sqlmodel import Field, Relationship
from datetime import datetime
from uuid import UUID
from typing import TYPE_CHECKING
from .base import BaseModel

if TYPE_CHECKING:
    from .vets import Vets

class VetTimeOff(BaseModel, table=True):
    __tablename__ = "vet_time_off"
    
    vet_id: UUID = Field(foreign_key="vets.id", description="Veterinarian ID")
    start_at: datetime = Field(description="Time off start")
    end_at: datetime = Field(description="Time off end")
    reason: str | None = Field(default=None, description="Reason for time off")
    
    # Relationships
    vet: "Vets" = Relationship(back_populates="time_off")