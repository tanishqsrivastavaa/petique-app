from app.schema.vet_working_hours import VetWorkingHoursCreate
from sqlmodel import Session, select
from app.models.vet_working_hours import VetWorkingHours
from typing import List, Optional
from uuid import UUID

def create_working_hour(session : Session, vet_working_time_create : VetWorkingHoursCreate, vet_id : UUID):
    new_working_hour = VetWorkingHours(
        vet_id=vet_id,
        **vet_working_time_create.model_dump()
    )
    session.add(new_working_hour)
    session.commit()
    session.refresh(new_working_hour)

    return new_working_hour

def get_working_hours_by_vet(session: Session, vet_id: UUID) -> List[VetWorkingHours]:
    return session.exec(
        select(VetWorkingHours).where(VetWorkingHours.vet_id == vet_id)
    ).all()

def get_working_hour_by_id(session: Session, working_hour_id: UUID) -> Optional[VetWorkingHours]:
    return session.exec(
        select(VetWorkingHours).where(VetWorkingHours.id == working_hour_id)
    ).first()

def delete_working_hour(session: Session, working_hour: VetWorkingHours) -> None:
    session.delete(working_hour)
    session.commit()