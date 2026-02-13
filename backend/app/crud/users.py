from sqlmodel import Session,select
from app.models.users import Users
from app.schema.users import UserCreate
from app.models.enums import UserRole

def get_user_by_email(session: Session,email : str):
    return session.exec(select(Users).where(Users.email == email)).first()

def create_user(session:Session,user_data : UserCreate, password_hash : str, role : UserRole = UserRole.OWNER):
    db_user = Users(
        email = user_data.email,
        full_name = user_data.full_name,
        password_hash = password_hash,
        role = role,
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user