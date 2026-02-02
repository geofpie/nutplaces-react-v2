from pydantic import BaseModel, Field


class OtpRequest(BaseModel):
    telegram_uid: str = Field(..., min_length=3, max_length=32)


class OtpVerify(BaseModel):
    telegram_uid: str = Field(..., min_length=3, max_length=32)
    pin: str = Field(..., min_length=4, max_length=8)
    device_id: str | None = None
    device_name: str | None = None
    user_agent: str | None = None


class MagicLinkRequest(BaseModel):
    telegram_uid: str = Field(..., min_length=3, max_length=32)


class MagicLinkVerify(BaseModel):
    token: str


class PinVerify(BaseModel):
    telegram_uid: str = Field(..., min_length=3, max_length=32)
    pin: str = Field(..., min_length=3, max_length=12)
    device_id: str = Field(..., min_length=6, max_length=128)
    device_name: str | None = None
    user_agent: str | None = None


class PinSet(BaseModel):
    telegram_uid: str = Field(..., min_length=3, max_length=32)
    pin: str = Field(..., min_length=3, max_length=12)


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class OtpResponse(BaseModel):
    status: str
    debug_pin: str | None = None


class MagicLinkResponse(BaseModel):
    status: str
    magic_link: str | None = None
    expires_in_seconds: int | None = None


class PinVerifyResponse(BaseModel):
    status: str
    access_token: str | None = None
    refresh_token: str | None = None


class PinSetResponse(BaseModel):
    status: str


class UserPublic(BaseModel):
    telegram_uid: str
    display_name: str | None = None
    avatar_url: str | None = None
    header_url: str | None = None
    accent_color: str | None = None
    birthday: str | None = None


class UserListResponse(BaseModel):
    users: list[UserPublic]


class ProfileSet(BaseModel):
    telegram_uid: str = Field(..., min_length=3, max_length=32)
    display_name: str | None = Field(default=None, max_length=64)
    avatar_url: str | None = Field(default=None, max_length=200000)
    header_url: str | None = Field(default=None, max_length=200000)
    avatar_data: str | None = Field(default=None, max_length=2000000)
    header_data: str | None = Field(default=None, max_length=4000000)
    accent_color: str | None = Field(default=None, max_length=32)
    birthday: str | None = None


class ProfileSetResponse(BaseModel):
    status: str


class ProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, max_length=64)
    avatar_url: str | None = Field(default=None, max_length=255)
    avatar_data: str | None = Field(default=None, max_length=2000000)
    header_url: str | None = Field(default=None, max_length=255)
    header_data: str | None = Field(default=None, max_length=4000000)
    accent_color: str | None = Field(default=None, max_length=32)
    birthday: str | None = None


class TrustedDeviceOut(BaseModel):
    id: int
    device_id: str
    device_name: str | None = None
    user_agent: str | None = None
    trusted_until: str
    revoked_at: str | None = None
    last_seen_at: str


class ProfileResponse(BaseModel):
    telegram_uid: str
    display_name: str | None = None
    avatar_url: str | None = None
    header_url: str | None = None
    accent_color: str | None = None
    birthday: str | None = None
    trusted_devices: list[TrustedDeviceOut]


class RefreshRequest(BaseModel):
    refresh_token: str
    device_id: str | None = None
    device_name: str | None = None
    user_agent: str | None = None


class PinChangeRequest(BaseModel):
    current_pin: str | None = Field(default=None, min_length=4, max_length=8)
    new_pin: str = Field(..., min_length=4, max_length=8)


class PinChangeResponse(BaseModel):
    status: str


class PinCurrentVerifyResponse(BaseModel):
    status: str


class CheckInCreate(BaseModel):
    location_name: str | None = Field(default=None, max_length=255)
    location_label: str = Field(..., max_length=255)
    latitude: float
    longitude: float
    visited_at: str | None = None


class CheckInUpdate(BaseModel):
    location_name: str | None = Field(default=None, max_length=255)
    location_label: str | None = Field(default=None, max_length=255)
    latitude: float | None = None
    longitude: float | None = None
    visited_at: str | None = None


class CheckInOut(BaseModel):
    id: int
    location_name: str | None = None
    location_label: str
    latitude: float
    longitude: float
    visited_at: str


class CheckInTopLocation(BaseModel):
    label: str
    count: int
    latitude: float | None = None
    longitude: float | None = None


class CheckInStats(BaseModel):
    total: int
    year: int
    month: int
    top_all_time: CheckInTopLocation | None = None
    top_year: CheckInTopLocation | None = None


class CheckInListResponse(BaseModel):
    items: list[CheckInOut]
    total: int
    stats: CheckInStats
    years: list[str]


class FoodPlaceCreate(BaseModel):
    name: str = Field(..., max_length=255)
    location_name: str | None = Field(default=None, max_length=255)
    location_label: str = Field(..., max_length=255)
    latitude: float
    longitude: float
    cuisine: str | None = Field(default=None, max_length=128)
    open: bool = True
    header_data: str | None = None
    comments: str | None = None


class FoodPlaceUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    location_name: str | None = Field(default=None, max_length=255)
    location_label: str | None = Field(default=None, max_length=255)
    latitude: float | None = None
    longitude: float | None = None
    cuisine: str | None = Field(default=None, max_length=128)
    open: bool | None = None
    header_data: str | None = None
    comments: str | None = None


class FoodPlaceOut(BaseModel):
    id: int
    name: str
    location_name: str | None = None
    location_label: str
    latitude: float
    longitude: float
    cuisine: str | None = None
    open: bool | None = None
    header_url: str | None = None
    comments: str | None = None
    avg_rating: float | None = None
    visit_count: int | None = None
    updated_at: str | None = None
    updated_by_name: str | None = None
    updated_by_avatar_url: str | None = None
    updated_by_telegram_uid: str | None = None


class FoodPlaceTop(BaseModel):
    id: int
    name: str
    count: int
    avg_rating: float | None = None
    header_url: str | None = None
    latest_visit_at: str | None = None


class FoodPlaceStats(BaseModel):
    total: int
    visited: int
    year: int
    top_all_time: FoodPlaceTop | None = None
    top_year: FoodPlaceTop | None = None
    worst_rated: FoodPlaceTop | None = None
    most_controversial: FoodPlaceTop | None = None


class FoodPlaceListResponse(BaseModel):
    items: list[FoodPlaceOut]
    total: int
    stats: FoodPlaceStats


class FoodCuisineStat(BaseModel):
    label: str
    count: int


class FoodCuisineStatsResponse(BaseModel):
    items: list[FoodCuisineStat]


class FoodVisitDish(BaseModel):
    name: str = Field(..., max_length=255)
    rating: float | None = None


class FoodVisitCreate(BaseModel):
    visited_at: str | None = None
    rating: float | None = None
    description: str | None = None
    again: str | None = None
    dishes: list[FoodVisitDish] | None = None
    photo_data: str | None = None


class FoodVisitUpdate(BaseModel):
    visited_at: str | None = None
    rating: float | None = None
    description: str | None = None
    again: str | None = None
    dishes: list[FoodVisitDish] | None = None
    photo_data: str | None = None


class FoodVisitOut(BaseModel):
    id: int
    food_place_id: int
    visited_at: str | None = None
    rating: float | None = None
    description: str | None = None
    again: str | None = None
    dishes: list[FoodVisitDish] | None = None
    dish_count: int
    photo_url: str | None = None
    updated_at: str | None = None
    updated_by_name: str | None = None
    updated_by_avatar_url: str | None = None
    updated_by_telegram_uid: str | None = None


class FoodVisitListResponse(BaseModel):
    items: list[FoodVisitOut]
    total: int
    last_visit_at: str | None = None


class FoodVisitSearchItem(BaseModel):
    id: int
    food_place_id: int
    visited_at: str | None = None
    rating: float | None = None
    description: str | None = None
    photo_url: str | None = None
    place_name: str | None = None
    place_location_label: str | None = None


class FoodVisitSearchResponse(BaseModel):
    items: list[FoodVisitSearchItem]


class FoodPlaceRollRequest(BaseModel):
    latitude: float | None = None
    longitude: float | None = None
    cuisine_categories: list[str] | None = None


class FoodPlaceRollResponse(BaseModel):
    place: FoodPlaceOut | None = None
    radius_km: float | None = None


class ActivityCreate(BaseModel):
    activity_type: str = Field(..., max_length=32)
    name: str = Field(..., max_length=255)
    address: str | None = Field(default=None, max_length=255)
    latitude: float | None = None
    longitude: float | None = None
    category: str | None = Field(default=None, max_length=64)
    distance_km: float | None = None
    difficulty: str | None = Field(default=None, max_length=32)
    description: str | None = None
    image_data: str | None = None
    rating: str | None = Field(default=None, max_length=16)
    done_at: str | None = None


class ActivityUpdate(BaseModel):
    activity_type: str | None = Field(default=None, max_length=32)
    name: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=255)
    latitude: float | None = None
    longitude: float | None = None
    category: str | None = Field(default=None, max_length=64)
    distance_km: float | None = None
    difficulty: str | None = Field(default=None, max_length=32)
    description: str | None = None
    image_data: str | None = None
    rating: str | None = Field(default=None, max_length=16)
    done_at: str | None = None


class ActivityOut(BaseModel):
    id: int
    activity_type: str
    name: str
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    category: str | None = None
    distance_km: float | None = None
    difficulty: str | None = None
    description: str | None = None
    image_url: str | None = None
    rating: str | None = None
    done_at: str | None = None
    updated_at: str | None = None
    updated_by_name: str | None = None
    updated_by_avatar_url: str | None = None
    updated_by_telegram_uid: str | None = None


class ActivityTop(BaseModel):
    exercise: ActivityOut | None = None
    bucket: ActivityOut | None = None


class ActivityStats(BaseModel):
    total: int
    done_all: int
    done_year: int
    top_all_time: ActivityOut | None = None
    top_year: ActivityOut | None = None


class ActivityListResponse(BaseModel):
    items: list[ActivityOut]
    total: int


class ActivityRollRequest(BaseModel):
    latitude: float | None = None
    longitude: float | None = None
    activity_type: str | None = None
    categories: list[str] | None = None


class ActivityRollResponse(BaseModel):
    activity: ActivityOut | None = None
    radius_km: float | None = None


class ActivityVisitCreate(BaseModel):
    visited_at: str | None = None
    activity_title: str | None = Field(default=None, max_length=255)
    rating: str | None = Field(default=None, max_length=16)
    description: str | None = None
    distance_km: float | None = None
    photo_data: str | None = None


class ActivityVisitUpdate(BaseModel):
    visited_at: str | None = None
    activity_title: str | None = Field(default=None, max_length=255)
    rating: str | None = Field(default=None, max_length=16)
    description: str | None = None
    distance_km: float | None = None
    photo_data: str | None = None


class ActivityVisitOut(BaseModel):
    id: int
    activity_id: int
    activity_title: str | None = None
    visited_at: str | None = None
    rating: str | None = None
    description: str | None = None
    distance_km: float | None = None
    photo_url: str | None = None
    updated_at: str | None = None
    updated_by_name: str | None = None
    updated_by_avatar_url: str | None = None
    updated_by_telegram_uid: str | None = None


class ActivityVisitListResponse(BaseModel):
    items: list[ActivityVisitOut]
    total: int
    last_visit_at: str | None = None


class ActivityVisitSearchItem(BaseModel):
    id: int
    activity_id: int
    activity_title: str | None = None
    activity_name: str | None = None
    activity_address: str | None = None
    visited_at: str | None = None
    rating: str | None = None
    description: str | None = None
    distance_km: float | None = None
    photo_url: str | None = None


class ActivityVisitSearchResponse(BaseModel):
    items: list[ActivityVisitSearchItem]


class HomeTimelineItem(BaseModel):
    type: str
    visited_at: str | None
    title: str
    detail: str | None = None
    image_url: str | None = None
    food_visit_id: int | None = None
    food_place_id: int | None = None
    activity_visit_id: int | None = None
    activity_id: int | None = None


class HomeTimelineResponse(BaseModel):
    items: list[HomeTimelineItem]


class HomeHeroItem(BaseModel):
    type: str
    title: str
    subtitle: str | None = None
    image_url: str | None = None
    food_visit_id: int | None = None
    food_place_id: int | None = None
    activity_visit_id: int | None = None
    activity_id: int | None = None


class HomeHeroResponse(BaseModel):
    items: list[HomeHeroItem]


class ActivityVisitCommentCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=2000)


class ActivityVisitCommentOut(BaseModel):
    id: int
    body: str
    created_at: str
    user_name: str | None = None
    user_avatar_url: str | None = None
    user_telegram_uid: str | None = None


class ActivityVisitCommentListResponse(BaseModel):
    items: list[ActivityVisitCommentOut]


class TierlistCommentCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=2000)


class TierlistCommentOut(BaseModel):
    id: int
    body: str
    created_at: str
    user_name: str | None = None
    user_avatar_url: str | None = None
    user_telegram_uid: str | None = None


class TierlistCommentListResponse(BaseModel):
    items: list[TierlistCommentOut]


class JournalLinkPayload(BaseModel):
    type: str
    visit_id: int
    title: str | None = None
    subtitle: str | None = None
    meta: str | None = None


class JournalEntryCreate(BaseModel):
    title: str = Field(..., max_length=255)
    body: str | None = None
    entry_date: str | None = None
    icon: str | None = Field(default=None, max_length=32)
    mood: int | None = None
    is_public: bool = False
    links: list[JournalLinkPayload] = []
    photos: list[str] = []


class JournalEntryUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    body: str | None = None
    entry_date: str | None = None
    icon: str | None = Field(default=None, max_length=32)
    mood: int | None = None
    is_public: bool | None = None
    links: list[JournalLinkPayload] | None = None
    photos: list[str] | None = None


class JournalEntryOut(BaseModel):
    id: int
    title: str
    body: str | None = None
    entry_date: str
    icon: str | None = None
    mood: int | None = None
    is_public: bool
    links: list[JournalLinkPayload] = []
    photos: list[str] = []
    author_name: str | None = None
    author_avatar_url: str | None = None
    author_telegram_uid: str | None = None
    created_at: str
    updated_at: str


class JournalEntryListResponse(BaseModel):
    items: list[JournalEntryOut]
    total: int


class TierlistTier(BaseModel):
    label: str
    color: str
    items: list[str] = []


class TierlistCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: str | None = None
    header_data: str | None = None
    tiers: list[TierlistTier] = []


class TierlistUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    header_data: str | None = None
    tiers: list[TierlistTier] | None = None


class TierlistOut(BaseModel):
    id: int
    title: str
    description: str | None = None
    header_url: str | None = None
    tiers: list[TierlistTier] = []
    created_at: str
    updated_at: str | None = None
    created_by_name: str | None = None
    created_by_avatar_url: str | None = None
    created_by_telegram_uid: str | None = None
    updated_by_name: str | None = None
    updated_by_avatar_url: str | None = None
    updated_by_telegram_uid: str | None = None


class TierlistListResponse(BaseModel):
    items: list[TierlistOut]
    total: int


class UserActivityOut(BaseModel):
    id: int
    action: str
    entity_type: str
    entity_id: int | None
    summary: str
    created_at: str
    entity_title: str | None = None
    entity_subtitle: str | None = None
    entity_image_url: str | None = None


class UserActivityListResponse(BaseModel):
    items: list[UserActivityOut]


class FoodVisitCommentCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=2000)


class FoodVisitCommentOut(BaseModel):
    id: int
    body: str
    created_at: str
    user_name: str | None = None
    user_avatar_url: str | None = None
    user_telegram_uid: str | None = None


class FoodVisitCommentListResponse(BaseModel):
    items: list[FoodVisitCommentOut]


class TripCheckInOut(BaseModel):
    id: int
    visited_at: str
    location_label: str
    location_name: str | None = None


class TripOut(BaseModel):
    id: str
    display: str
    countries: list[str]
    cities: list[str]
    start_at: str
    end_at: str
    check_ins: list[TripCheckInOut]


class TripListResponse(BaseModel):
    trips: list[TripOut]


class PinVerifyRequest(BaseModel):
    current_pin: str | None = Field(default=None, min_length=4, max_length=8)
