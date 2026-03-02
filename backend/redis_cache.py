"""
redis_cache.py - Redis Cache Manager
"""

import json
from typing import Optional

import redis

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True,
)

CACHE_KEY = "all_users"
CACHE_TTL = 60


def get_cached_users() -> Optional[list]:
    try:
        cached_data = redis_client.get(CACHE_KEY)

        if cached_data:
            print("✅ CACHE HIT - Returning data from Redis")
            return json.loads(cached_data)

        print("❌ CACHE MISS - Data not in Redis")
        return None

    except redis.ConnectionError:
        print("⚠️ Redis connection failed - falling back to MySQL")
        return None


def set_cached_users(users_data: list) -> bool:
    try:
        json_data = json.dumps(users_data, default=str)
        redis_client.setex(CACHE_KEY, CACHE_TTL, json_data)
        print(f"📦 Cached {len(users_data)} users in Redis (TTL: {CACHE_TTL}s)")
        return True

    except redis.ConnectionError:
        print("⚠️ Redis connection failed - data NOT cached")
        return False


def clear_cache() -> bool:
    try:
        redis_client.delete(CACHE_KEY)
        print("🗑️ Redis cache CLEARED")
        return True

    except redis.ConnectionError:
        print("⚠️ Redis connection failed - cache NOT cleared")
        return False


def get_cache_info() -> dict:
    try:
        ttl = redis_client.ttl(CACHE_KEY)
        exists = redis_client.exists(CACHE_KEY)

        return {
            "cache_exists": bool(exists),
            "ttl_remaining": ttl if ttl > 0 else 0,
            "cache_key": CACHE_KEY,
            "max_ttl": CACHE_TTL,
        }

    except redis.ConnectionError:
        return {
            "cache_exists": False,
            "error": "Redis connection failed",
        }
