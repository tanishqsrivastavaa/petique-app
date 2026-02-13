from sqlmodel import SQLModel
from uuid import UUID
from datetime import datetime

class VetTimeOffCreate(SQLModel):
    start_at: datetime
    end_at: datetime
    reason: str | None = None

class VetTimeOffResponse(SQLModel):
    id: UUID
    vet_id: UUID
    start_at: datetime
    end_at: datetime
    reason: str | None = None
