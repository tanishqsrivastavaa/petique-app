from sqlmodel import SQLModel
from typing import Any
from uuid import UUID

class VetResponse(SQLModel):
    id: UUID
    clinic_name: str
    specialty: str
    full_name: str
    bio: str
    phone: str
