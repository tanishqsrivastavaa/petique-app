from sqlmodel import Field, Relationship
from typing import List, TYPE_CHECKING
from .base import ActiveBaseModel

# if TYPE_CHECKING:
#     from .pets import Pets
#     from .bookings import Bookings

class Users(ActiveBaseModel, table=True):
    __tablename__ = "users"
    
    email: str = Field(unique=True, description="User's email address")
    full_name: str = Field(description="User's full name")
    password_hash: str | None = Field(default=None)
    
    # # Relationships
    # pets: List["Pets"] = Relationship(back_populates="user")
    # bookings: List["Bookings"] = Relationship(back_populates="user")


