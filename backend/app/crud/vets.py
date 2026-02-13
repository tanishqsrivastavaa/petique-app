from sqlmodel import select, Session
from typing import List,Optional
from app.models.vets import Vets
from app.schema.vets import VetCreate, VetUpdate
from uuid import UUID

def get_vets(session : Session) -> List[Vets]:
    return session.exec(select(Vets).where(Vets.is_active==True)).all()

def get_vet_by_id(session : Session, vet_id : UUID) -> Optional[Vets]:
    return session.exec(select(Vets).where(Vets.id == vet_id)).first()

def get_vet_by_user_id(session: Session, user_id: UUID) -> Optional[Vets]:
    return session.exec(select(Vets).where(Vets.user_id == user_id)).first()

def create_vet(session: Session, vet_data: VetCreate, user_id: UUID, full_name: str, email: str) -> Vets:
    new_vet = Vets(
        user_id=user_id,
        full_name=full_name,
        email=email,
        **vet_data.model_dump(),
    )
    session.add(new_vet)
    session.commit()
    session.refresh(new_vet)
    return new_vet

def update_vet(session: Session, vet: Vets, vet_data: VetUpdate) -> Vets:
    update_data = vet_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vet, field, value)
    session.add(vet)
    session.commit()
    session.refresh(vet)
    return vet