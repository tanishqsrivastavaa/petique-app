from sqlmodel import SQLModel
from uuid import UUID
from app.models.enums import DayOfWeek
from datetime import time

class VetWorkingHoursCreate(SQLModel):
    id : UUID
    day : DayOfWeek
    start_time: time
    end_time:  time

    