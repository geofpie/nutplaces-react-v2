import json
import os
import threading
import time
from typing import Optional

import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
GROUP_CHAT_ID = os.getenv("TELEGRAM_GROUP_CHAT_ID", "")
API_BASE_URL = os.getenv("BOT_API_BASE_URL", "http://api:8000")
BOT_API_KEY = os.getenv("BOT_API_KEY", "")
OFFSET_FILE = "/data/offset.json"
POLL_INTERVAL = 2

TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"

app = FastAPI(title="NutPlaces Bot")


class OtpMessage(BaseModel):
    telegram_uid: str
    pin: str


class MagicLinkMessage(BaseModel):
    telegram_uid: str
    magic_link: str


def load_offset() -> Optional[int]:
    if not os.path.exists(OFFSET_FILE):
        return None
    try:
        with open(OFFSET_FILE, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
        return payload.get("offset")
    except Exception:
        return None


def save_offset(offset: int) -> None:
    os.makedirs(os.path.dirname(OFFSET_FILE), exist_ok=True)
    with open(OFFSET_FILE, "w", encoding="utf-8") as handle:
        json.dump({"offset": offset}, handle)


def send_message(chat_id: str, text: str) -> None:
    response = requests.post(
        f"{TELEGRAM_API}/sendMessage",
        json={"chat_id": chat_id, "text": text},
        timeout=10,
    )
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="Failed to send Telegram message")


def create_magic_link(telegram_uid: str) -> str | None:
    headers = {"X-Bot-Token": BOT_API_KEY} if BOT_API_KEY else {}
    response = requests.post(
        f"{API_BASE_URL}/bot/create-magic-link",
        json={"telegram_uid": telegram_uid},
        headers=headers,
        timeout=10,
    )
    if response.status_code != 200:
        return None
    payload = response.json()
    return payload.get("magic_link")


def process_message(message: dict) -> None:
    if not message:
        return
    text = message.get("text", "")
    chat_id = str(message.get("chat", {}).get("id", ""))
    user_id = str(message.get("from", {}).get("id", ""))

    if not text:
        return

    if text.strip().startswith("/app"):
        if GROUP_CHAT_ID and chat_id != str(GROUP_CHAT_ID):
            return
        link = create_magic_link(user_id)
        if link:
            send_message(chat_id, f"Your login link (valid 5 min): {link}")
        else:
            send_message(chat_id, "Unable to create login link. Are you whitelisted?")


def poll_loop() -> None:
    if not BOT_TOKEN:
        return
    offset = load_offset()
    while True:
        params = {"timeout": 30}
        if offset is not None:
            params["offset"] = offset
        response = requests.get(f"{TELEGRAM_API}/getUpdates", params=params, timeout=35)
        data = response.json()
        if not data.get("ok"):
            time.sleep(POLL_INTERVAL)
            continue
        for update in data.get("result", []):
            offset = update.get("update_id", 0) + 1
            process_message(update.get("message"))
            save_offset(offset)
        time.sleep(POLL_INTERVAL)


@app.on_event("startup")
def start_polling() -> None:
    if not BOT_TOKEN:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is required")
    thread = threading.Thread(target=poll_loop, daemon=True)
    thread.start()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/send-otp")
def send_otp(payload: OtpMessage):
    if not payload.telegram_uid:
        raise HTTPException(status_code=400, detail="telegram_uid required")
    send_message(payload.telegram_uid, f"Your OTP pin: {payload.pin}")
    return {"status": "sent"}


@app.post("/send-magic-link")
def send_magic_link(payload: MagicLinkMessage):
    send_message(payload.telegram_uid, f"Your login link (valid 5 min): {payload.magic_link}")
    return {"status": "sent"}
