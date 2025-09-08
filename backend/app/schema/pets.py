from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List, Optional
from app.schema.database import get_session
from app.models.pets import Pets
from app.models.users import Users
from sqlmodel import SQLModel
from uuid import UUID
from app.core.security import get_current_user

class PetCreate(SQLModel):
    name : str
    species : str
    breed : str | None = None
    date_of_birth : str | None = None
    sex : str | None = None
    notes : str | None = None