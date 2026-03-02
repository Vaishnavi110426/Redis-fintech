"""
main.py - FastAPI Application Entry Point
Run with: uvicorn main:app --reload --port 8000
"""

import time

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.crud import (
    create_user,
    delete_user,
    get_all_users,
    get_user_by_email,
    get_user_by_id,
    update_user,
)
from backend.database import Base, engine, get_db
from backend.redis_cache import clear_cache, get_cache_info, get_cached_users, set_cached_users
from backend.schemas import UserCreate, UserResponse, UserUpdate

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Redis vs MySQL - User Management API",
    description="A teaching API to demonstrate Redis caching performance vs direct MySQL queries.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "running",
        "message": "Redis vs MySQL API is live! Visit /docs for Swagger UI.",
    }


@app.post("/users", response_model=UserResponse, tags=["Users"])
def api_create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail=f"Email '{user.email}' is already registered.",
        )

    new_user = create_user(db, user)
    clear_cache()
    return new_user


@app.get("/users/mysql", tags=["Users"])
def api_get_users_mysql(db: Session = Depends(get_db)):
    start_time = time.time()
    users = get_all_users(db)
    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    users_list = [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "age": u.age,
            "created_at": str(u.created_at) if u.created_at else None,
        }
        for u in users
    ]

    return {
        "source": "mysql",
        "cache_status": "N/A",
        "response_time_ms": elapsed_ms,
        "total_users": len(users_list),
        "users": users_list,
    }


@app.get("/users/redis", tags=["Users"])
def api_get_users_redis(db: Session = Depends(get_db)):
    start_time = time.time()
    cached_users = get_cached_users()

    if cached_users is not None:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "source": "redis",
            "cache_status": "HIT",
            "response_time_ms": elapsed_ms,
            "total_users": len(cached_users),
            "users": cached_users,
        }

    users = get_all_users(db)
    users_list = [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "age": u.age,
            "created_at": str(u.created_at) if u.created_at else None,
        }
        for u in users
    ]

    set_cached_users(users_list)
    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "source": "mysql → redis",
        "cache_status": "MISS",
        "response_time_ms": elapsed_ms,
        "total_users": len(users_list),
        "users": users_list,
    }


@app.get("/users/{user_id}", response_model=UserResponse, tags=["Users"])
def api_get_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found.")
    return user


@app.put("/users/{user_id}", response_model=UserResponse, tags=["Users"])
def api_update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    updated_user = update_user(db, user_id, user)
    if not updated_user:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found.")

    clear_cache()
    return updated_user


@app.delete("/users/{user_id}", tags=["Users"])
def api_delete_user(user_id: int, db: Session = Depends(get_db)):
    success = delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found.")

    clear_cache()
    return {"message": f"User {user_id} deleted successfully."}


@app.get("/cache/info", tags=["Cache"])
def api_cache_info():
    return get_cache_info()


@app.delete("/cache/clear", tags=["Cache"])
def api_clear_cache():
    clear_cache()
    return {"message": "Cache cleared successfully."}
