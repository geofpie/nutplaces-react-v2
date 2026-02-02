import os
import base64
import binascii
import html
import json
import threading
from datetime import datetime, timedelta, timezone
import math
import random
from uuid import uuid4
import requests
import jwt
from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy import func, or_
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .db import SessionLocal, engine
from .models import (
    Base,
    User,
    OtpToken,
    MagicLinkToken,
    TrustedDevice,
    RefreshToken,
    CheckIn,
    FoodPlace,
    FoodVisit,
    FoodVisitComment,
    Activity,
    ActivityVisit,
    ActivityVisitComment,
    TierlistComment,
    JournalEntry,
    Tierlist,
    UserActivity,
)
from .schemas import (
    OtpRequest,
    OtpVerify,
    MagicLinkRequest,
    MagicLinkVerify,
    PinVerify,
    PinSet,
    ProfileSet,
    ProfileUpdate,
    AuthResponse,
    OtpResponse,
    MagicLinkResponse,
    PinVerifyResponse,
    PinSetResponse,
    ProfileSetResponse,
    UserListResponse,
    UserPublic,
    ProfileResponse,
    TrustedDeviceOut,
    RefreshRequest,
    PinChangeRequest,
    PinChangeResponse,
    PinVerifyRequest,
    PinCurrentVerifyResponse,
    CheckInCreate,
    CheckInUpdate,
    CheckInOut,
    CheckInListResponse,
    CheckInStats,
    CheckInTopLocation,
    TripCheckInOut,
    FoodPlaceCreate,
    FoodPlaceUpdate,
    FoodPlaceOut,
    FoodPlaceListResponse,
    FoodPlaceStats,
    FoodPlaceTop,
    FoodCuisineStatsResponse,
    FoodVisitCreate,
    FoodVisitUpdate,
    FoodVisitOut,
    FoodVisitListResponse,
    FoodVisitSearchResponse,
    FoodPlaceRollRequest,
    FoodPlaceRollResponse,
    FoodVisitCommentCreate,
    FoodVisitCommentOut,
    FoodVisitCommentListResponse,
    ActivityCreate,
    ActivityUpdate,
    ActivityOut,
    ActivityStats,
    ActivityListResponse,
    ActivityRollRequest,
    ActivityRollResponse,
    ActivityVisitCreate,
    ActivityVisitUpdate,
    ActivityVisitOut,
    ActivityVisitListResponse,
    ActivityVisitSearchResponse,
    HomeTimelineResponse,
    HomeHeroResponse,
    ActivityVisitCommentCreate,
    ActivityVisitCommentOut,
    ActivityVisitCommentListResponse,
    TierlistCommentCreate,
    TierlistCommentOut,
    TierlistCommentListResponse,
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryOut,
    JournalEntryListResponse,
    TierlistCreate,
    TierlistUpdate,
    TierlistOut,
    TierlistListResponse,
    UserActivityOut,
    UserActivityListResponse,
    TripListResponse,
    TripOut,
)
from .auth import (
    create_access_token,
    generate_pin,
    generate_token,
    now_plus,
    hash_pin,
    verify_pin as verify_pin_hash,
)

APP_ENV = os.getenv("APP_ENV", "dev")
APP_ORIGIN = os.getenv("APP_ORIGIN", "http://localhost:5173")
PUBLIC_API_BASE_URL = os.getenv("PUBLIC_API_BASE_URL", "")
OTP_TTL_SECONDS = int(os.getenv("OTP_TTL_SECONDS", "300"))
MAGIC_LINK_TTL_SECONDS = int(os.getenv("MAGIC_LINK_TTL_SECONDS", "300"))
JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
SKIP_OTP = os.getenv("SKIP_OTP", "").lower() in {"1", "true", "yes", "on"}
WHITELIST = {
    uid.strip()
    for uid in os.getenv("WHITELIST_TELEGRAM_UIDS", "").split(",")
    if uid.strip()
}
BOT_API_KEY = os.getenv("BOT_API_KEY", "")
ADMIN_API_KEY = os.getenv("JWT_SECRET", "")
BOT_SERVICE_URL = os.getenv("BOT_SERVICE_URL", "http://bot:9000")
TRUST_DEVICE_DAYS = 30
REFRESH_TOKEN_DAYS = 30
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/data/uploads")
ASSET_DIR = os.getenv("ASSET_DIR", "/data/assets")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(ASSET_DIR, exist_ok=True)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="nut places API")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/assets", StaticFiles(directory=ASSET_DIR), name="assets")

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


def save_image(data_url: str, prefix: str) -> str:
    if "," not in data_url:
        raise HTTPException(status_code=400, detail="Invalid avatar data")
    header, encoded = data_url.split(",", 1)
    if not header.startswith("data:image/"):
        raise HTTPException(status_code=400, detail="Invalid avatar data")
    mime = header.split(";")[0].replace("data:", "")
    ext_map = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    }
    extension = ext_map.get(mime)
    if not extension:
        raise HTTPException(status_code=400, detail="Unsupported image type")
    try:
        binary = base64.b64decode(encoded)
    except (ValueError, binascii.Error):
        raise HTTPException(status_code=400, detail="Invalid avatar data")
    filename = f"{uuid4().hex}.{extension}"
    safe_prefix = prefix.strip("/").replace("..", "")
    target_dir = os.path.join(UPLOAD_DIR, safe_prefix)
    os.makedirs(target_dir, exist_ok=True)
    path = os.path.join(target_dir, filename)
    with open(path, "wb") as handle:
        handle.write(binary)
    return f"/uploads/{safe_prefix}/{filename}"


def maybe_delete_avatar(avatar_url: str | None):
    if not avatar_url or not avatar_url.startswith("/uploads/"):
        return
    filename = avatar_url.replace("/uploads/", "", 1)
    path = os.path.join(UPLOAD_DIR, filename)
    try:
        os.remove(path)
    except FileNotFoundError:
        pass


def maybe_delete_upload(upload_url: str | None):
    if not upload_url or not upload_url.startswith("/uploads/"):
        return
    filename = upload_url.replace("/uploads/", "", 1)
    path = os.path.join(UPLOAD_DIR, filename)
    try:
        os.remove(path)
    except FileNotFoundError:
        pass


def build_public_url(path: str | None) -> str | None:
    if not path:
        return None
    if path.startswith("http://") or path.startswith("https://"):
        return path
    if not PUBLIC_API_BASE_URL:
        return None
    return f"{PUBLIC_API_BASE_URL}{path}"


def build_google_maps_url(label: str | None, latitude: float | None, longitude: float | None) -> str | None:
    query = label or (f"{latitude},{longitude}" if latitude is not None and longitude is not None else None)
    if not query:
        return None
    return f"https://www.google.com/maps/search/?api=1&query={requests.utils.quote(query)}"


def log_user_activity(
    db: Session,
    user: User,
    action: str,
    entity_type: str,
    entity_id: int | None,
    summary: str,
    details: list[str] | None = None,
    image_url: str | None = None,
    notify_bot: bool = True,
    bot_message: str | None = None,
    bot_image_url: str | None = None,
    bot_reply_markup: dict | None = None,
    bot_parse_mode: str | None = "HTML",
):
    entry = UserActivity(
        user_id=user.id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        summary=summary,
    )
    db.add(entry)
    # Keep only the latest 20 activity entries per user.
    db.flush()
    old_entries = (
        db.query(UserActivity)
        .filter(UserActivity.user_id == user.id)
        .order_by(UserActivity.created_at.desc(), UserActivity.id.desc())
        .offset(20)
        .all()
    )
    for old in old_entries:
        db.delete(old)
    if action in {"delete", "update"} or entity_type in {"check_in", "journal_entry"}:
        notify_bot = False
    if notify_bot:
        notify_bot_activity(
            user,
            summary,
            details=details,
            image_url=image_url,
            message=bot_message,
            bot_image_url=bot_image_url,
            reply_markup=bot_reply_markup,
            parse_mode=bot_parse_mode,
        )


def serialize_user_activity(
    entry: UserActivity,
    entity_title: str | None = None,
    entity_subtitle: str | None = None,
    entity_image_url: str | None = None,
) -> UserActivityOut:
    return UserActivityOut(
        id=entry.id,
        action=entry.action,
        entity_type=entry.entity_type,
        entity_id=entry.entity_id,
        summary=entry.summary,
        created_at=entry.created_at.isoformat(),
        entity_title=entity_title,
        entity_subtitle=entity_subtitle,
        entity_image_url=entity_image_url,
    )


def notify_bot_activity(
    user: User,
    summary: str,
    details: list[str] | None = None,
    image_url: str | None = None,
    message: str | None = None,
    bot_image_url: str | None = None,
    reply_markup: dict | None = None,
    parse_mode: str | None = "HTML",
) -> None:
    if not BOT_SERVICE_URL:
        return
    display_name = user.display_name or user.telegram_uid or "Someone"
    detail_lines = "\n".join(details or [])
    if message:
        text = message
    else:
        text = f"{display_name} {summary}"
        if detail_lines:
            text = f"{text}\n{detail_lines}"
    headers = {"X-Bot-Token": BOT_API_KEY} if BOT_API_KEY else {}

    def send_async() -> None:
        try:
            requests.post(
                f"{BOT_SERVICE_URL}/send-activity",
                json={
                    "text": text,
                    "image_url": bot_image_url or image_url,
                    "parse_mode": parse_mode,
                    "reply_markup": reply_markup,
                },
                headers=headers,
                timeout=5,
            )
        except requests.RequestException:
            pass

    threading.Thread(target=send_async, daemon=True).start()


def build_telegram_mention(user: User) -> str:
    name = user.display_name or user.telegram_uid or "Someone"
    uid = user.telegram_uid or ""
    return f'<a href="tg://user?id={html.escape(uid)}">{html.escape(name)}</a>'

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_radius_km = 6371
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return earth_radius_km * c


def ensure_pin_valid(user: User, pin: str):
    if not user.pin_hash or not user.pin_salt:
        raise HTTPException(status_code=400, detail="Pin not set")
    if not verify_pin_hash(pin, user.pin_salt, user.pin_hash):
        raise HTTPException(status_code=401, detail="Invalid pin")


def get_or_create_user(db: Session, telegram_uid: str) -> User:
    user = db.query(User).filter(User.telegram_uid == telegram_uid).first()
    if user:
        return user
    display_name = f"User {telegram_uid[-4:]}" if telegram_uid else "User"
    user = User(telegram_uid=telegram_uid, display_name=display_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user


def trust_device(
    db: Session,
    user: User,
    device_id: str,
    device_name: str | None,
    user_agent: str | None,
) -> None:
    device = (
        db.query(TrustedDevice)
        .filter(
            TrustedDevice.user_id == user.id,
            TrustedDevice.device_id == device_id,
        )
        .first()
    )
    trusted_until = datetime.utcnow() + timedelta(days=TRUST_DEVICE_DAYS)
    if device:
        device.device_name = device_name or device.device_name
        device.user_agent = user_agent or device.user_agent
        device.trusted_until = trusted_until
        device.revoked_at = None
        device.last_seen_at = datetime.utcnow()
        db.add(device)
        db.commit()
        return
    device = TrustedDevice(
        user_id=user.id,
        device_id=device_id,
        device_name=device_name,
        user_agent=user_agent,
        trusted_until=trusted_until,
        revoked_at=None,
        last_seen_at=datetime.utcnow(),
    )
    db.add(device)
    db.commit()


def parse_iso_datetime(value: str | None) -> datetime:
    if not value:
        return datetime.utcnow()
    try:
        normalized = value.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
    except ValueError:
        return datetime.utcnow()
    if parsed.tzinfo:
        return parsed.astimezone(timezone.utc).replace(tzinfo=None)
    return parsed


def normalize_journal_links(links) -> list[dict]:
    if not links:
        return []
    normalized = []
    for link in links:
        link_type = getattr(link, "type", None) or link.get("type")
        visit_id = getattr(link, "visit_id", None)
        if visit_id is None and isinstance(link, dict):
            visit_id = link.get("visit_id")
        title = getattr(link, "title", None)
        subtitle = getattr(link, "subtitle", None)
        meta = getattr(link, "meta", None)
        if isinstance(link, dict):
            if title is None:
                title = link.get("title")
            if subtitle is None:
                subtitle = link.get("subtitle")
            if meta is None:
                meta = link.get("meta")
        if not link_type or visit_id is None:
            continue
        try:
            visit_id = int(visit_id)
        except (TypeError, ValueError):
            continue
        normalized.append(
            {
                "type": str(link_type),
                "visit_id": visit_id,
                "title": title,
                "subtitle": subtitle,
                "meta": meta,
            }
        )
    return normalized


def normalize_journal_photos(
    photos: list[str] | None,
    previous_photos: list[str] | None = None,
) -> list[str]:
    if photos is None:
        return previous_photos or []
    previous_photos = previous_photos or []
    next_photos: list[str] = []
    for item in photos:
        if not item:
            continue
        if item.startswith("data:"):
            next_photos.append(save_image(item, "journal"))
        elif item.startswith("/uploads/"):
            next_photos.append(item)
    for old in previous_photos:
        if old not in next_photos:
            maybe_delete_upload(old)
    return next_photos


def normalize_tierlist_tiers(tiers) -> list[dict]:
    if not tiers:
        return []
    normalized = []
    for tier in tiers:
        label = getattr(tier, "label", None)
        color = getattr(tier, "color", None)
        items = getattr(tier, "items", None)
        if isinstance(tier, dict):
            if label is None:
                label = tier.get("label")
            if color is None:
                color = tier.get("color")
            if items is None:
                items = tier.get("items", [])
        label = str(label or "").strip() or "Tier"
        color = str(color or "").strip() or "#64748B"
        items = items or []
        normalized.append(
            {
                "label": label,
                "color": color,
                "items": [str(item).strip() for item in items if str(item).strip()],
            }
        )
    return normalized


def normalize_food_visit_dishes(dishes) -> list[dict]:
    if not dishes:
        return []
    normalized = []
    for dish in dishes:
        name = getattr(dish, "name", None) or dish.get("name")
        if not name:
            continue
        name = str(name).strip()
        if not name:
            continue
        rating = getattr(dish, "rating", None)
        if rating is None and isinstance(dish, dict):
            rating = dish.get("rating")
        try:
            rating = float(rating) if rating is not None else None
        except (TypeError, ValueError):
            rating = None
        normalized.append({"name": name, "rating": rating})
    return normalized


def decode_food_visit_dishes(value: str | None) -> list[dict]:
    if not value:
        return []
    try:
        raw = json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return []
    if not isinstance(raw, list):
        return []
    normalized = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name", "")).strip()
        if not name:
            continue
        rating = item.get("rating")
        try:
            rating = float(rating) if rating is not None else None
        except (TypeError, ValueError):
            rating = None
        normalized.append({"name": name, "rating": rating})
    return normalized


def serialize_activity(activity: Activity) -> ActivityOut:
    updated_by = activity.updated_by_user
    return ActivityOut(
        id=activity.id,
        activity_type=activity.activity_type,
        name=activity.name,
        address=activity.address,
        latitude=activity.latitude,
        longitude=activity.longitude,
        category=activity.category,
        distance_km=activity.distance_km,
        difficulty=activity.difficulty,
        description=activity.description,
        image_url=activity.image_url,
        rating=activity.rating,
        done_at=activity.done_at.isoformat() if activity.done_at else None,
        updated_at=activity.updated_at.isoformat() if activity.updated_at else None,
        updated_by_name=updated_by.display_name if updated_by else None,
        updated_by_avatar_url=updated_by.avatar_url if updated_by else None,
        updated_by_telegram_uid=updated_by.telegram_uid if updated_by else None,
    )


def build_user_lookup(db: Session, user_ids: set[int]) -> dict[int, User]:
    if not user_ids:
        return {}
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    return {user.id: user for user in users}


def update_activity_done_at(db: Session, activity_id: int) -> None:
    last_visit = (
        db.query(func.max(ActivityVisit.visited_at))
        .filter(ActivityVisit.activity_id == activity_id)
        .scalar()
    )
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        return
    activity.done_at = last_visit
    db.commit()


def is_singapore_label(label: str | None) -> bool:
    if not label:
        return False
    return "singapore" in label.lower()


def extract_location_parts(label: str | None) -> tuple[str | None, str | None]:
    if not label:
        return None, None
    parts = [part.strip() for part in label.split(",") if part.strip()]
    if not parts:
        return None, None
    country = parts[-1]
    city = parts[-2] if len(parts) >= 2 else None
    return country, city


def build_trips(check_ins: list[CheckIn]) -> list[TripOut]:
    trips: list[dict] = []
    current = None
    for entry in check_ins:
        label = entry.location_label or entry.location_name or ""
        if is_singapore_label(label):
            if current:
                trips.append(current)
                current = None
            continue
        visit_date = entry.visited_at
        if current is None:
            current = {
                "start": visit_date,
                "end": visit_date,
                "countries": set(),
                "cities": set(),
                "check_ins": [],
            }
        else:
            diff_days = (visit_date - current["end"]).total_seconds() / 86400
            if diff_days > 2:
                trips.append(current)
                current = {
                    "start": visit_date,
                    "end": visit_date,
                    "countries": set(),
                    "cities": set(),
                    "check_ins": [],
                }
            else:
                current["end"] = visit_date
        country, city = extract_location_parts(label)
        if country:
            current["countries"].add(country)
        if city:
            current["cities"].add(city)
        current["check_ins"].append(entry)
    if current:
        trips.append(current)
    output = []
    for index, trip in enumerate(trips):
        countries = sorted(trip["countries"])
        cities = sorted(trip["cities"])
        if len(countries) > 1:
            display = ", ".join(countries)
        elif cities:
            display = ", ".join(cities)
        else:
            display = countries[0] if countries else "Trip"
        output.append(
            TripOut(
                id=f"trip-{index}",
                display=display,
                countries=countries,
                cities=cities,
                start_at=trip["start"].isoformat(),
                end_at=trip["end"].isoformat(),
                check_ins=[
                    TripCheckInOut(
                        id=item.id,
                        visited_at=item.visited_at.isoformat(),
                        location_label=item.location_label,
                        location_name=item.location_name,
                    )
                    for item in trip["check_ins"]
                ],
            )
        )
    output.sort(key=lambda trip: trip.end_at, reverse=True)
    return output


def issue_refresh_token(db: Session, user: User, device_id: str | None = None) -> str:
    token = generate_token()
    refresh = RefreshToken(
        user_id=user.id,
        token=token,
        device_id=device_id,
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_DAYS),
        revoked_at=None,
    )
    db.add(refresh)
    db.commit()
    return token


def rotate_refresh_token(
    db: Session, token: str, device_id: str | None = None
) -> tuple[User, str]:
    refresh = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token == token,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at >= datetime.utcnow(),
        )
        .first()
    )
    if not refresh:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if refresh.device_id:
        if not device_id or refresh.device_id != device_id:
            raise HTTPException(status_code=401, detail="Unauthorized")
        device = (
            db.query(TrustedDevice)
            .filter(
                TrustedDevice.user_id == refresh.user_id,
                TrustedDevice.device_id == refresh.device_id,
                TrustedDevice.revoked_at.is_(None),
                TrustedDevice.trusted_until >= now_plus(0),
            )
            .first()
        )
        if not device:
            raise HTTPException(status_code=401, detail="Unauthorized")
    refresh.revoked_at = datetime.utcnow()
    db.add(refresh)
    db.commit()
    user = db.query(User).filter(User.id == refresh.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    new_token = issue_refresh_token(db, user, device_id or refresh.device_id)
    return user, new_token


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/auth/request-otp", response_model=OtpResponse)
async def request_otp(payload: OtpRequest, db: Session = Depends(get_db)):
    ensure_whitelisted(payload.telegram_uid)
    recent_token = (
        db.query(OtpToken)
        .filter(OtpToken.telegram_uid == payload.telegram_uid)
        .order_by(OtpToken.created_at.desc())
        .first()
    )
    if recent_token:
        seconds_since = (datetime.utcnow() - recent_token.created_at).total_seconds()
        if seconds_since < 30:
            retry_after = int(30 - seconds_since)
            raise HTTPException(
                status_code=429,
                detail=f"OTP recently sent. Retry in {retry_after}s.",
                headers={"Retry-After": str(max(retry_after, 1))},
            )
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
        response = requests.post(
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


@app.post("/auth/verify-pin", response_model=PinVerifyResponse)
async def verify_pin(payload: PinVerify, db: Session = Depends(get_db)):
    ensure_whitelisted(payload.telegram_uid)
    user = get_or_create_user(db, payload.telegram_uid)
    ensure_pin_valid(user, payload.pin)
    if payload.device_id:
        device = (
            db.query(TrustedDevice)
            .filter(
                TrustedDevice.user_id == user.id,
                TrustedDevice.device_id == payload.device_id,
                TrustedDevice.revoked_at.is_(None),
                TrustedDevice.trusted_until >= now_plus(0),
            )
            .first()
        )
        if device:
            device.last_seen_at = datetime.utcnow()
            db.add(device)
            db.commit()
            access_token = create_access_token(str(user.id))
            refresh_token = issue_refresh_token(db, user, payload.device_id)
            return PinVerifyResponse(
                status="trusted",
                access_token=access_token,
                refresh_token=refresh_token,
            )
    if SKIP_OTP:
        if payload.device_id:
            trust_device(db, user, payload.device_id, payload.device_name, payload.user_agent)
        access_token = create_access_token(str(user.id))
        refresh_token = issue_refresh_token(db, user, payload.device_id)
        return PinVerifyResponse(
            status="trusted",
            access_token=access_token,
            refresh_token=refresh_token,
        )
    recent_token = (
        db.query(OtpToken)
        .filter(OtpToken.telegram_uid == payload.telegram_uid)
        .order_by(OtpToken.created_at.desc())
        .first()
    )
    if recent_token:
        seconds_since = (datetime.utcnow() - recent_token.created_at).total_seconds()
        if seconds_since < 30:
            retry_after = int(30 - seconds_since)
            raise HTTPException(
                status_code=429,
                detail=f"OTP recently sent. Retry in {retry_after}s.",
                headers={"Retry-After": str(max(retry_after, 1))},
            )
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
        response = requests.post(
            f"{BOT_SERVICE_URL}/send-otp",
            json={"telegram_uid": payload.telegram_uid, "pin": pin},
            timeout=5,
        )
        response.raise_for_status()
    except requests.RequestException:
        return PinVerifyResponse(status="otp_pending")
    return PinVerifyResponse(status="otp_sent")


@app.post("/admin/set-pin", response_model=PinSetResponse)
async def set_pin(
    payload: PinSet,
    db: Session = Depends(get_db),
    x_admin_token: str | None = Header(default=None),
):
    if not ADMIN_API_KEY or x_admin_token != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    ensure_whitelisted(payload.telegram_uid)
    user = get_or_create_user(db, payload.telegram_uid)
    pin_hash, pin_salt = hash_pin(payload.pin)
    user.pin_hash = pin_hash
    user.pin_salt = pin_salt
    db.add(user)
    db.commit()
    return PinSetResponse(status="set")


@app.post("/admin/set-profile", response_model=ProfileSetResponse)
async def set_profile(
    payload: ProfileSet,
    db: Session = Depends(get_db),
    x_admin_token: str | None = Header(default=None),
):
    if not ADMIN_API_KEY or x_admin_token != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    ensure_whitelisted(payload.telegram_uid)
    user = get_or_create_user(db, payload.telegram_uid)
    if payload.display_name is not None:
        user.display_name = payload.display_name
    if payload.avatar_data is not None:
        if payload.avatar_data == "":
            maybe_delete_avatar(user.avatar_url)
            user.avatar_url = None
        else:
            maybe_delete_avatar(user.avatar_url)
            user.avatar_url = save_image(payload.avatar_data, "user/profilepic")
    if payload.header_data is not None:
        if payload.header_data == "":
            maybe_delete_avatar(user.header_url)
            user.header_url = None
        else:
            maybe_delete_avatar(user.header_url)
            user.header_url = save_image(payload.header_data, "user/header")
    elif payload.avatar_url is not None:
        if payload.avatar_url == "":
            maybe_delete_avatar(user.avatar_url)
            user.avatar_url = None
        else:
            if payload.avatar_url != user.avatar_url:
                maybe_delete_avatar(user.avatar_url)
            user.avatar_url = payload.avatar_url
    elif payload.header_url is not None:
        if payload.header_url == "":
            maybe_delete_avatar(user.header_url)
            user.header_url = None
        else:
            if payload.header_url != user.header_url:
                maybe_delete_avatar(user.header_url)
            user.header_url = payload.header_url
    if payload.birthday is not None:
        try:
            user.birthday = datetime.fromisoformat(payload.birthday)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid birthday format")
    if payload.accent_color is not None:
        user.accent_color = payload.accent_color or None
    db.add(user)
    db.commit()
    return ProfileSetResponse(status="set")


@app.get("/public/users", response_model=UserListResponse)
async def list_users(db: Session = Depends(get_db)):
    users: list[UserPublic] = []
    for telegram_uid in sorted(WHITELIST):
        user = get_or_create_user(db, telegram_uid)
        users.append(
            UserPublic(
                telegram_uid=user.telegram_uid,
                display_name=user.display_name,
                avatar_url=user.avatar_url,
                header_url=user.header_url,
                accent_color=user.accent_color,
                birthday=user.birthday.isoformat() if user.birthday else None,
            )
        )
    return UserListResponse(users=users)


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
    if payload.device_id:
        trust_device(db, user, payload.device_id, payload.device_name, payload.user_agent)
    access_token = create_access_token(str(user.id))
    refresh_token = issue_refresh_token(db, user, payload.device_id)
    return AuthResponse(access_token=access_token, refresh_token=refresh_token)


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
    link = f"{app_origin}/?token={token_value}"
    return MagicLinkResponse(
        status="created",
        magic_link=link,
        expires_in_seconds=MAGIC_LINK_TTL_SECONDS,
    )


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
    refresh_token = issue_refresh_token(db, user)
    try:
        bot_url = os.getenv("BOT_INTERNAL_URL", "http://bot:9000")
        bot_key = os.getenv("BOT_API_KEY", "")
        headers = {"X-Bot-Token": bot_key} if bot_key else {}
        requests.post(
            f"{bot_url}/magic-link/expire",
            json={"token": payload.token},
            headers=headers,
            timeout=3,
        )
    except Exception:
        pass
    return AuthResponse(access_token=access_token, refresh_token=refresh_token)


@app.post("/auth/refresh", response_model=AuthResponse)
async def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    user, new_refresh = rotate_refresh_token(
        db, payload.refresh_token, payload.device_id
    )
    access_token = create_access_token(str(user.id))
    return AuthResponse(access_token=access_token, refresh_token=new_refresh)


@app.post("/auth/logout", response_model=ProfileSetResponse)
async def logout(payload: RefreshRequest, db: Session = Depends(get_db)):
    refresh = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token == payload.refresh_token,
            RefreshToken.revoked_at.is_(None),
        )
        .first()
    )
    if refresh:
        refresh.revoked_at = datetime.utcnow()
        db.add(refresh)
        db.commit()
    return ProfileSetResponse(status="logged_out")


@app.get("/me", response_model=ProfileResponse)
async def get_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    devices = (
        db.query(TrustedDevice)
        .filter(TrustedDevice.user_id == user.id)
        .order_by(TrustedDevice.last_seen_at.desc())
        .all()
    )
    return ProfileResponse(
        telegram_uid=user.telegram_uid,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        header_url=user.header_url,
        accent_color=user.accent_color,
        birthday=user.birthday.isoformat() if user.birthday else None,
        trusted_devices=[
            TrustedDeviceOut(
                id=device.id,
                device_id=device.device_id,
                device_name=device.device_name,
                user_agent=device.user_agent,
                trusted_until=device.trusted_until.isoformat(),
                revoked_at=device.revoked_at.isoformat() if device.revoked_at else None,
                last_seen_at=device.last_seen_at.isoformat(),
            )
            for device in devices
        ],
    )


@app.get("/me/activity", response_model=UserActivityListResponse)
async def list_user_activity(
    limit: int = 6,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    limit = max(min(limit, 50), 1)
    entries = (
        db.query(UserActivity)
        .filter(UserActivity.user_id == user.id)
        .order_by(UserActivity.created_at.desc())
        .limit(limit)
        .all()
    )
    entity_map = {entry.entity_type: set() for entry in entries}
    for entry in entries:
        if entry.entity_id:
            entity_map[entry.entity_type].add(entry.entity_id)
    food_places = (
        db.query(FoodPlace)
        .filter(FoodPlace.id.in_(entity_map.get("food_place", set())))
        .all()
        if entity_map.get("food_place")
        else []
    )
    food_places_by_id = {place.id: place for place in food_places}
    food_visits = (
        db.query(FoodVisit)
        .filter(FoodVisit.id.in_(entity_map.get("food_visit", set())))
        .all()
        if entity_map.get("food_visit")
        else []
    )
    food_visits_by_id = {visit.id: visit for visit in food_visits}
    food_visit_comments = (
        db.query(FoodVisitComment)
        .filter(FoodVisitComment.id.in_(entity_map.get("food_visit_comment", set())))
        .all()
        if entity_map.get("food_visit_comment")
        else []
    )
    food_visit_comments_by_id = {comment.id: comment for comment in food_visit_comments}
    food_comment_visit_ids = {comment.visit_id for comment in food_visit_comments}
    food_comment_visits = (
        db.query(FoodVisit)
        .filter(FoodVisit.id.in_(food_comment_visit_ids))
        .all()
        if food_comment_visit_ids
        else []
    )
    food_comment_visits_by_id = {visit.id: visit for visit in food_comment_visits}
    food_comment_place_ids = {
        visit.food_place_id for visit in food_comment_visits if visit.food_place_id
    }
    food_comment_places = (
        db.query(FoodPlace)
        .filter(FoodPlace.id.in_(food_comment_place_ids))
        .all()
        if food_comment_place_ids
        else []
    )
    food_comment_places_by_id = {
        place.id: place for place in food_comment_places
    }
    activities = (
        db.query(Activity)
        .filter(Activity.id.in_(entity_map.get("activity", set())))
        .all()
        if entity_map.get("activity")
        else []
    )
    activities_by_id = {activity.id: activity for activity in activities}
    activity_visits = (
        db.query(ActivityVisit)
        .filter(ActivityVisit.id.in_(entity_map.get("activity_visit", set())))
        .all()
        if entity_map.get("activity_visit")
        else []
    )
    activity_visits_by_id = {visit.id: visit for visit in activity_visits}
    activity_visit_comments = (
        db.query(ActivityVisitComment)
        .filter(
            ActivityVisitComment.id.in_(
                entity_map.get("activity_visit_comment", set())
            )
        )
        .all()
        if entity_map.get("activity_visit_comment")
        else []
    )
    activity_visit_comments_by_id = {
        comment.id: comment for comment in activity_visit_comments
    }
    activity_comment_visit_ids = {
        comment.visit_id for comment in activity_visit_comments
    }
    activity_comment_visits = (
        db.query(ActivityVisit)
        .filter(ActivityVisit.id.in_(activity_comment_visit_ids))
        .all()
        if activity_comment_visit_ids
        else []
    )
    activity_comment_visits_by_id = {
        visit.id: visit for visit in activity_comment_visits
    }
    activity_comment_activity_ids = {
        visit.activity_id for visit in activity_comment_visits if visit.activity_id
    }
    activity_comment_activities = (
        db.query(Activity)
        .filter(Activity.id.in_(activity_comment_activity_ids))
        .all()
        if activity_comment_activity_ids
        else []
    )
    activity_comment_activities_by_id = {
        activity.id: activity for activity in activity_comment_activities
    }
    journal_entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.id.in_(entity_map.get("journal_entry", set())))
        .all()
        if entity_map.get("journal_entry")
        else []
    )
    journal_entries_by_id = {entry.id: entry for entry in journal_entries}
    tierlists = (
        db.query(Tierlist)
        .filter(Tierlist.id.in_(entity_map.get("tierlist", set())))
        .all()
        if entity_map.get("tierlist")
        else []
    )
    tierlists_by_id = {entry.id: entry for entry in tierlists}
    tierlist_comments = (
        db.query(TierlistComment)
        .filter(TierlistComment.id.in_(entity_map.get("tierlist_comment", set())))
        .all()
        if entity_map.get("tierlist_comment")
        else []
    )
    tierlist_comments_by_id = {
        comment.id: comment for comment in tierlist_comments
    }
    tierlist_comment_ids = {comment.tierlist_id for comment in tierlist_comments}
    tierlist_comment_targets = (
        db.query(Tierlist)
        .filter(Tierlist.id.in_(tierlist_comment_ids))
        .all()
        if tierlist_comment_ids
        else []
    )
    tierlist_comment_targets_by_id = {
        entry.id: entry for entry in tierlist_comment_targets
    }

    items = []
    for entry in entries:
        entity_title = None
        entity_subtitle = None
        entity_image_url = None
        if entry.entity_type == "food_place":
            place = food_places_by_id.get(entry.entity_id)
            if place:
                entity_title = place.name
                entity_subtitle = place.location_label
                entity_image_url = place.header_url
        elif entry.entity_type == "food_visit":
            visit = food_visits_by_id.get(entry.entity_id)
            if visit:
                place = db.query(FoodPlace).filter(FoodPlace.id == visit.food_place_id).first()
                entity_title = place.name if place else None
                entity_subtitle = visit.visited_at.isoformat() if visit.visited_at else None
                entity_image_url = visit.photo_url or (place.header_url if place else None)
        elif entry.entity_type == "food_visit_comment":
            comment = food_visit_comments_by_id.get(entry.entity_id)
            if comment:
                visit = food_comment_visits_by_id.get(comment.visit_id)
                place = (
                    food_comment_places_by_id.get(visit.food_place_id)
                    if visit
                    else None
                )
                entity_title = place.name if place else "Food visit"
                entity_subtitle = comment.body or (
                    visit.visited_at.isoformat() if visit and visit.visited_at else None
                )
                entity_image_url = (
                    visit.photo_url
                    if visit and visit.photo_url
                    else (place.header_url if place else None)
                )
        elif entry.entity_type == "activity":
            activity = activities_by_id.get(entry.entity_id)
            if activity:
                entity_title = activity.name
                entity_subtitle = activity.address
                entity_image_url = activity.image_url
        elif entry.entity_type == "activity_visit":
            visit = activity_visits_by_id.get(entry.entity_id)
            if visit:
                activity = db.query(Activity).filter(Activity.id == visit.activity_id).first()
                entity_title = visit.activity_title or (activity.name if activity else None)
                entity_subtitle = visit.visited_at.isoformat() if visit.visited_at else None
                entity_image_url = visit.photo_url or (activity.image_url if activity else None)
        elif entry.entity_type == "activity_visit_comment":
            comment = activity_visit_comments_by_id.get(entry.entity_id)
            if comment:
                visit = activity_comment_visits_by_id.get(comment.visit_id)
                activity = (
                    activity_comment_activities_by_id.get(visit.activity_id)
                    if visit
                    else None
                )
                entity_title = activity.name if activity else "Activity visit"
                entity_subtitle = comment.body or (
                    visit.visited_at.isoformat() if visit and visit.visited_at else None
                )
                entity_image_url = (
                    visit.photo_url
                    if visit and visit.photo_url
                    else (activity.image_url if activity else None)
                )
        elif entry.entity_type == "journal_entry":
            journal = journal_entries_by_id.get(entry.entity_id)
            if journal:
                entity_title = journal.title
                entity_subtitle = journal.entry_date.isoformat()
                if journal.photos_json:
                    try:
                        photos = json.loads(journal.photos_json)
                    except json.JSONDecodeError:
                        photos = []
                    entity_image_url = photos[0] if photos else None
        elif entry.entity_type == "tierlist":
            tierlist = tierlists_by_id.get(entry.entity_id)
            if tierlist:
                entity_title = tierlist.title
                entity_subtitle = tierlist.description
                entity_image_url = tierlist.header_url
        elif entry.entity_type == "tierlist_comment":
            comment = tierlist_comments_by_id.get(entry.entity_id)
            if comment:
                tierlist = tierlist_comment_targets_by_id.get(comment.tierlist_id)
                entity_title = tierlist.title if tierlist else "Tierlist"
                entity_subtitle = comment.body or (
                    tierlist.description if tierlist else None
                )
                entity_image_url = tierlist.header_url if tierlist else None
        items.append(
            serialize_user_activity(
                entry,
                entity_title=entity_title,
                entity_subtitle=entity_subtitle,
                entity_image_url=entity_image_url,
            )
        )
    return UserActivityListResponse(
        items=items
    )


@app.patch("/me", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.display_name is not None:
        user.display_name = payload.display_name
    if payload.avatar_data is not None:
        if payload.avatar_data == "":
            maybe_delete_avatar(user.avatar_url)
            user.avatar_url = None
        else:
            maybe_delete_avatar(user.avatar_url)
            user.avatar_url = save_image(payload.avatar_data, "user/profilepic")
    if payload.header_data is not None:
        if payload.header_data == "":
            maybe_delete_avatar(user.header_url)
            user.header_url = None
        else:
            maybe_delete_avatar(user.header_url)
            user.header_url = save_image(payload.header_data, "user/header")
    elif payload.avatar_url is not None:
        if payload.avatar_url == "":
            maybe_delete_avatar(user.avatar_url)
            user.avatar_url = None
        else:
            if payload.avatar_url != user.avatar_url:
                maybe_delete_avatar(user.avatar_url)
            user.avatar_url = payload.avatar_url
    elif payload.header_url is not None:
        if payload.header_url == "":
            maybe_delete_avatar(user.header_url)
            user.header_url = None
        else:
            if payload.header_url != user.header_url:
                maybe_delete_avatar(user.header_url)
            user.header_url = payload.header_url
    if payload.birthday is not None:
        if payload.birthday == "":
            user.birthday = None
        else:
            try:
                user.birthday = datetime.fromisoformat(payload.birthday)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid birthday format")
    if payload.accent_color is not None:
        user.accent_color = payload.accent_color or None
    db.add(user)
    db.commit()
    db.refresh(user)
    devices = (
        db.query(TrustedDevice)
        .filter(TrustedDevice.user_id == user.id)
        .order_by(TrustedDevice.last_seen_at.desc())
        .all()
    )
    return ProfileResponse(
        telegram_uid=user.telegram_uid,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        header_url=user.header_url,
        accent_color=user.accent_color,
        birthday=user.birthday.isoformat() if user.birthday else None,
        trusted_devices=[
            TrustedDeviceOut(
                id=device.id,
                device_id=device.device_id,
                device_name=device.device_name,
                user_agent=device.user_agent,
                trusted_until=device.trusted_until.isoformat(),
                revoked_at=device.revoked_at.isoformat() if device.revoked_at else None,
                last_seen_at=device.last_seen_at.isoformat(),
            )
            for device in devices
        ],
    )


@app.post("/me/pin", response_model=PinChangeResponse)
async def change_pin(
    payload: PinChangeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.pin_hash and user.pin_salt:
        if not payload.current_pin:
            raise HTTPException(status_code=400, detail="Current pin required")
        if not verify_pin_hash(payload.current_pin, user.pin_salt, user.pin_hash):
            raise HTTPException(status_code=401, detail="Invalid pin")
    pin_hash, pin_salt = hash_pin(payload.new_pin)
    user.pin_hash = pin_hash
    user.pin_salt = pin_salt
    db.add(user)
    db.commit()
    return PinChangeResponse(status="changed")


@app.post("/me/pin/verify", response_model=PinCurrentVerifyResponse)
async def verify_current_pin(
    payload: PinVerifyRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.pin_hash and user.pin_salt:
        if not payload.current_pin:
            raise HTTPException(status_code=400, detail="Current pin required")
        if not verify_pin_hash(payload.current_pin, user.pin_salt, user.pin_hash):
            raise HTTPException(status_code=401, detail="Invalid pin")
    return PinCurrentVerifyResponse(status="ok")


@app.post("/devices/revoke/{device_id}", response_model=ProfileSetResponse)
async def revoke_device(
    device_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    device = (
        db.query(TrustedDevice)
        .filter(TrustedDevice.id == device_id, TrustedDevice.user_id == user.id)
        .first()
    )
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    db.delete(device)
    db.commit()
    return ProfileSetResponse(status="deleted")


@app.post("/devices/revoke-self", response_model=ProfileSetResponse)
async def revoke_self(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    x_device_id: str | None = Header(default=None),
):
    if not x_device_id:
        raise HTTPException(status_code=400, detail="Device id required")
    device = (
        db.query(TrustedDevice)
        .filter(
            TrustedDevice.user_id == user.id,
            TrustedDevice.device_id == x_device_id,
        )
        .first()
    )
    if not device:
        return ProfileSetResponse(status="not_found")
    db.delete(device)
    db.commit()
    return ProfileSetResponse(status="deleted")


@app.post("/check-ins", response_model=CheckInOut)
async def create_check_in(
    payload: CheckInCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    visited_at = parse_iso_datetime(payload.visited_at)
    check_in = CheckIn(
        user_id=user.id,
        location_name=payload.location_name,
        location_label=payload.location_label,
        latitude=payload.latitude,
        longitude=payload.longitude,
        visited_at=visited_at,
    )
    db.add(check_in)
    db.flush()
    log_user_activity(
        db,
        user,
        action="create",
        entity_type="check_in",
        entity_id=check_in.id,
        summary=f"Checked in at {check_in.location_label}",
    )
    db.commit()
    db.refresh(check_in)
    return CheckInOut(
        id=check_in.id,
        location_name=check_in.location_name,
        location_label=check_in.location_label,
        latitude=check_in.latitude,
        longitude=check_in.longitude,
        visited_at=check_in.visited_at.isoformat(),
    )


@app.get("/check-ins", response_model=CheckInListResponse)
async def list_check_ins(
    year: int | None = None,
    month: int | None = None,
    page: int = 1,
    page_size: int = 12,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = max(page, 1)
    page_size = min(max(page_size, 1), 50)
    query = db.query(CheckIn).filter(CheckIn.user_id == user.id)
    if year:
        start = datetime(year, 1, 1)
        end = datetime(year + 1, 1, 1)
        query = query.filter(CheckIn.visited_at >= start, CheckIn.visited_at < end)
    if month and year:
        start = datetime(year, month, 1)
        next_month = datetime(year + (1 if month == 12 else 0), (month % 12) + 1, 1)
        query = query.filter(
            CheckIn.visited_at >= start, CheckIn.visited_at < next_month
        )
    total = query.count()
    items = (
        query.order_by(CheckIn.visited_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    all_total = db.query(CheckIn).filter(CheckIn.user_id == user.id).count()
    now = datetime.utcnow()
    year_total = (
        db.query(CheckIn)
        .filter(
            CheckIn.user_id == user.id,
            CheckIn.visited_at >= datetime(now.year, 1, 1),
            CheckIn.visited_at < datetime(now.year + 1, 1, 1),
        )
        .count()
    )
    month_total = (
        db.query(CheckIn)
        .filter(
            CheckIn.user_id == user.id,
            CheckIn.visited_at >= datetime(now.year, now.month, 1),
            CheckIn.visited_at
            < datetime(now.year + (1 if now.month == 12 else 0), (now.month % 12) + 1, 1),
        )
        .count()
    )
    def top_location(base_query):
        top = (
            base_query.with_entities(
                func.coalesce(CheckIn.location_label, CheckIn.location_name).label("label"),
                func.count(CheckIn.id).label("count"),
                func.max(CheckIn.latitude).label("latitude"),
                func.max(CheckIn.longitude).label("longitude"),
            )
            .group_by("label")
            .order_by(func.count(CheckIn.id).desc())
            .first()
        )
        if not top:
            return None
        return CheckInTopLocation(
            label=top.label,
            count=top.count,
            latitude=top.latitude,
            longitude=top.longitude,
        )

    top_all_time = top_location(
        db.query(CheckIn).filter(CheckIn.user_id == user.id)
    )
    top_year = top_location(
        db.query(CheckIn).filter(
            CheckIn.user_id == user.id,
            CheckIn.visited_at >= datetime(now.year, 1, 1),
            CheckIn.visited_at < datetime(now.year + 1, 1, 1),
        )
    )
    years = [
        str(year)
        for (year,) in db.query(
            func.strftime("%Y", CheckIn.visited_at)
        )
        .filter(CheckIn.user_id == user.id)
        .distinct()
        .order_by(func.strftime("%Y", CheckIn.visited_at).desc())
        .all()
    ]
    return CheckInListResponse(
        items=[
            CheckInOut(
                id=item.id,
                location_name=item.location_name,
                location_label=item.location_label,
                latitude=item.latitude,
                longitude=item.longitude,
                visited_at=item.visited_at.isoformat(),
            )
            for item in items
        ],
        total=total,
        stats=CheckInStats(
            total=all_total,
            year=year_total,
            month=month_total,
            top_all_time=top_all_time,
            top_year=top_year,
        ),
        years=years,
    )


@app.post("/food-places", response_model=FoodPlaceOut)
async def create_food_place(
    payload: FoodPlaceCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    header_url: str | None = None
    if payload.header_data is not None:
        if payload.header_data == "":
            header_url = None
        else:
            header_url = save_image(payload.header_data, "food/place")
    place = FoodPlace(
        user_id=None,
        name=payload.name,
        location_name=payload.location_name,
        location_label=payload.location_label,
        latitude=payload.latitude,
        longitude=payload.longitude,
        cuisine=payload.cuisine,
        open=payload.open,
        header_url=header_url,
        comments=payload.comments,
        updated_at=datetime.utcnow(),
        updated_by_user_id=user.id,
    )
    db.add(place)
    db.flush()
    place_details = [
        f"Name: {place.name}",
        f"Location: {place.location_label}",
        f"Cuisine: {place.cuisine or 'N/A'}",
        f"Open: {'Yes' if place.open else 'No'}",
        "Rating: N/A",
    ]
    mention = build_telegram_mention(user)
    place_name = html.escape(place.name)
    place_location = html.escape(place.location_label or "Unknown location")
    place_cuisine = html.escape(place.cuisine or "N/A")
    status_label = "Open" if place.open else "Permanently closed"
    bot_message = (
        "<b>🍽️ New Food Place</b>\n"
        f"Added by {mention}\n\n"
        f"<b>{place_name}</b>\n"
        f"{place_location}\n"
        f"Cuisine: {place_cuisine}\n"
        f"Status: {status_label}"
    )
    maps_url = build_google_maps_url(place.location_label, place.latitude, place.longitude)
    view_url = f"{APP_ORIGIN}/food/place/{place.id}"
    buttons = [{"text": "View in app", "url": view_url}]
    if maps_url:
        buttons.append({"text": "Open in maps", "url": maps_url})
    reply_markup = {"inline_keyboard": [buttons]}
    log_user_activity(
        db,
        user,
        action="create",
        entity_type="food_place",
        entity_id=place.id,
        summary=f"Added food place {place.name}",
        details=place_details,
        image_url=build_public_url(place.header_url),
        bot_message=bot_message,
        bot_image_url=build_public_url(place.header_url),
        bot_reply_markup=reply_markup,
        bot_parse_mode="HTML",
    )
    db.commit()
    db.refresh(place)
    return FoodPlaceOut(
        id=place.id,
        name=place.name,
        location_name=place.location_name,
        location_label=place.location_label,
        latitude=place.latitude,
        longitude=place.longitude,
        cuisine=place.cuisine,
        open=place.open,
        header_url=place.header_url,
        comments=place.comments,
        avg_rating=None,
        updated_at=place.updated_at.isoformat() if place.updated_at else None,
        updated_by_name=user.display_name,
        updated_by_avatar_url=user.avatar_url,
        updated_by_telegram_uid=user.telegram_uid,
    )


@app.patch("/food-places/{place_id}", response_model=FoodPlaceOut)
async def update_food_place(
    place_id: int,
    payload: FoodPlaceUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    place = db.query(FoodPlace).filter(FoodPlace.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Food place not found")
    if payload.header_data is not None:
        previous_header = place.header_url
        if payload.header_data == "":
            if previous_header:
                maybe_delete_upload(previous_header)
            place.header_url = None
        else:
            place.header_url = save_image(payload.header_data, "food/place")
            if previous_header and previous_header != place.header_url:
                maybe_delete_upload(previous_header)
    if payload.name is not None:
        place.name = payload.name
    if payload.location_name is not None:
        place.location_name = payload.location_name
    if payload.location_label is not None:
        place.location_label = payload.location_label
    if payload.latitude is not None:
        place.latitude = payload.latitude
    if payload.longitude is not None:
        place.longitude = payload.longitude
    if payload.cuisine is not None:
        place.cuisine = payload.cuisine
    if payload.open is not None:
        place.open = payload.open
    if payload.comments is not None:
        place.comments = payload.comments
    place.updated_at = datetime.utcnow()
    place.updated_by_user_id = user.id
    log_user_activity(
        db,
        user,
        action="update",
        entity_type="food_place",
        entity_id=place.id,
        summary=f"Updated food place {place.name}",
    )
    db.commit()
    db.refresh(place)
    avg_rating = (
        db.query(func.avg(FoodVisit.rating))
        .filter(FoodVisit.food_place_id == place.id)
        .scalar()
    )
    visit_count = (
        db.query(func.count(FoodVisit.id))
        .filter(FoodVisit.food_place_id == place.id)
        .scalar()
    )
    return FoodPlaceOut(
        id=place.id,
        name=place.name,
        location_name=place.location_name,
        location_label=place.location_label,
        latitude=place.latitude,
        longitude=place.longitude,
        cuisine=place.cuisine,
        open=place.open,
        header_url=place.header_url,
        comments=place.comments,
        avg_rating=avg_rating,
        visit_count=visit_count,
        updated_at=place.updated_at.isoformat() if place.updated_at else None,
        updated_by_name=user.display_name,
        updated_by_avatar_url=user.avatar_url,
        updated_by_telegram_uid=user.telegram_uid,
    )


@app.delete("/food-places/{place_id}", response_model=ProfileSetResponse)
async def delete_food_place(
    place_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    place = db.query(FoodPlace).filter(FoodPlace.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Food place not found")
    log_user_activity(
        db,
        user,
        action="delete",
        entity_type="food_place",
        entity_id=place.id,
        summary=f"Deleted food place {place.name}",
    )
    visits = db.query(FoodVisit).filter(FoodVisit.food_place_id == place.id).all()
    for visit in visits:
        if visit.photo_url:
            maybe_delete_upload(visit.photo_url)
    if place.header_url:
        maybe_delete_upload(place.header_url)
    db.delete(place)
    db.commit()
    return ProfileSetResponse(status="deleted")


@app.get("/food-places", response_model=FoodPlaceListResponse)
async def list_food_places(
    page: int = 1,
    page_size: int = 12,
    search: str | None = None,
    status: str | None = None,
    category: str | None = None,
    sort_name: str | None = None,
    sort_rating: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = max(page, 1)
    page_size = min(max(page_size, 1), 50)
    base_query = db.query(FoodPlace)
    if search:
        like = f"%{search}%"
        base_query = base_query.filter(
            FoodPlace.name.ilike(like) | FoodPlace.location_label.ilike(like)
        )
    if status == "visited":
        base_query = base_query.filter(
            db.query(FoodVisit.id)
            .filter(FoodVisit.food_place_id == FoodPlace.id)
            .exists()
        )
    elif status == "not_visited":
        base_query = base_query.filter(
            ~db.query(FoodVisit.id)
            .filter(FoodVisit.food_place_id == FoodPlace.id)
            .exists()
        )
    if category:
        base_query = base_query.filter(FoodPlace.cuisine.ilike(f"{category}%"))
    total = base_query.count()
    rating_subquery = (
        db.query(
            FoodVisit.food_place_id.label("place_id"),
            func.avg(FoodVisit.rating).label("avg_rating"),
            func.count(FoodVisit.id).label("visit_count"),
        )
        .group_by(FoodVisit.food_place_id)
        .subquery()
    )
    list_query = (
        db.query(
            FoodPlace,
            rating_subquery.c.avg_rating,
            rating_subquery.c.visit_count,
        )
        .outerjoin(rating_subquery, rating_subquery.c.place_id == FoodPlace.id)
    )
    if search:
        like = f"%{search}%"
        list_query = list_query.filter(
            FoodPlace.name.ilike(like) | FoodPlace.location_label.ilike(like)
        )
    if status == "visited":
        list_query = list_query.filter(rating_subquery.c.visit_count.isnot(None))
    elif status == "not_visited":
        list_query = list_query.filter(rating_subquery.c.visit_count.is_(None))
    if category:
        list_query = list_query.filter(FoodPlace.cuisine.ilike(f"{category}%"))
    if sort_rating in {"low", "high"}:
        rating_value = func.coalesce(rating_subquery.c.avg_rating, 0)
        order = rating_value.asc() if sort_rating == "low" else rating_value.desc()
        list_query = list_query.order_by(order)
    if sort_name in {"az", "za"}:
        list_query = list_query.order_by(
            FoodPlace.name.asc() if sort_name == "az" else FoodPlace.name.desc()
        )
    items = (
        list_query.offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    all_total = db.query(FoodPlace).count()
    visited_total = (
        db.query(func.count(func.distinct(FoodVisit.food_place_id))).scalar() or 0
    )
    now = datetime.utcnow()
    year_total = (
        db.query(FoodVisit)
        .filter(
            FoodVisit.visited_at >= datetime(now.year, 1, 1),
            FoodVisit.visited_at < datetime(now.year + 1, 1, 1),
        )
        .count()
    )
    def top_place(base_query):
        avg_rating = func.avg(FoodVisit.rating)
        latest_visit = func.max(FoodVisit.visited_at)
        top = (
            base_query.with_entities(
                FoodPlace.id.label("id"),
                FoodPlace.name.label("name"),
                func.count(FoodVisit.id).label("count"),
                avg_rating.label("avg_rating"),
                func.max(FoodPlace.header_url).label("header_url"),
                latest_visit.label("latest_visit"),
            )
            .group_by(FoodPlace.id, FoodPlace.name)
            .order_by(
                func.count(FoodVisit.id).desc(),
                func.coalesce(avg_rating, 0).desc(),
                latest_visit.desc(),
            )
            .first()
        )
        if not top:
            return None
        return FoodPlaceTop(
            id=top.id,
            name=top.name,
            count=top.count,
            avg_rating=top.avg_rating,
            header_url=top.header_url,
            latest_visit_at=top.latest_visit.isoformat()
            if top.latest_visit
            else None,
        )

    def worst_rated_place():
        avg_rating = func.avg(FoodVisit.rating)
        latest_visit = func.max(FoodVisit.visited_at)
        worst = (
            db.query(FoodPlace)
            .join(FoodVisit, FoodVisit.food_place_id == FoodPlace.id)
            .filter(FoodVisit.rating.isnot(None))
            .with_entities(
                FoodPlace.id.label("id"),
                FoodPlace.name.label("name"),
                func.count(FoodVisit.id).label("count"),
                avg_rating.label("avg_rating"),
                func.max(FoodPlace.header_url).label("header_url"),
                latest_visit.label("latest_visit"),
            )
            .group_by(FoodPlace.id, FoodPlace.name)
            .order_by(avg_rating.asc(), latest_visit.desc())
            .first()
        )
        if not worst:
            return None
        return FoodPlaceTop(
            id=worst.id,
            name=worst.name,
            count=worst.count,
            avg_rating=worst.avg_rating,
            header_url=worst.header_url,
            latest_visit_at=worst.latest_visit.isoformat()
            if worst.latest_visit
            else None,
        )

    def most_controversial_place():
        avg_rating = func.avg(FoodVisit.rating)
        avg_sq = func.avg(FoodVisit.rating * FoodVisit.rating)
        variance = avg_sq - avg_rating * avg_rating
        latest_visit = func.max(FoodVisit.visited_at)
        controversial = (
            db.query(FoodPlace)
            .join(FoodVisit, FoodVisit.food_place_id == FoodPlace.id)
            .filter(FoodVisit.rating.isnot(None))
            .with_entities(
                FoodPlace.id.label("id"),
                FoodPlace.name.label("name"),
                func.count(FoodVisit.id).label("count"),
                avg_rating.label("avg_rating"),
                func.max(FoodPlace.header_url).label("header_url"),
                latest_visit.label("latest_visit"),
                variance.label("variance"),
            )
            .group_by(FoodPlace.id, FoodPlace.name)
            .having(func.count(FoodVisit.id) >= 2)
            .order_by(variance.desc(), func.count(FoodVisit.id).desc(), latest_visit.desc())
            .first()
        )
        if not controversial:
            return None
        return FoodPlaceTop(
            id=controversial.id,
            name=controversial.name,
            count=controversial.count,
            avg_rating=controversial.avg_rating,
            header_url=controversial.header_url,
            latest_visit_at=controversial.latest_visit.isoformat()
            if controversial.latest_visit
            else None,
        )

    top_all_time = top_place(
        db.query(FoodPlace)
        .join(FoodVisit, FoodVisit.food_place_id == FoodPlace.id)
    )
    top_year = top_place(
        db.query(FoodPlace)
        .join(FoodVisit, FoodVisit.food_place_id == FoodPlace.id)
        .filter(
            FoodVisit.visited_at >= datetime(now.year, 1, 1),
            FoodVisit.visited_at < datetime(now.year + 1, 1, 1),
        )
    )
    worst_rated = worst_rated_place()
    most_controversial = most_controversial_place()
    updated_by_users = build_user_lookup(
        db,
        {place.updated_by_user_id for place, _, _ in items if place.updated_by_user_id},
    )
    return FoodPlaceListResponse(
        items=[
            FoodPlaceOut(
                id=place.id,
                name=place.name,
                location_name=place.location_name,
                location_label=place.location_label,
                latitude=place.latitude,
                longitude=place.longitude,
                cuisine=place.cuisine,
                open=place.open,
                header_url=place.header_url,
                comments=place.comments,
                avg_rating=avg_rating,
                visit_count=visit_count,
                updated_at=place.updated_at.isoformat() if place.updated_at else None,
                updated_by_name=(
                    updated_by_users.get(place.updated_by_user_id).display_name
                    if place.updated_by_user_id in updated_by_users
                    else None
                ),
                updated_by_avatar_url=(
                    updated_by_users.get(place.updated_by_user_id).avatar_url
                    if place.updated_by_user_id in updated_by_users
                    else None
                ),
                updated_by_telegram_uid=(
                    updated_by_users.get(place.updated_by_user_id).telegram_uid
                    if place.updated_by_user_id in updated_by_users
                    else None
                ),
            )
            for place, avg_rating, visit_count in items
        ],
        total=total,
        stats=FoodPlaceStats(
            total=all_total,
            visited=visited_total,
            year=year_total,
            top_all_time=top_all_time,
            top_year=top_year,
            worst_rated=worst_rated,
            most_controversial=most_controversial,
        ),
    )


@app.post("/food-places/roll", response_model=FoodPlaceRollResponse)
async def roll_food_place(
    payload: FoodPlaceRollRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cuisine_categories = set(payload.cuisine_categories or [])
    has_location = payload.latitude is not None and payload.longitude is not None
    places_query = db.query(FoodPlace).filter(FoodPlace.open.is_(True))
    places = places_query.all()
    if cuisine_categories:
        places = [
            place
            for place in places
            if place.cuisine
            and place.cuisine.split(" • ")[0].strip() in cuisine_categories
        ]
    if not places:
        return FoodPlaceRollResponse(place=None, radius_km=None)
    place_ids = [place.id for place in places]
    visits = (
        db.query(FoodVisit).filter(FoodVisit.food_place_id.in_(place_ids)).all()
    )
    visits_by_place: dict[int, list[FoodVisit]] = {}
    for visit in visits:
        visits_by_place.setdefault(visit.food_place_id, []).append(visit)
    candidates = []
    for place in places:
        place_visits = visits_by_place.get(place.id, [])
        if any(visit.again == "no" for visit in place_visits):
            continue
        candidates.append(place)
    if not candidates:
        return FoodPlaceRollResponse(place=None, radius_km=None)
    radius_km = None
    if has_location:
        radii = [5, 10, 15, 20, 30, 40, 50]
        filtered = []
        for radius in radii:
            nearby = [
                place
                for place in candidates
                if haversine_km(
                    payload.latitude,
                    payload.longitude,
                    place.latitude,
                    place.longitude,
                )
                <= radius
            ]
            if nearby:
                filtered = nearby
                radius_km = radius
                break
        candidates = filtered or candidates
    unvisited = []
    visited_yes = []
    visited_maybe = []
    for place in candidates:
        place_visits = visits_by_place.get(place.id, [])
        if not place_visits:
            unvisited.append(place)
            continue
        if any(visit.again == "yes" for visit in place_visits):
            visited_yes.append(place)
            continue
        if any(visit.again == "maybe" for visit in place_visits):
            visited_maybe.append(place)
            continue
        visited_maybe.append(place)
    buckets = [
        ("unvisited", 0.6, unvisited),
        ("yes", 0.3, visited_yes),
        ("maybe", 0.1, visited_maybe),
    ]
    available = [(weight, items) for _, weight, items in buckets if items]
    if not available:
        return FoodPlaceRollResponse(place=None, radius_km=radius_km)
    total_weight = sum(weight for weight, _ in available)
    pick = random.random() * total_weight
    chosen_items = available[0][1]
    for weight, items in available:
        pick -= weight
        if pick <= 0:
            chosen_items = items
            break
    chosen = random.choice(chosen_items)
    avg_rating = (
        db.query(func.avg(FoodVisit.rating))
        .filter(FoodVisit.food_place_id == chosen.id)
        .scalar()
    )
    visit_count = (
        db.query(func.count(FoodVisit.id))
        .filter(FoodVisit.food_place_id == chosen.id)
        .scalar()
    )
    updated_by = (
        db.query(User).filter(User.id == chosen.updated_by_user_id).first()
        if chosen.updated_by_user_id
        else None
    )
    return FoodPlaceRollResponse(
        place=FoodPlaceOut(
            id=chosen.id,
            name=chosen.name,
            location_name=chosen.location_name,
            location_label=chosen.location_label,
            latitude=chosen.latitude,
            longitude=chosen.longitude,
            cuisine=chosen.cuisine,
            open=chosen.open,
            header_url=chosen.header_url,
            comments=chosen.comments,
            avg_rating=avg_rating,
            visit_count=visit_count,
            updated_at=chosen.updated_at.isoformat() if chosen.updated_at else None,
            updated_by_name=updated_by.display_name if updated_by else None,
            updated_by_avatar_url=updated_by.avatar_url if updated_by else None,
            updated_by_telegram_uid=updated_by.telegram_uid if updated_by else None,
        ),
        radius_km=radius_km,
    )


@app.post("/activities/roll", response_model=ActivityRollResponse)
async def roll_activity(
    payload: ActivityRollRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activity_type = payload.activity_type
    if activity_type == "all":
        activity_type = None
    if activity_type not in {None, "exercise", "bucket"}:
        raise HTTPException(status_code=400, detail="Invalid activity type")
    categories = set(payload.categories or [])
    has_location = payload.latitude is not None and payload.longitude is not None

    query = db.query(Activity)
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)
    if categories:
        query = query.filter(Activity.category.in_(categories))
    activities = query.all()
    if not activities:
        return ActivityRollResponse(activity=None, radius_km=None)

    activity_ids = [activity.id for activity in activities]
    visits = (
        db.query(ActivityVisit)
        .filter(ActivityVisit.activity_id.in_(activity_ids))
        .all()
    )
    visits_by_activity: dict[int, list[ActivityVisit]] = {}
    for visit in visits:
        visits_by_activity.setdefault(visit.activity_id, []).append(visit)

    single_visit_categories = {
        "movies",
        "musicals",
        "exhibitions",
        "theatre",
        "concerts",
        "festivals",
    }
    candidates = []
    for activity in activities:
        if activity.rating == "down":
            continue
        activity_visits = visits_by_activity.get(activity.id, [])
        if any(visit.rating == "down" for visit in activity_visits):
            continue
        if (
            activity.activity_type == "bucket"
            and activity.category in single_visit_categories
            and activity.done_at
        ):
            continue
        candidates.append(activity)
    if not candidates:
        return ActivityRollResponse(activity=None, radius_km=None)

    radius_km = None
    if has_location:
        candidates_with_coords = [
            activity
            for activity in candidates
            if activity.latitude is not None and activity.longitude is not None
        ]
        if candidates_with_coords:
            radii = [5, 10, 15, 20, 30, 40, 50]
            filtered = []
            for radius in radii:
                nearby = [
                    activity
                    for activity in candidates_with_coords
                    if haversine_km(
                        payload.latitude,
                        payload.longitude,
                        activity.latitude,
                        activity.longitude,
                    )
                    <= radius
                ]
                if nearby:
                    filtered = nearby
                    radius_km = radius
                    break
            candidates = filtered or candidates_with_coords

    exercises = [activity for activity in candidates if activity.activity_type == "exercise"]
    buckets = [activity for activity in candidates if activity.activity_type == "bucket"]
    if activity_type == "exercise":
        chosen_pool = exercises
    elif activity_type == "bucket":
        chosen_pool = buckets
    else:
        last_exercise_visit = (
            db.query(func.max(ActivityVisit.visited_at))
            .join(Activity, Activity.id == ActivityVisit.activity_id)
            .filter(Activity.activity_type == "exercise")
            .scalar()
        )
        now = datetime.utcnow()
        use_exercise_weight = (
            last_exercise_visit is None
            or now - last_exercise_visit >= timedelta(days=14)
        )
        exercise_weight = 0.7 if use_exercise_weight else 0.5
        bucket_weight = 1 - exercise_weight
        available = []
        if exercises:
            available.append((exercise_weight, exercises))
        if buckets:
            available.append((bucket_weight, buckets))
        if not available:
            return ActivityRollResponse(activity=None, radius_km=radius_km)
        total_weight = sum(weight for weight, _ in available)
        pick = random.random() * total_weight
        chosen_pool = available[0][1]
        for weight, items in available:
            pick -= weight
            if pick <= 0:
                chosen_pool = items
                break

    if not chosen_pool:
        return ActivityRollResponse(activity=None, radius_km=radius_km)
    chosen = random.choice(chosen_pool)
    return ActivityRollResponse(
        activity=serialize_activity(chosen),
        radius_km=radius_km,
    )


@app.post("/activities", response_model=ActivityOut)
async def create_activity(
    payload: ActivityCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.activity_type not in {"exercise", "bucket"}:
        raise HTTPException(status_code=400, detail="Invalid activity type")
    image_url = None
    if payload.image_data is not None and payload.image_data != "":
        image_url = save_image(payload.image_data, "activities")
    done_at = parse_iso_datetime(payload.done_at) if payload.done_at else None
    activity = Activity(
        user_id=user.id,
        activity_type=payload.activity_type,
        name=payload.name,
        address=payload.address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        category=payload.category,
        distance_km=payload.distance_km
        if payload.activity_type == "exercise"
        else None,
        difficulty=payload.difficulty if payload.activity_type == "exercise" else None,
        description=payload.description,
        image_url=image_url,
        rating=payload.rating,
        done_at=done_at,
        updated_at=datetime.utcnow(),
        updated_by_user_id=user.id,
    )
    db.add(activity)
    db.flush()
    log_user_activity(
        db,
        user,
        action="create",
        entity_type="activity",
        entity_id=activity.id,
        summary=f"Added activity {activity.name}",
        image_url=build_public_url(activity.image_url),
    )
    db.commit()
    db.refresh(activity)
    return serialize_activity(activity)


@app.get("/activities", response_model=ActivityListResponse)
async def list_activities(
    activity_type: str | None = None,
    status: str | None = None,
    category: str | None = None,
    rating: str | None = None,
    difficulty: str | None = None,
    max_distance: float | None = None,
    search: str | None = None,
    sort: str | None = None,
    page: int = 1,
    page_size: int = 50,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    query = db.query(Activity)
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)
    if status == "done":
        query = query.filter(Activity.done_at.isnot(None))
    elif status == "not_done":
        query = query.filter(Activity.done_at.is_(None))
    if category:
        query = query.filter(Activity.category == category)
    if rating == "na":
        query = query.filter(Activity.rating.is_(None))
    elif rating:
        query = query.filter(Activity.rating == rating)
    if difficulty:
        query = query.filter(Activity.difficulty == difficulty)
    if max_distance is not None:
        query = query.filter(
            Activity.distance_km.isnot(None),
            Activity.distance_km <= max_distance,
        )
    if search:
        like = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Activity.name.ilike(like),
                Activity.address.ilike(like),
                Activity.description.ilike(like),
            )
        )
    if sort == "za":
        query = query.order_by(Activity.name.desc())
    else:
        query = query.order_by(Activity.name.asc())
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return ActivityListResponse(
        items=[serialize_activity(item) for item in items],
        total=total,
    )


@app.get("/activities/stats", response_model=ActivityStats)
async def get_activity_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    activities = db.query(Activity).all()
    total = len(activities)
    done_all = sum(1 for item in activities if item.done_at)
    done_year = sum(
        1
        for item in activities
        if item.done_at and item.done_at.year == now.year
    )

    def pick_top_from_visits(base_query) -> ActivityOut | None:
        top = (
            base_query.order_by(
                func.count(ActivityVisit.id).desc(),
                func.max(ActivityVisit.visited_at).desc(),
            )
            .first()
        )
        if not top:
            return None
        activity = db.query(Activity).filter(Activity.id == top.activity_id).first()
        return serialize_activity(activity) if activity else None

    base_visits = (
        db.query(
            ActivityVisit.activity_id.label("activity_id"),
        )
        .join(Activity, Activity.id == ActivityVisit.activity_id)
        .group_by(ActivityVisit.activity_id)
    )
    year_start = datetime(now.year, 1, 1)
    year_end = datetime(now.year + 1, 1, 1)
    year_visits = base_visits.filter(
        ActivityVisit.visited_at >= year_start,
        ActivityVisit.visited_at < year_end,
    )
    return ActivityStats(
        total=total,
        done_all=done_all,
        done_year=done_year,
        top_all_time=pick_top_from_visits(base_visits),
        top_year=pick_top_from_visits(year_visits),
    )


@app.get("/activities/{activity_id}", response_model=ActivityOut)
async def get_activity(
    activity_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return serialize_activity(activity)


@app.post(
    "/activities/{activity_id}/visits",
    response_model=ActivityVisitOut,
)
async def create_activity_visit(
    activity_id: int,
    payload: ActivityVisitCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    visited_at = parse_iso_datetime(payload.visited_at) or datetime.utcnow()
    photo_url = None
    if payload.photo_data is not None:
        if payload.photo_data:
            photo_url = save_image(payload.photo_data, "activity/visit")
        else:
            photo_url = None
    visit = ActivityVisit(
        user_id=user.id,
        activity_id=activity_id,
        activity_title=payload.activity_title or activity.name,
        visited_at=visited_at,
        rating=payload.rating,
        description=payload.description,
        distance_km=payload.distance_km,
        photo_url=photo_url,
        updated_at=datetime.utcnow(),
        updated_by_user_id=user.id,
    )
    if not activity.done_at or visited_at > activity.done_at:
        activity.done_at = visited_at
    db.add(visit)
    db.flush()
    log_user_activity(
        db,
        user,
        action="create",
        entity_type="activity_visit",
        entity_id=visit.id,
        summary=f"Added activity visit {visit.activity_title}",
        details=[
            f"Date: {visit.visited_at.strftime('%a, %d %b %Y') if visit.visited_at else 'N/A'}",
            f"Rating: {'Thumbs Up' if visit.rating == 'up' else 'Thumbs Down' if visit.rating == 'down' else 'N/A'}",
        ],
        image_url=build_public_url(visit.photo_url or activity.image_url),
    )
    db.commit()
    db.refresh(visit)
    return ActivityVisitOut(
        id=visit.id,
        activity_id=visit.activity_id,
        activity_title=visit.activity_title,
        visited_at=visit.visited_at.isoformat() if visit.visited_at else None,
        rating=visit.rating,
        description=visit.description,
        distance_km=visit.distance_km,
        photo_url=visit.photo_url,
        updated_at=visit.updated_at.isoformat() if visit.updated_at else None,
        updated_by_name=user.display_name,
        updated_by_avatar_url=user.avatar_url,
        updated_by_telegram_uid=user.telegram_uid,
    )


@app.get(
    "/activities/{activity_id}/visits",
    response_model=ActivityVisitListResponse,
)
async def list_activity_visits(
    activity_id: int,
    page: int = 1,
    page_size: int = 12,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = max(page, 1)
    page_size = min(max(page_size, 1), 50)
    base_query = db.query(ActivityVisit).filter(
        ActivityVisit.activity_id == activity_id,
    )
    total = base_query.count()
    last_visit = base_query.with_entities(func.max(ActivityVisit.visited_at)).scalar()
    items = (
        base_query.order_by(ActivityVisit.visited_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    updated_by_users = build_user_lookup(
        db, {visit.updated_by_user_id for visit in items if visit.updated_by_user_id}
    )
    return ActivityVisitListResponse(
        items=[
            ActivityVisitOut(
                id=visit.id,
                activity_id=visit.activity_id,
                activity_title=visit.activity_title,
                visited_at=visit.visited_at.isoformat()
                if visit.visited_at
                else None,
                rating=visit.rating,
                description=visit.description,
                distance_km=visit.distance_km,
                photo_url=visit.photo_url,
                updated_at=visit.updated_at.isoformat() if visit.updated_at else None,
                updated_by_name=(
                    updated_by_users.get(visit.updated_by_user_id).display_name
                    if visit.updated_by_user_id in updated_by_users
                    else None
                ),
                updated_by_avatar_url=(
                    updated_by_users.get(visit.updated_by_user_id).avatar_url
                    if visit.updated_by_user_id in updated_by_users
                    else None
                ),
                updated_by_telegram_uid=(
                    updated_by_users.get(visit.updated_by_user_id).telegram_uid
                    if visit.updated_by_user_id in updated_by_users
                    else None
                ),
            )
            for visit in items
        ],
        total=total,
        last_visit_at=last_visit.isoformat() if last_visit else None,
    )


@app.get("/activity-visits/search", response_model=ActivityVisitSearchResponse)
async def search_activity_visits(
    query: str,
    limit: int = 10,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    needle = query.strip()
    if not needle:
        return ActivityVisitSearchResponse(items=[])
    limit = min(max(limit, 1), 20)
    like = f"%{needle.lower()}%"
    results = (
        db.query(ActivityVisit, Activity)
        .join(Activity, ActivityVisit.activity_id == Activity.id)
        .filter(
            or_(
                func.lower(Activity.name).like(like),
                func.lower(Activity.address).like(like),
                func.lower(ActivityVisit.description).like(like),
                func.lower(ActivityVisit.activity_title).like(like),
            )
        )
        .order_by(ActivityVisit.visited_at.desc(), ActivityVisit.id.desc())
        .limit(limit)
        .all()
    )
    items = []
    for visit, activity in results:
        items.append(
            {
                "id": visit.id,
                "activity_id": visit.activity_id,
                "activity_title": visit.activity_title,
                "activity_name": activity.name if activity else None,
                "activity_address": activity.address if activity else None,
                "visited_at": visit.visited_at.isoformat()
                if visit.visited_at
                else None,
                "rating": visit.rating,
                "description": visit.description,
                "distance_km": visit.distance_km,
                "photo_url": visit.photo_url,
            }
        )
    return ActivityVisitSearchResponse(items=items)


@app.get("/home/timeline", response_model=HomeTimelineResponse)
async def get_home_timeline(
    limit: int = 5,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    max_limit = min(max(limit, 1), 10)
    food_visits = (
        db.query(FoodVisit, FoodPlace)
        .join(FoodPlace, FoodVisit.food_place_id == FoodPlace.id)
        .order_by(FoodVisit.visited_at.desc(), FoodVisit.id.desc())
        .limit(max_limit)
        .all()
    )
    activity_visits = (
        db.query(ActivityVisit, Activity)
        .join(Activity, ActivityVisit.activity_id == Activity.id)
        .order_by(ActivityVisit.visited_at.desc(), ActivityVisit.id.desc())
        .limit(max_limit)
        .all()
    )
    items = []
    for visit, place in food_visits:
        items.append(
            {
                "type": "food",
                "visited_at": visit.visited_at.isoformat()
                if visit.visited_at
                else None,
                "title": place.name,
                "detail": place.location_label or place.location_name,
                "image_url": visit.photo_url or place.header_url,
                "food_visit_id": visit.id,
                "food_place_id": place.id,
            }
        )
    for visit, activity in activity_visits:
        title = visit.activity_title or activity.name
        detail = activity.address or activity.category or activity.name
        items.append(
            {
                "type": "activity",
                "visited_at": visit.visited_at.isoformat()
                if visit.visited_at
                else None,
                "title": title,
                "detail": detail,
                "image_url": visit.photo_url or activity.image_url,
                "activity_visit_id": visit.id,
                "activity_id": activity.id,
            }
        )
    items.sort(key=lambda entry: entry["visited_at"] or "", reverse=True)
    return HomeTimelineResponse(items=items[:max_limit])


@app.get("/home/hero", response_model=HomeHeroResponse)
async def get_home_hero(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = []
    latest_food_visit = (
        db.query(FoodVisit, FoodPlace)
        .join(FoodPlace, FoodVisit.food_place_id == FoodPlace.id)
        .order_by(FoodVisit.visited_at.desc(), FoodVisit.id.desc())
        .first()
    )
    if latest_food_visit:
        visit, place = latest_food_visit
        items.append(
            {
                "type": "food_visit",
                "title": place.name,
                "subtitle": place.location_label or place.location_name,
                "image_url": visit.photo_url or place.header_url,
                "food_visit_id": visit.id,
                "food_place_id": place.id,
            }
        )
    latest_activity_visit = (
        db.query(ActivityVisit, Activity)
        .join(Activity, ActivityVisit.activity_id == Activity.id)
        .order_by(ActivityVisit.visited_at.desc(), ActivityVisit.id.desc())
        .first()
    )
    if latest_activity_visit:
        visit, activity = latest_activity_visit
        title = visit.activity_title or activity.name
        subtitle = activity.name if visit.activity_title else activity.address
        items.append(
            {
                "type": "activity_visit",
                "title": title,
                "subtitle": subtitle,
                "image_url": visit.photo_url or activity.image_url,
                "activity_visit_id": visit.id,
                "activity_id": activity.id,
            }
        )
    latest_food_place = (
        db.query(FoodPlace)
        .order_by(FoodPlace.created_at.desc(), FoodPlace.id.desc())
        .first()
    )
    if latest_food_place:
        items.append(
            {
                "type": "food_place",
                "title": latest_food_place.name,
                "subtitle": latest_food_place.location_label
                or latest_food_place.location_name,
                "image_url": latest_food_place.header_url,
                "food_place_id": latest_food_place.id,
            }
        )
    return HomeHeroResponse(items=items)


@app.patch(
    "/activities/{activity_id}/visits/{visit_id}",
    response_model=ActivityVisitOut,
)
async def update_activity_visit(
    activity_id: int,
    visit_id: int,
    payload: ActivityVisitUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    visit = (
        db.query(ActivityVisit)
        .filter(
            ActivityVisit.id == visit_id,
            ActivityVisit.activity_id == activity_id,
        )
        .first()
    )
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    if payload.visited_at is not None:
        visit.visited_at = parse_iso_datetime(payload.visited_at)
    if payload.rating is not None:
        visit.rating = payload.rating
    if payload.description is not None:
        visit.description = payload.description
    if payload.distance_km is not None:
        visit.distance_km = payload.distance_km
    if "activity_title" in payload.__fields_set__:
        visit.activity_title = payload.activity_title or None
    if payload.photo_data is not None:
        previous_photo = visit.photo_url
        if payload.photo_data:
            visit.photo_url = save_image(payload.photo_data, "activity/visit")
            if previous_photo and previous_photo != visit.photo_url:
                maybe_delete_upload(previous_photo)
        else:
            if previous_photo:
                maybe_delete_upload(previous_photo)
            visit.photo_url = None
    if not visit.activity_title:
        activity = db.query(Activity).filter(Activity.id == activity_id).first()
        visit.activity_title = activity.name if activity else None
    visit.updated_at = datetime.utcnow()
    visit.updated_by_user_id = user.id
    log_user_activity(
        db,
        user,
        action="update",
        entity_type="activity_visit",
        entity_id=visit.id,
        summary=f"Updated activity visit {visit.activity_title or 'activity'}",
    )
    db.commit()
    update_activity_done_at(db, activity_id)
    db.refresh(visit)
    return ActivityVisitOut(
        id=visit.id,
        activity_id=visit.activity_id,
        activity_title=visit.activity_title,
        visited_at=visit.visited_at.isoformat() if visit.visited_at else None,
        rating=visit.rating,
        description=visit.description,
        distance_km=visit.distance_km,
        photo_url=visit.photo_url,
        updated_at=visit.updated_at.isoformat() if visit.updated_at else None,
        updated_by_name=user.display_name,
        updated_by_avatar_url=user.avatar_url,
        updated_by_telegram_uid=user.telegram_uid,
    )


@app.delete("/activities/{activity_id}/visits/{visit_id}")
async def delete_activity_visit(
    activity_id: int,
    visit_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    visit = (
        db.query(ActivityVisit)
        .filter(
            ActivityVisit.id == visit_id,
            ActivityVisit.activity_id == activity_id,
        )
        .first()
    )
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    log_user_activity(
        db,
        user,
        action="delete",
        entity_type="activity_visit",
        entity_id=visit.id,
        summary=f"Deleted activity visit {visit.activity_title or 'activity'}",
    )
    if visit.photo_url:
        maybe_delete_upload(visit.photo_url)
    db.delete(visit)
    db.commit()
    update_activity_done_at(db, activity_id)
    return {"status": "ok"}


@app.get(
    "/activities/{activity_id}/visits/{visit_id}/comments",
    response_model=ActivityVisitCommentListResponse,
)
async def list_activity_visit_comments(
    activity_id: int,
    visit_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    visit = (
        db.query(ActivityVisit)
        .filter(
            ActivityVisit.id == visit_id,
            ActivityVisit.activity_id == activity_id,
        )
        .first()
    )
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    comments = (
        db.query(ActivityVisitComment, User)
        .join(User, User.id == ActivityVisitComment.user_id)
        .filter(ActivityVisitComment.visit_id == visit_id)
        .order_by(ActivityVisitComment.created_at.desc())
        .all()
    )
    return ActivityVisitCommentListResponse(
        items=[
            ActivityVisitCommentOut(
                id=comment.id,
                body=comment.body,
                created_at=comment.created_at.isoformat(),
                user_name=user_row.display_name,
                user_avatar_url=user_row.avatar_url,
                user_telegram_uid=user_row.telegram_uid,
            )
            for comment, user_row in comments
        ]
    )


@app.post(
    "/activities/{activity_id}/visits/{visit_id}/comments",
    response_model=ActivityVisitCommentOut,
)
async def create_activity_visit_comment(
    activity_id: int,
    visit_id: int,
    payload: ActivityVisitCommentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    visit = (
        db.query(ActivityVisit)
        .filter(
            ActivityVisit.id == visit_id,
            ActivityVisit.activity_id == activity_id,
        )
        .first()
    )
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    comment = ActivityVisitComment(
        user_id=user.id,
        visit_id=visit.id,
        body=payload.body,
    )
    db.add(comment)
    activity = (
        db.query(Activity)
        .filter(Activity.id == visit.activity_id)
        .first()
    )
    summary_target = activity.name if activity else "an activity visit"
    db.flush()
    log_user_activity(
        db,
        user,
        action="create",
        entity_type="activity_visit_comment",
        entity_id=comment.id,
        summary=f"commented on {summary_target}",
        details=[f'Comment: "{comment.body}"'],
    )
    db.commit()
    db.refresh(comment)
    return ActivityVisitCommentOut(
        id=comment.id,
        body=comment.body,
        created_at=comment.created_at.isoformat(),
        user_name=user.display_name,
        user_avatar_url=user.avatar_url,
        user_telegram_uid=user.telegram_uid,
    )


@app.delete(
    "/activities/{activity_id}/visits/{visit_id}/comments/{comment_id}"
)
async def delete_activity_visit_comment(
    activity_id: int,
    visit_id: int,
    comment_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = (
        db.query(ActivityVisitComment)
        .filter(
            ActivityVisitComment.id == comment_id,
            ActivityVisitComment.visit_id == visit_id,
            ActivityVisitComment.user_id == user.id,
        )
        .first()
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    visit = (
        db.query(ActivityVisit)
        .filter(
            ActivityVisit.id == visit_id,
            ActivityVisit.activity_id == activity_id,
        )
        .first()
    )
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    activity = (
        db.query(Activity)
        .filter(Activity.id == visit.activity_id)
        .first()
    )
    summary_target = activity.name if activity else "an activity visit"
    log_user_activity(
        db,
        user,
        action="delete",
        entity_type="activity_visit_comment",
        entity_id=comment.id,
        summary=f"deleted a comment on {summary_target}",
    )
    db.delete(comment)
    db.commit()
    return {"status": "ok"}


def serialize_journal_entry(entry: JournalEntry) -> JournalEntryOut:
    links = []
    photos = []
    if entry.links_json:
        try:
            links = json.loads(entry.links_json)
        except json.JSONDecodeError:
            links = []
    if entry.photos_json:
        try:
            photos = json.loads(entry.photos_json)
        except json.JSONDecodeError:
            photos = []
    return JournalEntryOut(
        id=entry.id,
        title=entry.title,
        body=entry.body,
        entry_date=entry.entry_date.isoformat(),
        icon=entry.icon,
        mood=entry.mood,
        is_public=entry.is_public,
        links=links,
        photos=photos,
        author_name=entry.user.display_name if entry.user else None,
        author_avatar_url=entry.user.avatar_url if entry.user else None,
        author_telegram_uid=entry.user.telegram_uid if entry.user else None,
        created_at=entry.created_at.isoformat(),
        updated_at=entry.updated_at.isoformat(),
    )


def serialize_tierlist(tierlist: Tierlist) -> TierlistOut:
    tiers = []
    if tierlist.tiers_json:
        try:
            tiers = json.loads(tierlist.tiers_json)
        except json.JSONDecodeError:
            tiers = []
    return TierlistOut(
        id=tierlist.id,
        title=tierlist.title,
        description=tierlist.description,
        header_url=tierlist.header_url,
        tiers=tiers,
        created_at=tierlist.created_at.isoformat(),
        updated_at=tierlist.updated_at.isoformat() if tierlist.updated_at else None,
        created_by_name=tierlist.user.display_name if tierlist.user else None,
        created_by_avatar_url=tierlist.user.avatar_url if tierlist.user else None,
        created_by_telegram_uid=tierlist.user.telegram_uid if tierlist.user else None,
        updated_by_name=(
            tierlist.updated_by_user.display_name
            if tierlist.updated_by_user
            else None
        ),
        updated_by_avatar_url=(
            tierlist.updated_by_user.avatar_url
            if tierlist.updated_by_user
            else None
        ),
        updated_by_telegram_uid=(
            tierlist.updated_by_user.telegram_uid
            if tierlist.updated_by_user
            else None
        ),
    )


@app.post("/journals", response_model=JournalEntryOut)
async def create_journal_entry(
    payload: JournalEntryCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry_date = parse_iso_datetime(payload.entry_date)
    links = normalize_journal_links(payload.links)
    photos = normalize_journal_photos(payload.photos)
    entry = JournalEntry(
        user_id=user.id,
        title=payload.title.strip(),
        body=payload.body,
        entry_date=entry_date,
        icon=payload.icon,
        mood=payload.mood,
        is_public=payload.is_public,
        links_json=json.dumps(links) if links else None,
        photos_json=json.dumps(photos) if photos else None,
        updated_at=datetime.utcnow(),
    )
    db.add(entry)
    db.flush()
    log_user_activity(
        db,
        user,
        action="create",
        entity_type="journal_entry",
        entity_id=entry.id,
        summary=f"Added journal entry {entry.title}",
    )
    db.commit()
    db.refresh(entry)
    return serialize_journal_entry(entry)


@app.put("/journals/{entry_id}", response_model=JournalEntryOut)
async def update_journal_entry(
    entry_id: int,
    payload: JournalEntryUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if entry.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    if payload.title is not None:
        entry.title = payload.title.strip()
    if payload.body is not None:
        entry.body = payload.body
    if payload.entry_date is not None:
        entry.entry_date = parse_iso_datetime(payload.entry_date)
    if payload.icon is not None:
        entry.icon = payload.icon
    if payload.mood is not None:
        entry.mood = payload.mood
    if payload.is_public is not None:
        entry.is_public = payload.is_public
    if payload.links is not None:
        links = normalize_journal_links(payload.links)
        entry.links_json = json.dumps(links) if links else None
    if payload.photos is not None:
        previous_photos = []
        if entry.photos_json:
            try:
                previous_photos = json.loads(entry.photos_json)
            except json.JSONDecodeError:
                previous_photos = []
        photos = normalize_journal_photos(payload.photos, previous_photos)
        entry.photos_json = json.dumps(photos) if photos else None
    entry.updated_at = datetime.utcnow()
    db.add(entry)
    log_user_activity(
        db,
        user,
        action="update",
        entity_type="journal_entry",
        entity_id=entry.id,
        summary=f"Updated journal entry {entry.title}",
    )
    db.commit()
    db.refresh(entry)
    return serialize_journal_entry(entry)


@app.get("/journals", response_model=JournalEntryListResponse)
async def list_journal_entries(
    page: int = 1,
    page_size: int = 50,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = max(page, 1)
    page_size = max(min(page_size, 200), 1)
    base_query = db.query(JournalEntry).filter(
        or_(JournalEntry.is_public == True, JournalEntry.user_id == user.id)
    )
    total = base_query.count()
    entries = (
        base_query.order_by(JournalEntry.entry_date.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return JournalEntryListResponse(
        items=[serialize_journal_entry(entry) for entry in entries],
        total=total,
    )


@app.get("/journals/{entry_id}", response_model=JournalEntryOut)
async def fetch_journal_entry(
    entry_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if not entry.is_public and entry.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    return serialize_journal_entry(entry)


@app.delete("/journals/{entry_id}")
async def delete_journal_entry(
    entry_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if entry.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    log_user_activity(
        db,
        user,
        action="delete",
        entity_type="journal_entry",
        entity_id=entry.id,
        summary=f"Deleted journal entry {entry.title}",
    )
    if entry.photos_json:
        try:
            photos = json.loads(entry.photos_json)
        except json.JSONDecodeError:
            photos = []
        for photo_url in photos:
            maybe_delete_upload(photo_url)
    db.delete(entry)
    db.commit()
    return {"status": "ok"}


@app.post("/tierlists", response_model=TierlistOut)
async def create_tierlist(
    payload: TierlistCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    header_url: str | None = None
    if payload.header_data is not None:
        if payload.header_data == "":
            header_url = None
        else:
            header_url = save_image(payload.header_data, "tierlists")
    tiers = normalize_tierlist_tiers(payload.tiers)
    tierlist = Tierlist(
        user_id=user.id,
        title=payload.title.strip(),
        description=payload.description,
        header_url=header_url,
        tiers_json=json.dumps(tiers) if tiers else None,
        updated_at=datetime.utcnow(),
        updated_by_user_id=user.id,
    )
    db.add(tierlist)
    db.flush()
    log_user_activity(
        db,
        user,
        action="create",
        entity_type="tierlist",
        entity_id=tierlist.id,
        summary=f"Added tierlist {tierlist.title}",
    )
    db.commit()
    db.refresh(tierlist)
    return serialize_tierlist(tierlist)


@app.patch("/tierlists/{tierlist_id}", response_model=TierlistOut)
async def update_tierlist(
    tierlist_id: int,
    payload: TierlistUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tierlist = db.query(Tierlist).filter(Tierlist.id == tierlist_id).first()
    if not tierlist:
        raise HTTPException(status_code=404, detail="Tierlist not found")
    if payload.header_data is not None:
        previous_header = tierlist.header_url
        if payload.header_data == "":
            if previous_header:
                maybe_delete_upload(previous_header)
            tierlist.header_url = None
        else:
            tierlist.header_url = save_image(payload.header_data, "tierlists")
            if previous_header and previous_header != tierlist.header_url:
                maybe_delete_upload(previous_header)
    if payload.title is not None:
        tierlist.title = payload.title.strip()
    if payload.description is not None:
        tierlist.description = payload.description
    if payload.tiers is not None:
        tiers = normalize_tierlist_tiers(payload.tiers)
        tierlist.tiers_json = json.dumps(tiers) if tiers else None
    tierlist.updated_at = datetime.utcnow()
    tierlist.updated_by_user_id = user.id
    db.add(tierlist)
    log_user_activity(
        db,
        user,
        action="update",
        entity_type="tierlist",
        entity_id=tierlist.id,
        summary=f"Updated tierlist {tierlist.title}",
    )
    db.commit()
    db.refresh(tierlist)
    return serialize_tierlist(tierlist)


@app.get("/tierlists", response_model=TierlistListResponse)
async def list_tierlists(
    page: int = 1,
    page_size: int = 50,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = max(page, 1)
    page_size = max(min(page_size, 200), 1)
    base_query = db.query(Tierlist)
    total = base_query.count()
    tierlists = (
        base_query.order_by(Tierlist.title.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return TierlistListResponse(
        items=[serialize_tierlist(entry) for entry in tierlists],
        total=total,
    )


@app.get("/tierlists/{tierlist_id}", response_model=TierlistOut)
async def fetch_tierlist(
    tierlist_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tierlist = db.query(Tierlist).filter(Tierlist.id == tierlist_id).first()
    if not tierlist:
        raise HTTPException(status_code=404, detail="Tierlist not found")
    return serialize_tierlist(tierlist)


@app.delete("/tierlists/{tierlist_id}")
async def delete_tierlist(
    tierlist_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tierlist = db.query(Tierlist).filter(Tierlist.id == tierlist_id).first()
    if not tierlist:
        raise HTTPException(status_code=404, detail="Tierlist not found")
    log_user_activity(
        db,
        user,
        action="delete",
        entity_type="tierlist",
        entity_id=tierlist.id,
        summary=f"Deleted tierlist {tierlist.title}",
    )
    if tierlist.header_url:
        maybe_delete_upload(tierlist.header_url)
    db.delete(tierlist)
    db.commit()
    return {"status": "ok"}


@app.get(
    "/tierlists/{tierlist_id}/comments",
    response_model=TierlistCommentListResponse,
)
async def list_tierlist_comments(
    tierlist_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tierlist = db.query(Tierlist).filter(Tierlist.id == tierlist_id).first()
    if not tierlist:
        raise HTTPException(status_code=404, detail="Tierlist not found")
    comments = (
        db.query(TierlistComment, User)
        .join(User, User.id == TierlistComment.user_id)
        .filter(TierlistComment.tierlist_id == tierlist_id)
        .order_by(TierlistComment.created_at.desc())
        .all()
    )
    return TierlistCommentListResponse(
        items=[
            TierlistCommentOut(
                id=comment.id,
                body=comment.body,
                created_at=comment.created_at.isoformat(),
                user_name=user_row.display_name,
                user_avatar_url=user_row.avatar_url,
                user_telegram_uid=user_row.telegram_uid,
            )
            for comment, user_row in comments
        ]
    )


@app.post(
    "/tierlists/{tierlist_id}/comments",
    response_model=TierlistCommentOut,
)
async def create_tierlist_comment(
    tierlist_id: int,
    payload: TierlistCommentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tierlist = db.query(Tierlist).filter(Tierlist.id == tierlist_id).first()
    if not tierlist:
        raise HTTPException(status_code=404, detail="Tierlist not found")
    comment = TierlistComment(
        user_id=user.id,
        tierlist_id=tierlist_id,
        body=payload.body.strip(),
    )
    db.add(comment)
    db.flush()
    log_user_activity(
        db,
        user,
        action="create",
        entity_type="tierlist_comment",
        entity_id=comment.id,
        summary=f"commented on {tierlist.title}",
        details=[f'Comment: "{comment.body}"'],
    )
    db.commit()
    db.refresh(comment)
    return TierlistCommentOut(
        id=comment.id,
        body=comment.body,
        created_at=comment.created_at.isoformat(),
        user_name=user.display_name,
        user_avatar_url=user.avatar_url,
        user_telegram_uid=user.telegram_uid,
    )


@app.delete(
    "/tierlists/{tierlist_id}/comments/{comment_id}",
    response_model=ProfileSetResponse,
)
async def delete_tierlist_comment(
    tierlist_id: int,
    comment_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = (
        db.query(TierlistComment)
        .filter(
            TierlistComment.id == comment_id,
            TierlistComment.tierlist_id == tierlist_id,
        )
        .first()
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    tierlist = db.query(Tierlist).filter(Tierlist.id == tierlist_id).first()
    summary_target = tierlist.title if tierlist else "a tierlist"
    log_user_activity(
        db,
        user,
        action="delete",
        entity_type="tierlist_comment",
        entity_id=comment.id,
        summary=f"deleted a comment on {summary_target}",
    )
    db.delete(comment)
    db.commit()
    return ProfileSetResponse(status="deleted")


@app.patch("/activities/{activity_id}", response_model=ActivityOut)
async def update_activity(
    activity_id: int,
    payload: ActivityUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    if payload.activity_type and payload.activity_type not in {"exercise", "bucket"}:
        raise HTTPException(status_code=400, detail="Invalid activity type")
    if payload.activity_type is not None:
        activity.activity_type = payload.activity_type
    if payload.name is not None:
        activity.name = payload.name
    if payload.address is not None:
        activity.address = payload.address
    if "latitude" in payload.__fields_set__:
        activity.latitude = payload.latitude
    if "longitude" in payload.__fields_set__:
        activity.longitude = payload.longitude
    if payload.description is not None:
        activity.description = payload.description
    if payload.rating is not None:
        activity.rating = payload.rating
    if payload.done_at is not None:
        activity.done_at = parse_iso_datetime(payload.done_at) if payload.done_at else None
    if payload.image_data is not None:
        if payload.image_data == "":
            maybe_delete_upload(activity.image_url)
            activity.image_url = None
        else:
            maybe_delete_upload(activity.image_url)
            activity.image_url = save_image(payload.image_data, "activities")

    if activity.activity_type == "exercise":
        if payload.category is not None:
            activity.category = payload.category
        if payload.distance_km is not None:
            activity.distance_km = payload.distance_km
        if payload.difficulty is not None:
            activity.difficulty = payload.difficulty
    else:
        if payload.category is not None:
            activity.category = payload.category
        activity.distance_km = None
        activity.difficulty = None
    activity.updated_at = datetime.utcnow()
    activity.updated_by_user_id = user.id

    db.add(activity)
    log_user_activity(
        db,
        user,
        action="update",
        entity_type="activity",
        entity_id=activity.id,
        summary=f"Updated activity {activity.name}",
    )
    db.commit()
    db.refresh(activity)
    return serialize_activity(activity)


@app.delete("/activities/{activity_id}")
async def delete_activity(
    activity_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    log_user_activity(
        db,
        user,
        action="delete",
        entity_type="activity",
        entity_id=activity.id,
        summary=f"Deleted activity {activity.name}",
    )
    visits = db.query(ActivityVisit).filter(ActivityVisit.activity_id == activity.id).all()
    for visit in visits:
        if visit.photo_url:
            maybe_delete_upload(visit.photo_url)
    maybe_delete_upload(activity.image_url)
    db.delete(activity)
    db.commit()
    return {"status": "deleted"}


@app.get("/food-places/featured", response_model=FoodPlaceOut | None)
async def get_featured_food_place(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    place = (
        db.query(FoodPlace)
        .filter(FoodPlace.open.is_(True))
        .order_by(func.random())
        .first()
    )
    if not place:
        return None
    avg_rating = (
        db.query(func.avg(FoodVisit.rating))
        .filter(FoodVisit.food_place_id == place.id)
        .scalar()
    )
    visit_count = (
        db.query(func.count(FoodVisit.id))
        .filter(FoodVisit.food_place_id == place.id)
        .scalar()
    )
    updated_by = (
        db.query(User).filter(User.id == place.updated_by_user_id).first()
        if place.updated_by_user_id
        else None
    )
    return FoodPlaceOut(
        id=place.id,
        name=place.name,
        location_name=place.location_name,
        location_label=place.location_label,
        latitude=place.latitude,
        longitude=place.longitude,
        cuisine=place.cuisine,
        open=place.open,
        header_url=place.header_url,
        comments=place.comments,
        avg_rating=avg_rating,
        visit_count=visit_count,
        updated_at=place.updated_at.isoformat() if place.updated_at else None,
        updated_by_name=updated_by.display_name if updated_by else None,
        updated_by_avatar_url=updated_by.avatar_url if updated_by else None,
        updated_by_telegram_uid=updated_by.telegram_uid if updated_by else None,
    )


@app.get("/food-places/cuisine-stats", response_model=FoodCuisineStatsResponse)
async def get_food_cuisine_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(FoodPlace.cuisine, FoodVisit.id)
        .join(FoodVisit, FoodVisit.food_place_id == FoodPlace.id)
        .all()
    )
    counts: dict[str, int] = {}
    for cuisine, _ in rows:
        if not cuisine:
            continue
        category = cuisine.split(" • ")[0].strip()
        if not category:
            continue
        counts[category] = counts.get(category, 0) + 1
    items = [
        {"label": label, "count": count}
        for label, count in sorted(counts.items(), key=lambda x: x[1], reverse=True)
    ]
    return FoodCuisineStatsResponse(items=items)


@app.get("/food-places/{place_id}", response_model=FoodPlaceOut)
async def get_food_place(
    place_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    place = db.query(FoodPlace).filter(FoodPlace.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Food place not found")
    avg_rating = (
        db.query(func.avg(FoodVisit.rating))
        .filter(FoodVisit.food_place_id == place.id)
        .scalar()
    )
    visit_count = (
        db.query(func.count(FoodVisit.id))
        .filter(FoodVisit.food_place_id == place.id)
        .scalar()
    )
    updated_by = (
        db.query(User).filter(User.id == place.updated_by_user_id).first()
        if place.updated_by_user_id
        else None
    )
    return FoodPlaceOut(
        id=place.id,
        name=place.name,
        location_name=place.location_name,
        location_label=place.location_label,
        latitude=place.latitude,
        longitude=place.longitude,
        cuisine=place.cuisine,
        open=place.open,
        header_url=place.header_url,
        comments=place.comments,
        avg_rating=avg_rating,
        visit_count=visit_count,
        updated_at=place.updated_at.isoformat() if place.updated_at else None,
        updated_by_name=updated_by.display_name if updated_by else None,
        updated_by_avatar_url=updated_by.avatar_url if updated_by else None,
        updated_by_telegram_uid=updated_by.telegram_uid if updated_by else None,
    )


@app.post("/food-places/{place_id}/visits", response_model=FoodVisitOut)
async def create_food_visit(
    place_id: int,
    payload: FoodVisitCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    place = db.query(FoodPlace).filter(FoodPlace.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Food place not found")
    visited_at = parse_iso_datetime(payload.visited_at)
    dishes = normalize_food_visit_dishes(payload.dishes)
    photo_url = None
    if payload.photo_data:
        photo_url = save_image(payload.photo_data, "food/visit")
    visit = FoodVisit(
        user_id=user.id,
        food_place_id=place_id,
        rating=payload.rating,
        visited_at=visited_at,
        description=payload.description,
        again=payload.again,
        photo_url=photo_url,
        dishes=json.dumps(dishes) if dishes else None,
        updated_at=datetime.utcnow(),
        updated_by_user_id=user.id,
    )
    db.add(visit)
    db.flush()
    dish_lines = []
    for dish in dishes:
        rating = dish.get("rating")
        suffix = f" ({rating})" if rating is not None else ""
        name = dish.get("name") or "Dish"
        dish_lines.append(f"- {name}{suffix}")
    visit_details = [
        f"Place: {place.name}",
        f"Location: {place.location_label}",
        f"Rating: {visit.rating if visit.rating is not None else 'N/A'}",
        f"Again: {visit.again or 'N/A'}",
    ]
    if dish_lines:
        visit_details.append("Dishes:")
        visit_details.extend(dish_lines)
    mention = build_telegram_mention(user)
    visit_date = (
        visit.visited_at.strftime("%b %d, %Y") if visit.visited_at else "Unknown date"
    )
    overall_rating = (
        f"{visit.rating} ★" if visit.rating is not None else "N/A"
    )
    dish_message_lines = []
    for dish in dishes:
        dish_name = html.escape(dish.get("name") or "Dish")
        dish_rating = dish.get("rating")
        if dish_rating is None:
            dish_message_lines.append(f"• {dish_name}")
        else:
            dish_message_lines.append(f"• {dish_name} — {dish_rating} ★")
    bot_message = (
        "<b>🍜 New Food Visit</b>\n"
        f"Logged by {mention}\n\n"
        f"<b>{html.escape(place.name)}</b>\n"
        f"{html.escape(place.location_label or 'Unknown location')}\n"
        f"Date: {html.escape(visit_date)}\n"
        f"Overall rating: {overall_rating}"
    )
    if dish_message_lines:
        bot_message = f"{bot_message}\n\n<b>Dishes</b>\n" + "\n".join(dish_message_lines)
    maps_url = build_google_maps_url(place.location_label, place.latitude, place.longitude)
    view_url = f"{APP_ORIGIN}/food/place/{place.id}"
    buttons = [{"text": "View in app", "url": view_url}]
    if maps_url:
        buttons.append({"text": "Open in maps", "url": maps_url})
    reply_markup = {"inline_keyboard": [buttons]}
    log_user_activity(
        db,
        user,
        action="create",
        entity_type="food_visit",
        entity_id=visit.id,
        summary=f"Added food visit at {place.name}",
        details=visit_details,
        image_url=build_public_url(visit.photo_url or place.header_url),
        bot_message=bot_message,
        bot_image_url=build_public_url(visit.photo_url or place.header_url),
        bot_reply_markup=reply_markup,
        bot_parse_mode="HTML",
    )
    db.commit()
    db.refresh(visit)
    return FoodVisitOut(
        id=visit.id,
        food_place_id=visit.food_place_id,
        visited_at=visit.visited_at.isoformat() if visit.visited_at else None,
        rating=visit.rating,
        description=visit.description,
        again=visit.again,
        dishes=dishes,
        dish_count=len(dishes),
        photo_url=visit.photo_url,
        updated_at=visit.updated_at.isoformat() if visit.updated_at else None,
        updated_by_name=user.display_name,
        updated_by_avatar_url=user.avatar_url,
        updated_by_telegram_uid=user.telegram_uid,
    )


@app.get("/food-places/{place_id}/visits", response_model=FoodVisitListResponse)
async def list_food_visits(
    place_id: int,
    page: int = 1,
    page_size: int = 12,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = max(page, 1)
    page_size = min(max(page_size, 1), 50)
    base_query = db.query(FoodVisit).filter(FoodVisit.food_place_id == place_id)
    total = base_query.count()
    last_visit = base_query.with_entities(func.max(FoodVisit.visited_at)).scalar()
    items = (
        base_query.order_by(FoodVisit.visited_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    updated_by_users = build_user_lookup(
        db, {visit.updated_by_user_id for visit in items if visit.updated_by_user_id}
    )
    results = []
    for visit in items:
        dishes = decode_food_visit_dishes(visit.dishes)
        updated_by = updated_by_users.get(visit.updated_by_user_id)
        results.append(
            FoodVisitOut(
                id=visit.id,
                food_place_id=visit.food_place_id,
                visited_at=visit.visited_at.isoformat() if visit.visited_at else None,
                rating=visit.rating,
                description=visit.description,
                again=visit.again,
                dishes=dishes,
                dish_count=len(dishes),
                photo_url=visit.photo_url,
                updated_at=visit.updated_at.isoformat() if visit.updated_at else None,
                updated_by_name=updated_by.display_name if updated_by else None,
                updated_by_avatar_url=updated_by.avatar_url if updated_by else None,
                updated_by_telegram_uid=updated_by.telegram_uid if updated_by else None,
            )
        )
    return FoodVisitListResponse(
        items=results,
        total=total,
        last_visit_at=last_visit.isoformat() if last_visit else None,
    )


@app.get("/food-visits/search", response_model=FoodVisitSearchResponse)
async def search_food_visits(
    query: str,
    limit: int = 10,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    needle = query.strip()
    if not needle:
        return FoodVisitSearchResponse(items=[])
    limit = min(max(limit, 1), 20)
    like = f"%{needle.lower()}%"
    results = (
        db.query(FoodVisit, FoodPlace)
        .join(FoodPlace, FoodVisit.food_place_id == FoodPlace.id)
        .filter(
            or_(
                func.lower(FoodPlace.name).like(like),
                func.lower(FoodPlace.location_label).like(like),
                func.lower(FoodVisit.description).like(like),
            )
        )
        .order_by(FoodVisit.visited_at.desc(), FoodVisit.id.desc())
        .limit(limit)
        .all()
    )
    items = []
    for visit, place in results:
        items.append(
            {
                "id": visit.id,
                "food_place_id": visit.food_place_id,
                "visited_at": visit.visited_at.isoformat()
                if visit.visited_at
                else None,
                "rating": visit.rating,
                "description": visit.description,
                "photo_url": visit.photo_url,
                "place_name": place.name if place else None,
                "place_location_label": place.location_label if place else None,
            }
        )
    return FoodVisitSearchResponse(items=items)


@app.patch("/food-places/{place_id}/visits/{visit_id}", response_model=FoodVisitOut)
async def update_food_visit(
    place_id: int,
    visit_id: int,
    payload: FoodVisitUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    visit = (
        db.query(FoodVisit)
        .filter(
            FoodVisit.id == visit_id,
            FoodVisit.food_place_id == place_id,
        )
        .first()
    )
    if not visit:
        raise HTTPException(status_code=404, detail="Food visit not found")
    if payload.visited_at is not None:
        visit.visited_at = parse_iso_datetime(payload.visited_at)
    if payload.rating is not None:
        visit.rating = payload.rating
    if payload.description is not None:
        visit.description = payload.description
    if payload.again is not None:
        visit.again = payload.again
    if payload.dishes is not None:
        dishes = normalize_food_visit_dishes(payload.dishes)
        visit.dishes = json.dumps(dishes) if dishes else None
    else:
        dishes = decode_food_visit_dishes(visit.dishes)
    if payload.photo_data is not None:
        previous_photo = visit.photo_url
        if payload.photo_data == "":
            if previous_photo:
                maybe_delete_upload(previous_photo)
            visit.photo_url = None
        else:
            visit.photo_url = save_image(payload.photo_data, "food/visit")
            if previous_photo and previous_photo != visit.photo_url:
                maybe_delete_upload(previous_photo)
    visit.updated_at = datetime.utcnow()
    visit.updated_by_user_id = user.id
    log_user_activity(
        db,
        user,
        action="update",
        entity_type="food_visit",
        entity_id=visit.id,
        summary="Updated food visit",
    )
    db.commit()
    db.refresh(visit)
    return FoodVisitOut(
        id=visit.id,
        food_place_id=visit.food_place_id,
        visited_at=visit.visited_at.isoformat() if visit.visited_at else None,
        rating=visit.rating,
        description=visit.description,
        again=visit.again,
        dishes=dishes,
        dish_count=len(dishes),
        photo_url=visit.photo_url,
        updated_at=visit.updated_at.isoformat() if visit.updated_at else None,
        updated_by_name=user.display_name,
        updated_by_avatar_url=user.avatar_url,
        updated_by_telegram_uid=user.telegram_uid,
    )


@app.delete("/food-places/{place_id}/visits/{visit_id}", response_model=ProfileSetResponse)
async def delete_food_visit(
    place_id: int,
    visit_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    visit = (
        db.query(FoodVisit)
        .filter(
            FoodVisit.id == visit_id,
            FoodVisit.food_place_id == place_id,
        )
        .first()
    )
    if not visit:
        raise HTTPException(status_code=404, detail="Food visit not found")
    log_user_activity(
        db,
        user,
        action="delete",
        entity_type="food_visit",
        entity_id=visit.id,
        summary="Deleted food visit",
    )
    if visit.photo_url:
        maybe_delete_upload(visit.photo_url)
    db.delete(visit)
    db.commit()
    return ProfileSetResponse(status="deleted")


@app.get(
    "/food-places/{place_id}/visits/{visit_id}/comments",
    response_model=FoodVisitCommentListResponse,
)
async def list_food_visit_comments(
    place_id: int,
    visit_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ = user
    visit = (
        db.query(FoodVisit)
        .filter(FoodVisit.id == visit_id, FoodVisit.food_place_id == place_id)
        .first()
    )
    if not visit:
        raise HTTPException(status_code=404, detail="Food visit not found")
    items = (
        db.query(FoodVisitComment, User)
        .join(User, User.id == FoodVisitComment.user_id)
        .filter(FoodVisitComment.visit_id == visit_id)
        .order_by(FoodVisitComment.created_at.desc())
        .all()
    )
    return FoodVisitCommentListResponse(
        items=[
            FoodVisitCommentOut(
                id=comment.id,
                body=comment.body,
                created_at=comment.created_at.isoformat(),
                user_name=user.display_name,
                user_avatar_url=user.avatar_url,
                user_telegram_uid=user.telegram_uid,
            )
            for comment, user in items
        ]
    )


@app.post(
    "/food-places/{place_id}/visits/{visit_id}/comments",
    response_model=FoodVisitCommentOut,
)
async def create_food_visit_comment(
    place_id: int,
    visit_id: int,
    payload: FoodVisitCommentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    visit = (
        db.query(FoodVisit)
        .filter(FoodVisit.id == visit_id, FoodVisit.food_place_id == place_id)
        .first()
    )
    if not visit:
        raise HTTPException(status_code=404, detail="Food visit not found")
    comment = FoodVisitComment(
        user_id=user.id,
        visit_id=visit_id,
        body=payload.body.strip(),
    )
    db.add(comment)
    place = db.query(FoodPlace).filter(FoodPlace.id == place_id).first()
    summary_target = place.name if place else "a food visit"
    db.flush()
    log_user_activity(
        db,
        user,
        action="create",
        entity_type="food_visit_comment",
        entity_id=comment.id,
        summary=f"commented on {summary_target}",
        details=[f'Comment: "{comment.body}"'],
    )
    db.commit()
    db.refresh(comment)
    return FoodVisitCommentOut(
        id=comment.id,
        body=comment.body,
        created_at=comment.created_at.isoformat(),
        user_name=user.display_name,
        user_avatar_url=user.avatar_url,
        user_telegram_uid=user.telegram_uid,
    )


@app.delete(
    "/food-places/{place_id}/visits/{visit_id}/comments/{comment_id}",
    response_model=ProfileSetResponse,
)
async def delete_food_visit_comment(
    place_id: int,
    visit_id: int,
    comment_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = (
        db.query(FoodVisitComment)
        .filter(
            FoodVisitComment.id == comment_id,
            FoodVisitComment.visit_id == visit_id,
        )
        .first()
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    visit = (
        db.query(FoodVisit)
        .filter(FoodVisit.id == visit_id, FoodVisit.food_place_id == place_id)
        .first()
    )
    if not visit:
        raise HTTPException(status_code=404, detail="Food visit not found")
    if comment.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    place = db.query(FoodPlace).filter(FoodPlace.id == place_id).first()
    summary_target = place.name if place else "a food visit"
    log_user_activity(
        db,
        user,
        action="delete",
        entity_type="food_visit_comment",
        entity_id=comment.id,
        summary=f"deleted a comment on {summary_target}",
    )
    db.delete(comment)
    db.commit()
    return ProfileSetResponse(status="deleted")


@app.get("/trips", response_model=TripListResponse)
async def list_trips(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entries = (
        db.query(CheckIn)
        .filter(CheckIn.user_id == user.id)
        .order_by(CheckIn.visited_at.asc())
        .all()
    )
    trips = build_trips(entries)
    return TripListResponse(trips=trips)


@app.get("/trips/{trip_id}", response_model=TripOut)
async def get_trip(
    trip_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entries = (
        db.query(CheckIn)
        .filter(CheckIn.user_id == user.id)
        .order_by(CheckIn.visited_at.asc())
        .all()
    )
    trips = build_trips(entries)
    for trip in trips:
        if trip.id == trip_id:
            return trip
    raise HTTPException(status_code=404, detail="Trip not found")


@app.patch("/check-ins/{check_in_id}", response_model=CheckInOut)
async def update_check_in(
    check_in_id: int,
    payload: CheckInUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_in = (
        db.query(CheckIn)
        .filter(CheckIn.id == check_in_id, CheckIn.user_id == user.id)
        .first()
    )
    if not check_in:
        raise HTTPException(status_code=404, detail="Check in not found")
    if payload.location_name is not None:
        check_in.location_name = payload.location_name
    if payload.location_label is not None:
        check_in.location_label = payload.location_label
    if payload.latitude is not None:
        check_in.latitude = payload.latitude
    if payload.longitude is not None:
        check_in.longitude = payload.longitude
    if payload.visited_at is not None:
        check_in.visited_at = parse_iso_datetime(payload.visited_at)
    db.add(check_in)
    log_user_activity(
        db,
        user,
        action="update",
        entity_type="check_in",
        entity_id=check_in.id,
        summary=f"Updated check in at {check_in.location_label}",
    )
    db.commit()
    db.refresh(check_in)
    return CheckInOut(
        id=check_in.id,
        location_name=check_in.location_name,
        location_label=check_in.location_label,
        latitude=check_in.latitude,
        longitude=check_in.longitude,
        visited_at=check_in.visited_at.isoformat(),
    )


@app.delete("/check-ins/{check_in_id}", response_model=ProfileSetResponse)
async def delete_check_in(
    check_in_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_in = (
        db.query(CheckIn)
        .filter(CheckIn.id == check_in_id, CheckIn.user_id == user.id)
        .first()
    )
    if not check_in:
        raise HTTPException(status_code=404, detail="Check in not found")
    log_user_activity(
        db,
        user,
        action="delete",
        entity_type="check_in",
        entity_id=check_in.id,
        summary=f"Deleted check in at {check_in.location_label}",
    )
    db.delete(check_in)
    db.commit()
    return ProfileSetResponse(status="deleted")
