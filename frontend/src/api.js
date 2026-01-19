const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function requestOtp(telegramUid) {
  const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telegram_uid: telegramUid })
  });
  if (!response.ok) {
    throw new Error("Unable to request OTP");
  }
  return response.json();
}

export async function verifyOtp(telegramUid, pin) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telegram_uid: telegramUid, pin })
  });
  if (!response.ok) {
    throw new Error("Invalid or expired OTP");
  }
  return response.json();
}

export async function consumeMagicLink(token) {
  const response = await fetch(`${API_BASE_URL}/auth/consume-magic-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  });
  if (!response.ok) {
    throw new Error("Invalid or expired link");
  }
  return response.json();
}
