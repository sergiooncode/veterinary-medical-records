import os
from typing import Generator
from sqlmodel import SQLModel, Session, create_engine


# Database URL from environment - use psycopg (psycopg3) dialect
db_url = os.getenv(
    "DATABASE_URL",
    "postgresql://veterinary_user:veterinary_password@postgres:5432/veterinary_db",
)
# Ensure we use psycopg3 dialect (postgresql+psycopg://)
if db_url.startswith("postgresql://") and "+psycopg" not in db_url:
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)
DATABASE_URL = db_url

# Create engine with psycopg3 dialect
# The +psycopg suffix tells SQLAlchemy to use psycopg3 (not psycopg2)
engine = create_engine(DATABASE_URL, echo=False)


def get_session() -> Generator[Session, None, None]:
    """Dependency to get database session."""
    with Session(engine) as session:
        yield session


def init_db():
    """Initialize database tables."""
    SQLModel.metadata.create_all(engine)
