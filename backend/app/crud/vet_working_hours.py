from app.schema.vet_working_hours import VetWorkingHoursCreate
from sqlmodel import Session, select
from app.models.vet_working_hours import VetWorkingHours
from uuid import UUID
# from app.models.vets import Vets

def create_working_hour(session : Session, vet_working_time_create : VetWorkingHoursCreate, user_id : UUID):
    new_working_hour = VetWorkingHours(
        **vet_working_time_create.model_dump()
    )
    session.add(new_working_hour)
    session.commit()
    session.refresh(new_working_hour)

    return new_working_hour