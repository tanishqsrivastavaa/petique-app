from sqlmodel import Field, Relationship
from typing import List, TYPE_CHECKING
from .base import ActiveBaseModel
from .enums import VetSpecialty

if TYPE_CHECKING:
    from .bookings import Bookings
    from .vet_working_hours import VetWorkingHours
    from .vet_time_off import VetTimeOff

class Vets(ActiveBaseModel, table=True):
    __tablename__ = "vets"
    
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
    bookings: List["Bookings"] = Relationship(back_populates="vet")
    working_hours: List["VetWorkingHours"] = Relationship(back_populates="vet")
    time_off: List["VetTimeOff"] = Relationship(back_populates="vet")
