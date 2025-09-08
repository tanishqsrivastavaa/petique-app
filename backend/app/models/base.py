from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional

class BaseModel(SQLModel):
    id : UUID | None = Field(
        default_factory=uuid4,
        primary_key=True
    )

    created_at : datetime = Field(
        default_factory= datetime.now
    )

    updated_at : datetime = Field(
        default_factory=datetime.now
    )

class ActiveBaseModel(BaseModel):
    is_active : bool = Field(
        default=True
    )

class TimestampMixin(SQLModel):
    """
    Mixin for models that only need timestamp fields without UUID id.
    Useful for junction tables or models with custom primary keys.
    """
    created_at: datetime = Field(
        default_factory=datetime.now
    )
    updated_at: datetime = Field(
        default_factory=datetime.now
    )