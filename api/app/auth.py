import os
import secrets
from datetime import datetime, timedelta
import jwt

JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALGORITHM = "HS256"


def create_access_token(subject: str, expires_minutes: int = 60 * 24 * 7) -> str:
    payload = {
        "sub": subject,
        "exp": datetime.utcnow() + timedelta(minutes=expires_minutes),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def generate_pin(length: int = 6) -> str:
    return "".join(str(secrets.randbelow(10)) for _ in range(length))


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def now_plus(seconds: int) -> datetime:
    return datetime.utcnow() + timedelta(seconds=seconds)
