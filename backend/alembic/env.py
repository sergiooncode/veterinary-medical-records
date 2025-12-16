from logging.config import fileConfig

# mypy: ignore-errors

from alembic import context

# Import your models and database configuration
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

from common.database import engine, DATABASE_URL
import sqlalchemy as sa
import sqlmodel
from sqlmodel import SQLModel

from documents.models import Document

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the SQLAlchemy URL from our database configuration
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = SQLModel.metadata


def render_item(type_, obj, autogen_context):
    if type_ == "type" and isinstance(obj, sqlmodel.sql.sqltypes.AutoString):
        return sa.String()
    return False


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_item=render_item,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Use the existing engine from database.py
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_item=render_item,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
