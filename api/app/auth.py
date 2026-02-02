import os
import secrets
from datetime import datetime, timedelta
import hashlib
import jwt

JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = int(os.getenv("ACCESS_TOKEN_MINUTES", "120"))


def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    if expires_minutes is None:
        expires_minutes = ACCESS_TOKEN_MINUTES
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


def hash_pin(pin: str, salt: str | None = None) -> tuple[str, str]:
    if salt is None:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        "sha256", pin.encode("utf-8"), salt.encode("utf-8"), 100_000
    ).hex()
    return hashed, salt


def verify_pin(pin: str, salt: str, expected_hash: str) -> bool:
    computed, _ = hash_pin(pin, salt)
    return secrets.compare_digest(computed, expected_hash)
