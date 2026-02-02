export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const DEVICE_ID_KEY = "np_device_id";

export const getDeviceInfo = () => {
  if (typeof window === "undefined") {
    return { id: "unknown", name: "device", userAgent: "" };
  }
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return {
    id: deviceId,
    name: navigator.platform || "device",
    userAgent: navigator.userAgent || ""
  };
};

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

export async function verifyPin(telegramUid, pin, device) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      telegram_uid: telegramUid,
      pin,
      device_id: device.id,
      device_name: device.name,
      user_agent: device.userAgent
    })
  });
  if (!response.ok) {
    throw new Error("Invalid pin");
  }
  return response.json();
}

export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/public/users`);
  if (!response.ok) {
    throw new Error("Unable to load users");
  }
  return response.json();
}

export async function verifyOtp(telegramUid, pin, device) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      telegram_uid: telegramUid,
      pin,
      device_id: device?.id || null,
      device_name: device?.name || null,
      user_agent: device?.userAgent || null
    })
  });
  if (!response.ok) {
    throw new Error("Invalid or expired OTP");
  }
  return response.json();
}

export async function createCheckIn(payload) {
  const response = await authFetch("/check-ins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error("Unable to save check in");
  }
  return response.json();
}

export async function fetchCheckIns({ year, month, page, pageSize } = {}) {
  const params = new URLSearchParams();
  if (year) {
    params.set("year", year);
  }
  if (month && month !== "all") {
    params.set("month", month);
  }
  if (page) {
    params.set("page", String(page));
  }
  if (pageSize) {
    params.set("page_size", String(pageSize));
  }
  const response = await authFetch(`/check-ins?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to load check ins");
  }
  return response.json();
}

export async function fetchTrips() {
  const response = await authFetch("/trips");
  if (!response.ok) {
    throw new Error("Unable to load trips");
  }
  return response.json();
}

export async function fetchTrip(tripId) {
  const response = await authFetch(`/trips/${tripId}`);
  if (!response.ok) {
    throw new Error("Unable to load trip");
  }
  return response.json();
}

export async function createFoodPlace(payload) {
  const response = await authFetch("/food-places", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error("Unable to save food place");
  }
  return response.json();
}

export async function fetchFoodPlaces({
  page,
  pageSize,
  search,
  status,
  category,
  sortName,
  sortRating
} = {}) {
  const params = new URLSearchParams();
  if (page) {
    params.set("page", String(page));
  }
  if (pageSize) {
    params.set("page_size", String(pageSize));
  }
  if (search) {
    params.set("search", search);
  }
  if (status) {
    params.set("status", status);
  }
  if (category) {
    params.set("category", category);
  }
  if (sortName) {
    params.set("sort_name", sortName);
  }
  if (sortRating) {
    params.set("sort_rating", sortRating);
  }
  const response = await authFetch(`/food-places?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to load food places");
  }
  return response.json();
}

export async function fetchFeaturedFoodPlace() {
  const response = await authFetch("/food-places/featured");
  if (!response.ok) {
    throw new Error("Unable to load featured food place");
  }
  return response.json();
}

export async function fetchFoodCuisineStats() {
  const response = await authFetch("/food-places/cuisine-stats");
  if (!response.ok) {
    throw new Error("Unable to load cuisine stats");
  }
  return response.json();
}

export async function fetchFoodPlace(placeId) {
  const response = await authFetch(`/food-places/${placeId}`);
  if (!response.ok) {
    throw new Error("Unable to load food place");
  }
  return response.json();
}

export async function fetchFoodVisits(placeId, { page, pageSize } = {}) {
  const params = new URLSearchParams();
  if (page) {
    params.set("page", String(page));
  }
  if (pageSize) {
    params.set("page_size", String(pageSize));
  }
  const response = await authFetch(
    `/food-places/${placeId}/visits?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error("Unable to load food visits");
  }
  return response.json();
}

export async function searchFoodVisits(query, limit = 10) {
  const params = new URLSearchParams();
  params.set("query", query);
  if (limit) {
    params.set("limit", String(limit));
  }
  const response = await authFetch(`/food-visits/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to search food visits");
  }
  return response.json();
}

export async function rollFoodPlace(payload) {
  const response = await authFetch("/food-places/roll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to roll food place");
  }
  return response.json();
}

export async function rollActivity(payload) {
  const response = await authFetch("/activities/roll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to roll activity");
  }
  return response.json();
}

export async function updateFoodVisit(placeId, visitId, payload) {
  const response = await authFetch(
    `/food-places/${placeId}/visits/${visitId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    throw new Error("Unable to update food visit");
  }
  return response.json();
}

export async function fetchActivities(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  const response = await authFetch(`/activities${query ? `?${query}` : ""}`);
  if (!response.ok) {
    throw new Error("Unable to load activities");
  }
  return response.json();
}

export async function fetchActivityStats() {
  const response = await authFetch("/activities/stats");
  if (!response.ok) {
    throw new Error("Unable to load activity stats");
  }
  return response.json();
}

export async function fetchActivity(activityId) {
  const response = await authFetch(`/activities/${activityId}`);
  if (!response.ok) {
    throw new Error("Unable to load activity");
  }
  return response.json();
}

export async function createActivity(payload) {
  const response = await authFetch("/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to create activity");
  }
  return response.json();
}

export async function updateActivity(activityId, payload) {
  const response = await authFetch(`/activities/${activityId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to update activity");
  }
  return response.json();
}

export async function deleteActivity(activityId) {
  const response = await authFetch(`/activities/${activityId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Unable to delete activity");
  }
  return response.json();
}

export async function fetchActivityVisitCount(activityId) {
  const response = await authFetch(
    `/activities/${activityId}/visits?page=1&page_size=1`,
  );
  if (!response.ok) {
    throw new Error("Unable to load activity visits");
  }
  const payload = await response.json();
  return payload.total || 0;
}

export async function fetchActivityVisits(activityId, params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  const response = await authFetch(
    `/activities/${activityId}/visits${query ? `?${query}` : ""}`,
  );
  if (!response.ok) {
    throw new Error("Unable to load activity visits");
  }
  return response.json();
}

export async function searchActivityVisits(query, limit = 10) {
  const params = new URLSearchParams();
  params.set("query", query);
  if (limit) {
    params.set("limit", String(limit));
  }
  const response = await authFetch(
    `/activity-visits/search?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error("Unable to search activity visits");
  }
  return response.json();
}

export async function fetchHomeTimeline(limit = 5) {
  const params = new URLSearchParams();
  if (limit) {
    params.set("limit", String(limit));
  }
  const response = await authFetch(`/home/timeline?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to load home timeline");
  }
  return response.json();
}

export async function fetchHomeHero() {
  const response = await authFetch("/home/hero");
  if (!response.ok) {
    throw new Error("Unable to load home hero");
  }
  return response.json();
}

export async function createJournalEntry(payload) {
  const response = await authFetch("/journals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error("Unable to save journal entry");
  }
  return response.json();
}

export async function updateJournalEntry(entryId, payload) {
  const response = await authFetch(`/journals/${entryId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error("Unable to update journal entry");
  }
  return response.json();
}

export async function fetchJournalEntries({ page, pageSize } = {}) {
  const params = new URLSearchParams();
  if (page) {
    params.set("page", String(page));
  }
  if (pageSize) {
    params.set("page_size", String(pageSize));
  }
  const response = await authFetch(`/journals?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to load journal entries");
  }
  return response.json();
}

export async function fetchJournalEntry(entryId) {
  const response = await authFetch(`/journals/${entryId}`);
  if (!response.ok) {
    throw new Error("Unable to load journal entry");
  }
  return response.json();
}

export async function deleteJournalEntry(entryId) {
  const response = await authFetch(`/journals/${entryId}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    throw new Error("Unable to delete journal entry");
  }
  return response.json();
}

export async function createTierlist(payload) {
  const response = await authFetch("/tierlists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to save tierlist");
  }
  return response.json();
}

export async function updateTierlist(tierlistId, payload) {
  const response = await authFetch(`/tierlists/${tierlistId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to update tierlist");
  }
  return response.json();
}

export async function fetchTierlists({ page, pageSize } = {}) {
  const params = new URLSearchParams();
  if (page) {
    params.set("page", String(page));
  }
  if (pageSize) {
    params.set("page_size", String(pageSize));
  }
  const response = await authFetch(`/tierlists?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to load tierlists");
  }
  return response.json();
}

export async function fetchTierlist(tierlistId) {
  const response = await authFetch(`/tierlists/${tierlistId}`);
  if (!response.ok) {
    throw new Error("Unable to load tierlist");
  }
  return response.json();
}

export async function deleteTierlist(tierlistId) {
  const response = await authFetch(`/tierlists/${tierlistId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Unable to delete tierlist");
  }
  return response.json();
}

export async function fetchTierlistComments(tierlistId) {
  const response = await authFetch(`/tierlists/${tierlistId}/comments`);
  if (!response.ok) {
    throw new Error("Unable to load tierlist comments");
  }
  return response.json();
}

export async function createTierlistComment(tierlistId, payload) {
  const response = await authFetch(`/tierlists/${tierlistId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to post comment");
  }
  return response.json();
}

export async function deleteTierlistComment(tierlistId, commentId) {
  const response = await authFetch(
    `/tierlists/${tierlistId}/comments/${commentId}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw new Error("Unable to delete comment");
  }
  return response.json();
}

export async function createActivityVisit(activityId, payload) {
  const response = await authFetch(`/activities/${activityId}/visits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to create activity visit");
  }
  return response.json();
}

export async function updateActivityVisit(activityId, visitId, payload) {
  const response = await authFetch(
    `/activities/${activityId}/visits/${visitId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    throw new Error("Unable to update activity visit");
  }
  return response.json();
}

export async function deleteActivityVisit(activityId, visitId) {
  const response = await authFetch(
    `/activities/${activityId}/visits/${visitId}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw new Error("Unable to delete activity visit");
  }
  return response.json();
}

export async function fetchActivityVisitComments(activityId, visitId) {
  const response = await authFetch(
    `/activities/${activityId}/visits/${visitId}/comments`,
  );
  if (!response.ok) {
    throw new Error("Unable to load activity visit comments");
  }
  return response.json();
}

export async function createActivityVisitComment(
  activityId,
  visitId,
  payload,
) {
  const response = await authFetch(
    `/activities/${activityId}/visits/${visitId}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    throw new Error("Unable to create activity visit comment");
  }
  return response.json();
}

export async function deleteActivityVisitComment(
  activityId,
  visitId,
  commentId,
) {
  const response = await authFetch(
    `/activities/${activityId}/visits/${visitId}/comments/${commentId}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw new Error("Unable to delete activity visit comment");
  }
  return response.json();
}

export async function updateFoodPlace(placeId, payload) {
  const response = await authFetch(`/food-places/${placeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to update food place");
  }
  return response.json();
}

export async function deleteFoodPlace(placeId) {
  const response = await authFetch(`/food-places/${placeId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Unable to delete food place");
  }
  return response.json();
}

export async function createFoodVisit(placeId, payload) {
  const response = await authFetch(`/food-places/${placeId}/visits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to save food visit");
  }
  return response.json();
}

export async function deleteFoodVisit(placeId, visitId) {
  const response = await authFetch(
    `/food-places/${placeId}/visits/${visitId}`,
    {
      method: "DELETE",
    },
  );
  if (!response.ok) {
    throw new Error("Unable to delete food visit");
  }
  return response.json();
}

export async function fetchFoodVisitComments(placeId, visitId) {
  const response = await authFetch(
    `/food-places/${placeId}/visits/${visitId}/comments`,
  );
  if (!response.ok) {
    throw new Error("Unable to load food visit comments");
  }
  return response.json();
}

export async function createFoodVisitComment(placeId, visitId, payload) {
  const response = await authFetch(
    `/food-places/${placeId}/visits/${visitId}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    throw new Error("Unable to save comment");
  }
  return response.json();
}

export async function deleteFoodVisitComment(placeId, visitId, commentId) {
  const response = await authFetch(
    `/food-places/${placeId}/visits/${visitId}/comments/${commentId}`,
    {
      method: "DELETE",
    },
  );
  if (!response.ok) {
    throw new Error("Unable to delete comment");
  }
  return response.json();
}

export async function updateCheckIn(checkInId, payload) {
  const response = await authFetch(`/check-ins/${checkInId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error("Unable to update check in");
  }
  return response.json();
}

export async function deleteCheckIn(checkInId) {
  const response = await authFetch(`/check-ins/${checkInId}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    throw new Error("Unable to delete check in");
  }
  return response.json();
}

export async function fetchProfile() {
  const response = await authFetch("/me");
  if (!response.ok) {
    throw new Error("Unable to load profile");
  }
  return response.json();
}

export async function fetchUserActivity({ limit = 6 } = {}) {
  const params = new URLSearchParams();
  if (limit) {
    params.set("limit", String(limit));
  }
  const response = await authFetch(`/me/activity?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to load activity");
  }
  return response.json();
}

export async function updateProfile(payload) {
  const response = await authFetch("/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    let message = "Unable to update profile";
    try {
      const data = await response.json();
      if (data?.detail) {
        message = data.detail;
      }
    } catch (error) {
      // ignore
    }
    throw new Error(message);
  }
  return response.json();
}

export async function changePin(currentPin, newPin) {
  const response = await authFetch("/me/pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      current_pin: currentPin || null,
      new_pin: newPin
    })
  });
  if (!response.ok) {
    let message = "Unable to change pin";
    try {
      const data = await response.json();
      if (data?.detail) {
        message = data.detail;
      }
    } catch (error) {
      // ignore
    }
    throw new Error(message);
  }
  return response.json();
}

export async function verifyCurrentPin(currentPin) {
  const response = await authFetch("/me/pin/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current_pin: currentPin })
  });
  if (!response.ok) {
    let message = "Unable to verify pin";
    try {
      const data = await response.json();
      if (data?.detail) {
        message = data.detail;
      }
    } catch (error) {
      // ignore
    }
    throw new Error(message);
  }
  return response.json();
}

export async function revokeDevice(deviceId) {
  const response = await authFetch(`/devices/revoke/${deviceId}`, {
    method: "POST"
  });
  if (!response.ok) {
    throw new Error("Unable to revoke device");
  }
  return response.json();
}

export async function logout(refreshToken) {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  if (!response.ok) {
    throw new Error("Unable to logout");
  }
  return response.json();
}

export async function refreshAccessToken(refreshToken) {
  const device = getDeviceInfo();
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refresh_token: refreshToken,
      device_id: device.id,
      device_name: device.name,
      user_agent: device.userAgent
    })
  });
  if (!response.ok) {
    throw new Error("Unable to refresh token");
  }
  return response.json();
}

async function authFetch(path, options = {}) {
  const accessToken = localStorage.getItem("auth_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const headers = { ...(options.headers || {}) };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });
  if (response.status !== 401 || !refreshToken) {
    return response;
  }
  try {
    const refreshed = await refreshAccessToken(refreshToken);
    localStorage.setItem("auth_token", refreshed.access_token);
    localStorage.setItem("refresh_token", refreshed.refresh_token);
    const retryHeaders = { ...(options.headers || {}) };
    retryHeaders.Authorization = `Bearer ${refreshed.access_token}`;
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: retryHeaders
    });
  } catch (error) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
  }
  return response;
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
