import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


from sqlmodel import create_engine, SQLModel, Session
from typing import Generator


# Database configuration


# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

def create_db_and_tables():
    """Create database tables"""
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    with Session(engine) as session:
        yield session

# Alternative function name for compatibility
def get_db() -> Generator[Session, None, None]:
    """Alias for get_session for backward compatibility"""
    return get_session()