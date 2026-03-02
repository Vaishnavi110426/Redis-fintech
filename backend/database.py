"""
database.py - MySQL Database Connection & Session Management
Uses SQLAlchemy ORM to connect to a local MySQL database.
"""

import os
from urllib.parse import quote_plus

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ─── MySQL Connection String ───────────────────────────────────────────
# Prefer DATABASE_URL from environment.
# If not set, build URL from individual MYSQL_* environment variables.
database_url_from_env = os.getenv("DATABASE_URL")

if database_url_from_env:
    DATABASE_URL = database_url_from_env
else:
    mysql_user = os.getenv("MYSQL_USER", "root")
    mysql_password = quote_plus(os.getenv("MYSQL_PASSWORD", ""))
    mysql_host = os.getenv("MYSQL_HOST", "localhost")
    mysql_port = os.getenv("MYSQL_PORT", "3306")
    mysql_db = os.getenv("MYSQL_DB", "MRUMRECW")
    DATABASE_URL = f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}:{mysql_port}/{mysql_db}"

# ─── Create the SQLAlchemy Engine ──────────────────────────────────────
# The engine is the starting point for any SQLAlchemy application.
# It manages database connections for us.
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=False,
)

# ─── Create a Session Factory ─────────────────────────────────────────
# A session is like a "workspace" for our database operations.
# autocommit=False: We manually control when data is saved.
# autoflush=False:  We manually control when data is sent to the DB.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ─── Declare a Base Class for Models ──────────────────────────────────
# All our database models (tables) will inherit from this Base class.
Base = declarative_base()


def get_db():
    """
    Dependency function that provides a database session.

    How it works:
    1. Creates a new database session.
    2. Gives it to the endpoint function (via `yield`).
    3. Automatically closes the session when the request is done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
