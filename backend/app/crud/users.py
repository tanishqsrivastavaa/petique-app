from sqlmodel import Session,select
from app.models.users import Users
from app.api.v1.users import UserCreate

def get_user_by_email(session: Session,email : str):
    return session.exec(select(Users).where(User.email == email)).first()

def create_user(session:Session,user_data : UserCreate, password_hash : str):
    db_user = Users(
        email = user_data.email,
        full_name = user_data.full_name,
        password_hash = password_hash
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user