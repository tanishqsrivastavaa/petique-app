from sqlmodel import select, Session
from typing import List
from app.models.vets import Vets
from uuid import UUID

def get_vets(session : Session,user_id : UUID) -> List[Vets]:
    vet = Vets(user_id = user_id)
    return session.exec(select(Vets).where(Vets.is_active==True)).all()


#def create_vet
#def update_vet