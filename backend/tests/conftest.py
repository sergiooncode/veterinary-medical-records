import os
from typing import Generator
from pathlib import Path
import tempfile
from unittest.mock import patch

import pytest
from sqlalchemy import create_engine as create_sqlalchemy_engine, text
from sqlmodel import SQLModel, Session, create_engine
from fastapi import FastAPI
from fastapi.testclient import TestClient

from common.database import get_session
from documents.router import router
from documents.storage import LocalStorage
from documents.models import DocumentProcessingRun
from metrics.models import DocumentProcessingRunMetrics


TEST_DATABASE_NAME = "veterinary_test_db"
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    f"postgresql+psycopg://veterinary_user:veterinary_password@postgres:5432/{TEST_DATABASE_NAME}",
)


def create_test_database():
    admin_url = TEST_DATABASE_URL.rsplit("/", 1)[0] + "/postgres"
    admin_engine = create_sqlalchemy_engine(admin_url, isolation_level="AUTOCOMMIT")
    
    with admin_engine.connect() as conn:
        result = conn.execute(
            text(f"SELECT 1 FROM pg_database WHERE datname = '{TEST_DATABASE_NAME}'")
        )
        exists = result.fetchone()
        
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{TEST_DATABASE_NAME}"'))
    
    admin_engine.dispose()


@pytest.fixture(scope="session")
def test_engine():
    create_test_database()
    engine = create_engine(TEST_DATABASE_URL, echo=False)
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def test_session(test_engine) -> Generator[Session, None, None]:
    connection = test_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def test_app(test_session: Session) -> FastAPI:
    from fastapi import APIRouter

    app = FastAPI()

    def override_get_session():
        yield test_session

    app.dependency_overrides[get_session] = override_get_session

    api_router = APIRouter(prefix="/api")
    api_router.include_router(router)
    app.include_router(api_router)

    return app


@pytest.fixture
def temp_storage():
    with tempfile.TemporaryDirectory() as tmpdir:
        storage = LocalStorage(Path(tmpdir))
        with patch("documents.router.storage", storage):
            yield storage


@pytest.fixture
def client(test_app: FastAPI, temp_storage) -> TestClient:
    return TestClient(test_app)

