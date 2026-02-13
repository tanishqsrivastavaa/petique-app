from sqlmodel import SQLModel
from typing import Optional
from uuid import UUID
from app.models.enums import VetSpecialty

class VetCreate(SQLModel):
    specialty: VetSpecialty = VetSpecialty.GENERAL_PRACTICE
    bio: str | None = None
    phone: str | None = None
    clinic_name: str | None = None
    clinic_address: str | None = None
    city: str | None = None
    state_region: str | None = None
    postal_code: str | None = None
    country: str | None = None

class VetUpdate(SQLModel):
    specialty: Optional[VetSpecialty] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    city: Optional[str] = None
    state_region: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None

class VetRegister(SQLModel):
    email: str
    full_name: str
    password: str
    specialty: VetSpecialty = VetSpecialty.GENERAL_PRACTICE
    bio: str | None = None
    phone: str | None = None
    clinic_name: str | None = None
    clinic_address: str | None = None
    city: str | None = None
    state_region: str | None = None
    postal_code: str | None = None
    country: str | None = None

class VetResponse(SQLModel):
    id: UUID
    full_name: str
    email: str | None = None
    phone: str | None = None
    specialty: VetSpecialty
    bio: str | None = None
    clinic_name: str | None = None
    clinic_address: str | None = None
    city: str | None = None
    state_region: str | None = None
    postal_code: str | None = None
    country: str | None = None
