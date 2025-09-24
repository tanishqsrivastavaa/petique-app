from sqlmodel import select, Session
from typing import List,Optional
from app.models.vets import Vets
from uuid import UUID

def get_vets(session : Session,user_id : UUID) -> List[Vets]:
    return session.exec(select(Vets).where(Vets.is_active==True)).all()


def get_vet_by_id(session : Session,user_id:UUID,vet_id : UUID) -> Optional[Vets]:
    return session.exec(select(Vets).where(Vets.id == vet_id)).first()