from sqlmodel import select, Session
from app.models.pets import Pets
from app.schema.pets import PetCreate
from uuid import UUID

def create_pet(session : Session,pet_data : PetCreate, user_id : UUID):
    new_pet = Pets(
        user_id = user_id,
        **pet_data.model_dump()
    )

    session.add(new_pet)
    session.commit()
    session.refresh(new_pet)

    return new_pet
# def get_pet()