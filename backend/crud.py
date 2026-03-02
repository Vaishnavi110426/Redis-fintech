"""
crud.py - CRUD Operations (Create, Read, Update, Delete)
"""

from typing import Optional

from sqlalchemy.orm import Session

from backend.models import User
from backend.schemas import UserCreate, UserUpdate


def create_user(db: Session, user_data: UserCreate) -> User:
    db_user = User(
        name=user_data.name,
        email=user_data.email,
        age=user_data.age,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def get_all_users(db: Session) -> list:
    return db.query(User).order_by(User.id.desc()).all()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def update_user(db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
    db_user = get_user_by_id(db, user_id)

    if not db_user:
        return None

    update_data = user_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)

    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    db_user = get_user_by_id(db, user_id)

    if not db_user:
        return False

    db.delete(db_user)
    db.commit()

    return True
