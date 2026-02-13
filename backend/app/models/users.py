from sqlmodel import Field, Relationship
from typing import List, Optional, TYPE_CHECKING
from .base import ActiveBaseModel
from .enums import UserRole

if TYPE_CHECKING:
    from .pets import Pets
    from .bookings import Bookings
    from .vets import Vets

class Users(ActiveBaseModel, table=True):
    __tablename__ = "users"
    
    email: str = Field(unique=True, description="User's email address")
    full_name: str = Field(description="User's full name")
    password_hash: str | None = Field(default=None)
    role: UserRole = Field(default=UserRole.OWNER, description="User role (owner or vet)")
    
    # Relationships
    pets: List["Pets"] = Relationship(back_populates="owner")
    bookings: List["Bookings"] = Relationship(back_populates="user")
    vet_profile: Optional["Vets"] = Relationship(back_populates="user")
