from sqlmodel import SQLModel
from uuid import UUID
from app.models.enums import DayOfWeek
from datetime import time

class VetWorkingHoursCreate(SQLModel):
    day : DayOfWeek
    start_time: time
    end_time: time

class VetWorkingHoursResponse(SQLModel):
    id: UUID
    vet_id: UUID
    day: DayOfWeek
    start_time: time
    end_time: time
    is_active: bool