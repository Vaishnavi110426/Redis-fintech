# Redis Fintech - User Management (MySQL vs Redis)

A full-stack demo project to compare **direct MySQL queries** with **Redis-cached responses** using a FastAPI backend and React frontend.

## Project Structure

- `backend/` - FastAPI app, SQLAlchemy models, CRUD logic, Redis cache layer
- `frontend/` - React + Vite frontend UI
- `database/` - MySQL setup SQL script (`set.sql`)

---

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- PyMySQL
- Redis (python client)
- Pydantic

### Frontend
- React
- Vite
- Axios

### Database / Cache
- MySQL
- Redis

---

## Prerequisites

Install and run locally:
- Python 3.11+ (your project currently uses `.venv` with Python 3.13)
- Node.js 18+
- MySQL Server
- Redis Server

---

## 1) Database Setup (MySQL)

Run the SQL script in MySQL:

- File: `database/set.sql`

This script creates:
- Database: `MRUMRECW`
- Table: `users`
- Optional sample seed users
- Optional stored procedure `generate_test_users(num_users)`

---

## 2) Backend Setup

From project root:

```powershell
D:\Redis_fintech\Redis-fintech\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt cryptography
```

### Configure DB credentials

Backend supports env-based DB config in `backend/database.py`.

Create local env file from template:

- Copy `backend/.env.example` -> `backend/.env`

Fill values:

```env
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=MRUMRECW
```

> If password has special characters (like `@`), env method is safest.

### Run backend

```powershell
D:\Redis_fintech\Redis-fintech\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000
```

Backend URLs:
- API root: http://127.0.0.1:8000/
- Swagger docs: http://127.0.0.1:8000/docs

---

## 3) Frontend Setup

From project root:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:
- http://localhost:5173

---

## API Endpoints

### Health
- `GET /`

### Users
- `POST /users` - Create user
- `GET /users/mysql` - Fetch users directly from MySQL
- `GET /users/redis` - Fetch users using Redis cache
- `GET /users/{user_id}` - Fetch one user
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user

### Cache
- `GET /cache/info` - Cache status
- `DELETE /cache/clear` - Clear cache manually

---

## How to Test MySQL vs Redis

1. Call `GET /users/mysql`
   - Always reads from MySQL.
2. Call `GET /users/redis` first time
   - `cache_status` should be `MISS`.
3. Call `GET /users/redis` again
   - `cache_status` should be `HIT`.
4. Create/Update/Delete a user
   - Cache is cleared automatically.

---

## Redis CLI Quick Test

```bash
redis-cli
PING
KEYS *
EXISTS all_users
TTL all_users
GET all_users
```

If `all_users` is empty:
- Hit `GET /users/redis` once from API, then recheck Redis CLI.

---

## Troubleshooting

### `npm run dev` gives ENOENT package.json
Run it inside `frontend/`, not repo root.

### MySQL connection errors
- Verify MySQL service is running.
- Verify `MRUMRECW` exists.
- Verify username/password/host/port values.

### Redis not connected
- Verify Redis server is running on `localhost:6379`.

---

## Notes

- `.gitignore` excludes `.venv`, `frontend/node_modules`, and `.env` files.
- Use `backend/.env.example` as the safe template for local secrets.
