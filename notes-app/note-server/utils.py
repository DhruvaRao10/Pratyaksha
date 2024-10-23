import os
import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Union, Any

# EXPIRE TIME IN MINUTES
ACCESS_TOKEN_EXPIRE = 90
REFRESH_TOKEN_EXPIRE = 60 * 24 * 7

ALGORITHM = "HS256"
JWT_SECRET_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcyOTM5ODE2MSwiaWF0IjoxNzI5Mzk4MTYxfQ.psKzl2mOOl4EWNWKLxFxYhZ0AoQMOdIddTPNG6boaGw"
JWT_REFRESH_SECRET_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcyOTM5ODI0OCwiaWF0IjoxNzI5Mzk4MjQ4fQ.xvV1MAm6GHuBZrN7QqOoG1Z4bzBI2WpwqrfA4B9tntg"

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_hashed_password(password: str) -> str:
    """Generate hashed password from plain text password"""
    return password_context.hash(password)


def verify_password(password: str, hashed_pass: str) -> bool:
    """Verify plain text password against hashed password"""
    return password_context.verify(password, hashed_pass)


def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    """Create access token"""
    if expires_delta is not None:
        expires_delta = datetime.utcnow() + expires_delta
    else:
        expires_delta = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE)

    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    """Create refresh token"""
    if expires_delta is not None:
        expires_delta = datetime.utcnow() + expires_delta
    else:
        expires_delta = datetime.utcnow() + timedelta(minutes=REFRESH_TOKEN_EXPIRE)

    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """Decode access token"""
    try:
        decoded_token = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        return (
            decoded_token
            if decoded_token["exp"] >= datetime.utcnow().timestamp()
            else None
        )
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def decode_refresh_token(token: str) -> dict:
    """Decode refresh token"""
    try:
        decoded_token = jwt.decode(
            token, JWT_REFRESH_SECRET_KEY, algorithms=[ALGORITHM]
        )
        return (
            decoded_token
            if decoded_token["exp"] >= datetime.utcnow().timestamp()
            else None
        )
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
