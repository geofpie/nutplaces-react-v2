from pydantic import BaseModel, Field


class OtpRequest(BaseModel):
    telegram_uid: str = Field(..., min_length=3, max_length=32)


class OtpVerify(BaseModel):
    telegram_uid: str = Field(..., min_length=3, max_length=32)
    pin: str = Field(..., min_length=4, max_length=8)


class MagicLinkRequest(BaseModel):
    telegram_uid: str = Field(..., min_length=3, max_length=32)


class MagicLinkVerify(BaseModel):
    token: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class OtpResponse(BaseModel):
    status: str
    debug_pin: str | None = None


class MagicLinkResponse(BaseModel):
    status: str
    magic_link: str | None = None
