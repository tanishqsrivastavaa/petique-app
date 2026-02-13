from sqlmodel import Session, select
from app.models.vet_time_off import VetTimeOff
from app.schema.vet_time_off import VetTimeOffCreate
from typing import List, Optional
from uuid import UUID

def create_time_off(session: Session, time_off_data: VetTimeOffCreate, vet_id: UUID) -> VetTimeOff:
    new_time_off = VetTimeOff(
        vet_id=vet_id,
        **time_off_data.model_dump(),
    )
    session.add(new_time_off)
    session.commit()
    session.refresh(new_time_off)
    return new_time_off

def get_time_off_by_vet(session: Session, vet_id: UUID) -> List[VetTimeOff]:
    return session.exec(
        select(VetTimeOff).where(VetTimeOff.vet_id == vet_id)
    ).all()

def get_time_off_by_id(session: Session, time_off_id: UUID) -> Optional[VetTimeOff]:
    return session.exec(
        select(VetTimeOff).where(VetTimeOff.id == time_off_id)
    ).first()

def delete_time_off(session: Session, time_off: VetTimeOff) -> None:
    session.delete(time_off)
    session.commit()
