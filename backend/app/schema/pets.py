from sqlmodel import SQLModel
from uuid import UUID
from datetime import date

class PetCreate(SQLModel):
    name : str
    species : str
    breed : str | None = None
    date_of_birth : date | None = None
    sex : str | None = None
    notes : str | None = None

class PetUpdate(SQLModel):
    name: str | None = None
    species: str | None = None
    breed: str | None = None
    date_of_birth: date | None = None
    sex: str | None = None
    notes: str | None = None

class PetResponse(SQLModel):
    id: UUID
    user_id: UUID
    name: str
    species: str
    breed: str | None = None
    date_of_birth: date | None = None
    sex: str | None = None
    notes: str | None = None