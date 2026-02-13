from sqlmodel import select, Session
from typing import List, Optional
from app.models.pets import Pets
from app.schema.pets import PetCreate, PetUpdate
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

def get_pets_by_user(session: Session, user_id: UUID) -> List[Pets]:
    return session.exec(select(Pets).where(Pets.user_id == user_id)).all()

def get_pet_by_id(session: Session, pet_id: UUID, user_id: UUID) -> Optional[Pets]:
    return session.exec(
        select(Pets).where(Pets.id == pet_id, Pets.user_id == user_id)
    ).first()

def update_pet(session: Session, pet: Pets, pet_data: PetUpdate) -> Pets:
    update_data = pet_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pet, field, value)
    session.add(pet)
    session.commit()
    session.refresh(pet)
    return pet

def delete_pet(session: Session, pet: Pets) -> None:
    session.delete(pet)
    session.commit()