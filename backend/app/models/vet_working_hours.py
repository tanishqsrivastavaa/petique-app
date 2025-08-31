from sqlmodel import Field, Relationship
from datetime import time
from uuid import UUID
from typing import TYPE_CHECKING
from .base import BaseModel
from .enums import DayOfWeek

if TYPE_CHECKING:
    from .vets import Vets

class VetWorkingHours(BaseModel, table=True):
    __tablename__ = "vet_working_hours"
    
    vet_id: UUID = Field(foreign_key="vets.id", description="Veterinarian ID")
    day: DayOfWeek = Field(description="Day of the week")
    start_time: time = Field(description="Start time for the day")
    end_time: time = Field(description="End time for the day")
    is_active: bool = Field(default=True, description="Whether this schedule is active")
    
    # Relationships
    vet: "Vets" = Relationship(back_populates="working_hours")
