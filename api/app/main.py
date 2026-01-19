import os
import requests
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .db import SessionLocal, engine
from .models import Base, User, OtpToken, MagicLinkToken
from .schemas import (
    OtpRequest,
    OtpVerify,
    MagicLinkRequest,
    MagicLinkVerify,
    AuthResponse,
    OtpResponse,
    MagicLinkResponse,
)
from .auth import create_access_token, generate_pin, generate_token, now_plus

APP_ENV = os.getenv("APP_ENV", "dev")
APP_ORIGIN = os.getenv("APP_ORIGIN", "http://localhost:5173")
OTP_TTL_SECONDS = int(os.getenv("OTP_TTL_SECONDS", "300"))
MAGIC_LINK_TTL_SECONDS = int(os.getenv("MAGIC_LINK_TTL_SECONDS", "300"))
WHITELIST = {
    uid.strip()
    for uid in os.getenv("WHITELIST_TELEGRAM_UIDS", "").split(",")
    if uid.strip()
}
BOT_API_KEY = os.getenv("BOT_API_KEY", "")
BOT_SERVICE_URL = os.getenv("BOT_SERVICE_URL", "http://bot:9000")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="NutPlaces API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[APP_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_whitelisted(telegram_uid: str):
    if WHITELIST and telegram_uid not in WHITELIST:
        raise HTTPException(status_code=403, detail="Not whitelisted")


def get_or_create_user(db: Session, telegram_uid: str) -> User:
    user = db.query(User).filter(User.telegram_uid == telegram_uid).first()
    if user:
        return user
    user = User(telegram_uid=telegram_uid)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/auth/request-otp", response_model=OtpResponse)
async def request_otp(payload: OtpRequest, db: Session = Depends(get_db)):
    ensure_whitelisted(payload.telegram_uid)
    pin = generate_pin()
    token = OtpToken(
        telegram_uid=payload.telegram_uid,
        pin=pin,
        expires_at=now_plus(OTP_TTL_SECONDS),
        used=False,
    )
    db.add(token)
    db.commit()
    try:
        requests.post(
            f"{BOT_SERVICE_URL}/send-otp",
            json={"telegram_uid": payload.telegram_uid, "pin": pin},
            timeout=5,
        )
    except requests.RequestException:
        pass
    response = {"status": "sent"}
    if APP_ENV == "dev":
        response["debug_pin"] = pin
    return response


@app.post("/auth/verify-otp", response_model=AuthResponse)
async def verify_otp(payload: OtpVerify, db: Session = Depends(get_db)):
    ensure_whitelisted(payload.telegram_uid)
    token = (
        db.query(OtpToken)
        .filter(
            OtpToken.telegram_uid == payload.telegram_uid,
            OtpToken.pin == payload.pin,
            OtpToken.used.is_(False),
            OtpToken.expires_at >= now_plus(0),
        )
        .order_by(OtpToken.created_at.desc())
        .first()
    )
    if not token:
        raise HTTPException(status_code=401, detail="Invalid or expired pin")
    token.used = True
    db.add(token)
    db.commit()
    user = get_or_create_user(db, payload.telegram_uid)
    access_token = create_access_token(str(user.id))
    return AuthResponse(access_token=access_token)


@app.post("/bot/create-magic-link", response_model=MagicLinkResponse)
async def bot_create_magic_link(
    payload: MagicLinkRequest,
    db: Session = Depends(get_db),
    x_bot_token: str | None = Header(default=None),
):
    if BOT_API_KEY and x_bot_token != BOT_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    ensure_whitelisted(payload.telegram_uid)
    token_value = generate_token()
    token = MagicLinkToken(
        telegram_uid=payload.telegram_uid,
        token=token_value,
        expires_at=now_plus(MAGIC_LINK_TTL_SECONDS),
        used=False,
    )
    db.add(token)
    db.commit()
    app_origin = os.getenv("APP_ORIGIN", "http://localhost:5173")
    link = f"{app_origin}/magic?token={token_value}"
    return MagicLinkResponse(status="created", magic_link=link)


@app.post("/auth/consume-magic-link", response_model=AuthResponse)
async def consume_magic_link(payload: MagicLinkVerify, db: Session = Depends(get_db)):
    token = (
        db.query(MagicLinkToken)
        .filter(
            MagicLinkToken.token == payload.token,
            MagicLinkToken.used.is_(False),
            MagicLinkToken.expires_at >= now_plus(0),
        )
        .first()
    )
    if not token:
        raise HTTPException(status_code=401, detail="Invalid or expired link")
    token.used = True
    db.add(token)
    db.commit()
    user = get_or_create_user(db, token.telegram_uid)
    access_token = create_access_token(str(user.id))
    return AuthResponse(access_token=access_token)
