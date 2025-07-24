# alembic/env.py

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# --- This is the new section to add ---
# Add the 'backend/app' directory to the Python path
# This allows Alembic to find your models
project_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_dir)

# Import your Base from your application's models
# Adjust the import path if your structure is different
from backend.app.database import Base
from backend.app.models import * # Import all models to ensure they are registered with Base
from backend.app.database import DATABASE_URL # Import your DATABASE_URL

# ------------------------------------

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# --- This is a change ---
# Set the database URL from your imported DATABASE_URL
# This ensures Alembic uses the same database as your app
config.set_main_option('sqlalchemy.url', DATABASE_URL)
# --------------------


# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- This is a change ---
# Set the target_metadata to your Base
target_metadata = Base.metadata
# --------------------


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()