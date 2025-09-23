from app.crud.vets import get_vets
from sqlmodel import Session,select
from fastapi import APIRouter, Depends, HTTPException
from app.schema.database import get_session
from app.core.security import get_current_user
from app.schema.vets import VetResponse
from app.models.users import Users
from typing import List


router = APIRouter(tags=["vets"])

@router.get("/vets", response_model=List[VetResponse])
async def read_all_vets(
    session: Session = Depends(get_session),
    current_user : Users = Depends(get_current_user)
    ):
    all_vets = get_vets(session=session,user_id=current_user.id)
    return all_vets