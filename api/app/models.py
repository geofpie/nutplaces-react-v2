from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Boolean, ForeignKey, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    telegram_uid: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    pin_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    pin_salt: Mapped[str | None] = mapped_column(String(64), nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(64), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    header_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    accent_color: Mapped[str | None] = mapped_column(String(32), nullable=True)
    birthday: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    trusted_devices: Mapped[list["TrustedDevice"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    check_ins: Mapped[list["CheckIn"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    food_places: Mapped[list["FoodPlace"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="FoodPlace.user_id",
    )
    food_visits: Mapped[list["FoodVisit"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="FoodVisit.user_id",
    )
    food_visit_comments: Mapped[list["FoodVisitComment"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    activities: Mapped[list["Activity"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="Activity.user_id",
    )
    activity_visits: Mapped[list["ActivityVisit"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="ActivityVisit.user_id",
    )
    activity_visit_comments: Mapped[list["ActivityVisitComment"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    tierlist_comments: Mapped[list["TierlistComment"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    journal_entries: Mapped[list["JournalEntry"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    tierlists: Mapped[list["Tierlist"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="Tierlist.user_id",
    )
    activity_log: Mapped[list["UserActivity"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class OtpToken(Base):
    __tablename__ = "otp_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    telegram_uid: Mapped[str] = mapped_column(String(32), index=True)
    pin: Mapped[str] = mapped_column(String(8))
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class MagicLinkToken(Base):
    __tablename__ = "magic_link_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    telegram_uid: Mapped[str] = mapped_column(String(32), index=True)
    token: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class TrustedDevice(Base):
    __tablename__ = "trusted_devices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    device_id: Mapped[str] = mapped_column(String(128), index=True)
    device_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    trusted_until: Mapped[datetime] = mapped_column(DateTime)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="trusted_devices")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    token: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    device_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CheckIn(Base):
    __tablename__ = "check_ins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    location_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location_label: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[float] = mapped_column()
    longitude: Mapped[float] = mapped_column()
    visited_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="check_ins")


class FoodPlace(Base):
    __tablename__ = "food_places"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), index=True, nullable=True
    )
    name: Mapped[str] = mapped_column(String(255))
    location_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location_label: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[float] = mapped_column()
    longitude: Mapped[float] = mapped_column()
    cuisine: Mapped[str | None] = mapped_column(String(128), nullable=True)
    open: Mapped[bool] = mapped_column(Boolean, default=True)
    header_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    comments: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_by_user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), index=True, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User | None] = relationship(
        back_populates="food_places", foreign_keys=[user_id]
    )
    updated_by_user: Mapped[User | None] = relationship(
        foreign_keys=[updated_by_user_id]
    )
    visits: Mapped[list["FoodVisit"]] = relationship(
        back_populates="food_place", cascade="all, delete-orphan"
    )


class FoodVisit(Base):
    __tablename__ = "food_visits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    food_place_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("food_places.id"), index=True
    )
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    visited_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    again: Mapped[str | None] = mapped_column(String(16), nullable=True)
    photo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    dishes: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_by_user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), index=True, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(
        back_populates="food_visits", foreign_keys=[user_id]
    )
    updated_by_user: Mapped[User | None] = relationship(
        foreign_keys=[updated_by_user_id]
    )
    food_place: Mapped[FoodPlace] = relationship(back_populates="visits")
    comments: Mapped[list["FoodVisitComment"]] = relationship(
        back_populates="visit", cascade="all, delete-orphan"
    )


class FoodVisitComment(Base):
    __tablename__ = "food_visit_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    visit_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("food_visits.id"), index=True
    )
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="food_visit_comments")
    visit: Mapped[FoodVisit] = relationship(back_populates="comments")


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    activity_type: Mapped[str] = mapped_column(String(32), index=True)
    name: Mapped[str] = mapped_column(String(255))
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    category: Mapped[str | None] = mapped_column(String(64), nullable=True)
    distance_km: Mapped[float | None] = mapped_column(Float, nullable=True)
    difficulty: Mapped[str | None] = mapped_column(String(32), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    rating: Mapped[str | None] = mapped_column(String(16), nullable=True)
    done_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_by_user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), index=True, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(
        back_populates="activities", foreign_keys=[user_id]
    )
    updated_by_user: Mapped[User | None] = relationship(
        foreign_keys=[updated_by_user_id]
    )
    visits: Mapped[list["ActivityVisit"]] = relationship(
        back_populates="activity", cascade="all, delete-orphan"
    )


class ActivityVisit(Base):
    __tablename__ = "activity_visits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    activity_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("activities.id"), index=True
    )
    activity_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    visited_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    rating: Mapped[str | None] = mapped_column(String(16), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    distance_km: Mapped[float | None] = mapped_column(Float, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_by_user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), index=True, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(
        back_populates="activity_visits", foreign_keys=[user_id]
    )
    updated_by_user: Mapped[User | None] = relationship(
        foreign_keys=[updated_by_user_id]
    )
    activity: Mapped[Activity] = relationship(back_populates="visits")
    comments: Mapped[list["ActivityVisitComment"]] = relationship(
        back_populates="visit", cascade="all, delete-orphan"
    )


class ActivityVisitComment(Base):
    __tablename__ = "activity_visit_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    visit_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("activity_visits.id"), index=True
    )
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="activity_visit_comments")
    visit: Mapped[ActivityVisit] = relationship(back_populates="comments")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    entry_date: Mapped[datetime] = mapped_column(DateTime, index=True)
    icon: Mapped[str | None] = mapped_column(String(32), nullable=True)
    mood: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    links_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    photos_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    user: Mapped[User] = relationship(back_populates="journal_entries")


class Tierlist(Base):
    __tablename__ = "tierlists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    header_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    tiers_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_by_user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), index=True, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="tierlists", foreign_keys=[user_id])
    updated_by_user: Mapped[User | None] = relationship(
        foreign_keys=[updated_by_user_id]
    )
    comments: Mapped[list["TierlistComment"]] = relationship(
        back_populates="tierlist", cascade="all, delete-orphan"
    )


class TierlistComment(Base):
    __tablename__ = "tierlist_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    tierlist_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tierlists.id"), index=True
    )
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="tierlist_comments")
    tierlist: Mapped["Tierlist"] = relationship(back_populates="comments")


class UserActivity(Base):
    __tablename__ = "user_activity"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    action: Mapped[str] = mapped_column(String(48))
    entity_type: Mapped[str] = mapped_column(String(48))
    entity_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    summary: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="activity_log")
