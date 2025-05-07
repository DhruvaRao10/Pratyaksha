import redis
import os
from dotenv import load_dotenv

load_dotenv()

# Redis configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

# Create Redis connection
redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    password=REDIS_PASSWORD,
    decode_responses=True,
)

# Cache expiration times (in seconds)
CACHE_EXPIRATION = {
    "papers_with_code": 24 * 60 * 60,  # 24 hours
    "arxiv_search": 12 * 60 * 60,  # 12 hours
    "elastic_search": 12 * 60 * 60,  # 12 hours
    "prerequisite_papers": 24 * 60 * 60,  # 24 hours
}


def get_cached_data(key: str):
    """Get data from Redis cache"""
    return redis_client.get(key)


def set_cached_data(key: str, value: str, expiration: int = None):
    """Set data in Redis cache with optional expiration"""
    redis_client.set(key, value, ex=expiration)


def delete_cached_data(key: str):
    """Delete data from Redis cache"""
    redis_client.delete(key)
