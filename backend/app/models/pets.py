from sqlmodel import Field, Relationship
from .base import BaseModel
from datetime import date, datetime
from uuid import UUID,uuid4
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .users import Users
    from .bookings import Bookings

class Pets(BaseModel, table=True):
    __tablename__ = "pets"
    id: UUID = Field(default_factory=uuid4, primary_key=True, nullable=False)
    name: str = Field(description="Pet's name")
    species: str = Field(description="Pet's species (dog, cat, etc.)")
    breed: str | None = Field(default=None, description="Pet's breed")
    date_of_birth: date | None = Field(default=None, description="Pet's date of birth")
    sex: str | None = Field(default=None, description="Pet's sex")
    notes: str | None = Field(default=None, description="Additional notes about the pet")
    
    # Relationships - use string references
    user_id: UUID = Field(foreign_key="users.id")
    owner: "Users" = Relationship(back_populates="pets")
    bookings: List["Bookings"] = Relationship(back_populates="pet")
