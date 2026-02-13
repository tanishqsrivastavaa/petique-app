from sqlmodel import Field, Relationship
from typing import List, TYPE_CHECKING
from .base import ActiveBaseModel
from .enums import VetSpecialty
from uuid import UUID

if TYPE_CHECKING:
    from .bookings import Bookings
    from .vet_working_hours import VetWorkingHours
    from .vet_time_off import VetTimeOff
    from .users import Users

class Vets(ActiveBaseModel, table=True):
    __tablename__ = "vets"
    
    user_id: UUID = Field(foreign_key="users.id", unique=True, description="Linked user account")
    full_name: str = Field(description="Veterinarian's full name")
    email: str | None = Field(default=None, unique=True, description="Veterinarian's email")
    phone: str | None = Field(default=None, description="Phone number")
    specialty: VetSpecialty = Field(default=VetSpecialty.GENERAL_PRACTICE, description="Medical specialty")
    bio: str | None = Field(default=None, description="Professional biography")
    clinic_name: str | None = Field(default=None, description="Clinic name")
    clinic_address: str | None = Field(default=None, description="Clinic address")
    city: str | None = Field(default=None, description="City")
    state_region: str | None = Field(default=None, description="State or region")
    postal_code: str | None = Field(default=None, description="Postal code")
    country: str | None = Field(default=None, description="Country")
    
    # Relationships
    user: "Users" = Relationship(back_populates="vet_profile")
    bookings: List["Bookings"] = Relationship(back_populates="vet")
    working_hours: List["VetWorkingHours"] = Relationship(back_populates="vet")
    time_off: List["VetTimeOff"] = Relationship(back_populates="vet")
