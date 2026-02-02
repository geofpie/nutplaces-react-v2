import html
import json
import os
import threading
import time
from typing import Optional
from urllib.parse import urlparse, parse_qs

import requests
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
GROUP_CHAT_ID = os.getenv("TELEGRAM_GROUP_CHAT_ID", "")
API_BASE_URL = os.getenv("BOT_API_BASE_URL", "http://api:8000")
BOT_API_KEY = os.getenv("BOT_API_KEY", "")
OFFSET_FILE = "/data/offset.json"
POLL_INTERVAL = 2

TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"

app = FastAPI(title="nut places bot")


class OtpMessage(BaseModel):
    telegram_uid: str
    pin: str


class MagicLinkMessage(BaseModel):
    telegram_uid: str
    magic_link: str


class MagicLinkExpire(BaseModel):
    token: str


class ActivityMessage(BaseModel):
    text: str
    image_url: Optional[str] = None
    parse_mode: Optional[str] = None
    reply_markup: Optional[dict] = None


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


def send_message(
    chat_id: str,
    text: str,
    parse_mode: str | None = None,
    reply_markup: dict | None = None,
) -> int | None:
    payload = {"chat_id": chat_id, "text": text}
    if parse_mode:
        payload["parse_mode"] = parse_mode
    if reply_markup:
        payload["reply_markup"] = reply_markup
    response = requests.post(
        f"{TELEGRAM_API}/sendMessage",
        json=payload,
        timeout=10,
    )
    try:
        payload = response.json()
    except ValueError:
        payload = None
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="Failed to send Telegram message")
    if isinstance(payload, dict) and not payload.get("ok", False):
        description = payload.get("description", "Telegram rejected the message")
        raise HTTPException(status_code=502, detail=description)
    if isinstance(payload, dict):
        return payload.get("result", {}).get("message_id")
    return None


def send_photo(
    chat_id: str,
    text: str,
    image_url: str,
    parse_mode: str | None = None,
    reply_markup: dict | None = None,
) -> None:
    payload = {"chat_id": chat_id, "photo": image_url, "caption": text}
    if parse_mode:
        payload["parse_mode"] = parse_mode
    if reply_markup:
        payload["reply_markup"] = reply_markup
    response = requests.post(
        f"{TELEGRAM_API}/sendPhoto",
        json=payload,
        timeout=10,
    )
    try:
        payload = response.json()
    except ValueError:
        payload = None
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="Failed to send Telegram photo")
    if isinstance(payload, dict) and not payload.get("ok", False):
        description = payload.get("description", "Telegram rejected the photo")
        raise HTTPException(status_code=502, detail=description)


def edit_message(
    chat_id: str,
    message_id: int,
    text: str,
    parse_mode: str | None = None,
    reply_markup: dict | None = None,
) -> None:
    payload = {"chat_id": chat_id, "message_id": message_id, "text": text}
    if parse_mode:
        payload["parse_mode"] = parse_mode
    if reply_markup is not None:
        payload["reply_markup"] = reply_markup
    response = requests.post(
        f"{TELEGRAM_API}/editMessageText",
        json=payload,
        timeout=10,
    )
    try:
        payload = response.json()
    except ValueError:
        payload = None
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="Failed to edit Telegram message")
    if isinstance(payload, dict) and not payload.get("ok", False):
        description = payload.get("description", "Telegram rejected the edit")
        raise HTTPException(status_code=502, detail=description)


def create_magic_link(telegram_uid: str) -> tuple[str, int] | None:
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
    return payload.get("magic_link"), int(payload.get("expires_in_seconds") or 300)


def extract_token(link: str) -> str | None:
    try:
        parsed = urlparse(link)
        token = parse_qs(parsed.query).get("token", [None])[0]
        return token
    except Exception:
        return None


MAGIC_LINK_MESSAGES: dict[str, dict] = {}
MAGIC_LINK_LOCK = threading.Lock()


def schedule_magic_link_expiry(token: str, expires_in: int) -> None:
    def expire() -> None:
        time.sleep(max(expires_in, 1))
        expire_magic_link(token)

    thread = threading.Thread(target=expire, daemon=True)
    thread.start()


def expire_magic_link(token: str) -> None:
    with MAGIC_LINK_LOCK:
        entry = MAGIC_LINK_MESSAGES.pop(token, None)
    if not entry:
        return
    try:
        edit_message(
            entry["chat_id"],
            entry["message_id"],
            "Login link expired. Request /app again.",
            parse_mode="HTML",
            reply_markup={"inline_keyboard": []},
        )
    except HTTPException:
        return


def process_message(message: dict) -> None:
    if not message:
        return
    text = message.get("text", "")
    chat_id = str(message.get("chat", {}).get("id", ""))
    user = message.get("from", {}) or {}
    user_id = str(user.get("id", ""))
    if not text:
        return

    if text.strip().startswith("/app"):
        if GROUP_CHAT_ID and chat_id != str(GROUP_CHAT_ID):
            return
        link_payload = create_magic_link(user_id)
        if link_payload:
            link, expires_in = link_payload
            username = user.get("username")
            display_name = (
                " ".join(
                    part
                    for part in [user.get("first_name"), user.get("last_name")]
                    if part
                ).strip()
                or username
                or "there"
            )
            mention = (
                f"@{username}"
                if username
                else f'<a href="tg://user?id={html.escape(user_id)}">{html.escape(display_name)}</a>'
            )
            message_text = f"{mention} tap the button below to log in."
            reply_markup = {
                "inline_keyboard": [[{"text": "Open login link", "url": link}]]
            }
            message_id = send_message(
                chat_id, message_text, parse_mode="HTML", reply_markup=reply_markup
            )
            token = extract_token(link)
            if token and message_id:
                with MAGIC_LINK_LOCK:
                    MAGIC_LINK_MESSAGES[token] = {
                        "chat_id": chat_id,
                        "message_id": message_id,
                    }
                schedule_magic_link_expiry(token, expires_in)
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
        try:
            response = requests.get(
                f"{TELEGRAM_API}/getUpdates", params=params, timeout=35
            )
            data = response.json()
            if not data.get("ok"):
                time.sleep(POLL_INTERVAL)
                continue
            for update in data.get("result", []):
                offset = update.get("update_id", 0) + 1
                process_message(update.get("message"))
                save_offset(offset)
        except requests.RequestException:
            time.sleep(5)
            continue
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
    send_message(
        payload.telegram_uid,
        "Tap the button below to log in.",
        reply_markup={
            "inline_keyboard": [
                [{"text": "Open login link", "url": payload.magic_link}]
            ]
        },
    )
    return {"status": "sent"}


@app.post("/magic-link/expire")
def expire_magic_link_endpoint(
    payload: MagicLinkExpire,
    x_bot_token: str | None = Header(default=None),
):
    if BOT_API_KEY and x_bot_token != BOT_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    expire_magic_link(payload.token)
    return {"status": "ok"}


@app.post("/send-activity")
def send_activity(payload: ActivityMessage, x_bot_token: str | None = Header(default=None)):
    if BOT_API_KEY and x_bot_token != BOT_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not GROUP_CHAT_ID:
        raise HTTPException(status_code=400, detail="GROUP_CHAT_ID not set")
    if not payload.text:
        raise HTTPException(status_code=400, detail="text required")
    if payload.image_url:
        try:
            send_photo(
                GROUP_CHAT_ID,
                payload.text,
                payload.image_url,
                parse_mode=payload.parse_mode,
                reply_markup=payload.reply_markup,
            )
        except HTTPException:
            send_message(
                GROUP_CHAT_ID,
                payload.text,
                parse_mode=payload.parse_mode,
                reply_markup=payload.reply_markup,
            )
    else:
        send_message(
            GROUP_CHAT_ID,
            payload.text,
            parse_mode=payload.parse_mode,
            reply_markup=payload.reply_markup,
        )
    return {"status": "sent"}
