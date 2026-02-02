import { useEffect, useMemo, useRef, useState } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import L from "leaflet";
import {
  Footprints,
  Apple,
  BookOpen,
  Cake,
  Check,
  Clock,
  Filter,
  Layers,
  Loader2,
  ArrowUpDown,
  Dices,
  ArrowLeft,
  Dumbbell,
  Home,
  ListChecks,
  ListOrdered,
  Minus,
  Pencil,
  Plus,
  Plane,
  Laptop,
  LogOut,
  LocateFixed,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Monitor,
  Search,
  Settings,
  Smartphone,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Upload,
  User,
  UserCircle2,
  Utensils,
  MapPinned,
  X,
} from "lucide-react";
import {
  parseDate,
  today,
  getLocalTimeZone,
  Time,
} from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import { addToast } from "@heroui/react";
import CheckInModals from "./components/CheckInModals.jsx";
import ImageCropperModal from "./components/ImageCropperModal.jsx";
import FoodModals from "./components/FoodModals.jsx";
import ActivityModals from "./components/ActivityModals.jsx";
import ActivityDetailPage from "./components/ActivityDetailPage.jsx";
import ActivityPage from "./components/ActivityPage.jsx";
import CheckInPage from "./components/CheckInPage.jsx";
import FoodPage from "./components/FoodPage.jsx";
import FoodDetailPage from "./components/FoodDetailPage.jsx";
import JournalPage from "./components/JournalPage.jsx";
import HomePage from "./components/HomePage.jsx";
import TierlistPage from "./components/TierlistPage.jsx";
import ProfileModals from "./components/ProfileModals.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import TierlistModals from "./components/TierlistModals.jsx";
import FormModals from "./components/FormModals.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import AppShell from "./components/AppShell.jsx";
import {
  consumeMagicLink,
  fetchProfile,
  fetchUsers,
  logout,
  API_BASE_URL,
  refreshAccessToken,
  revokeDevice,
  fetchUserActivity,
  changePin,
  verifyCurrentPin,
  updateProfile,
  verifyOtp,
  verifyPin,
  createCheckIn,
  fetchCheckIns,
  fetchTrips,
  fetchTrip,
  updateCheckIn,
  deleteCheckIn,
  getDeviceInfo,
  createFoodPlace,
  fetchFoodPlaces,
  fetchFeaturedFoodPlace,
  fetchFoodCuisineStats,
  fetchFoodPlace,
  fetchFoodVisits,
  updateFoodPlace,
  deleteFoodPlace,
  rollFoodPlace,
  rollActivity,
  createFoodVisit,
  updateFoodVisit,
  deleteFoodVisit,
  fetchFoodVisitComments,
  createFoodVisitComment,
  deleteFoodVisitComment,
  searchFoodVisits,
  createJournalEntry,
  updateJournalEntry,
  fetchJournalEntries,
  fetchJournalEntry,
  deleteJournalEntry,
  fetchActivities,
  fetchActivityStats,
  fetchActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  fetchActivityVisits,
  fetchActivityVisitCount,
  createActivityVisit,
  updateActivityVisit,
  deleteActivityVisit,
  fetchActivityVisitComments,
  createActivityVisitComment,
  deleteActivityVisitComment,
  searchActivityVisits,
  fetchHomeTimeline,
  fetchHomeHero,
  createTierlist,
  updateTierlist,
  fetchTierlists,
  deleteTierlist,
  fetchTierlistComments,
  createTierlistComment,
  deleteTierlistComment,
} from "./api.js";
import {
  parseHexColor,
  rgbToHslChannels,
  buildAccentLeakGradient,
  buildAccentKpiGradient,
} from "./utils/gradients.js";

const PIN_LENGTH = 6;
const ACCENT_COLORS = [
  { name: "Ocean Blue", value: "#3B82F6" },
  { name: "Blush Pink", value: "#EC4899" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Sunset Orange", value: "#F97316" },
  { name: "Fresh Green", value: "#22C55E" },
  { name: "Pastel Sky", value: "#7DD3FC" },
  { name: "Pastel Peach", value: "#FDBA74" },
];
const TIER_COLOR_PALETTE = [
  "#F97316",
  "#EF4444",
  "#F59E0B",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#0EA5E9",
  "#6366F1",
  "#A855F7",
  "#F43F5E",
  "#84CC16",
  "#06B6D4",
  "#FCA5A5",
  "#FED7AA",
];
const DEFAULT_TIERLIST_TIERS = [
  { id: "S", label: "S", color: "#F97316" },
  { id: "A", label: "A", color: "#F59E0B" },
  { id: "B", label: "B", color: "#22C55E" },
  { id: "C", label: "C", color: "#3B82F6" },
  { id: "D", label: "D", color: "#8B5CF6" },
  { id: "F", label: "F", color: "#EF4444" },
];


const FOOD_ITEMS_PER_PAGE = 12;
const FOOD_VISIT_ITEMS_PER_PAGE = 12;
const ACTIVITY_ITEMS_PER_PAGE = 12;
const ACTIVITY_VISIT_ITEMS_PER_PAGE = 12;
const TIERLIST_ITEMS_PER_PAGE = 12;
const FOOD_CUISINE_OPTIONS = {
  Asian: ["Chinese", "Thai", "Indian", "Japanese", "Korean", "Vietnamese"],
  Western: ["Italian", "French", "American", "Spanish", "Mediterranean"],
  "Middle Eastern": ["Lebanese", "Turkish", "Persian"],
  "Mexican & Latin": ["Mexican", "Peruvian", "Brazilian"],
  "Drinks Only": ["Coffee", "Tea", "Juice", "Cocktails", "Wine", "Craft Beer"],
  "Cafe & Desserts": ["Cafe", "Bakery", "Desserts"],
};
const ACTIVITY_EXERCISE_CATEGORIES = [
  { label: "Hike", value: "hike" },
  { label: "Cycle", value: "cycle" },
  { label: "Indoor", value: "indoor" },
  { label: "Others", value: "others" },
];
const ACTIVITY_BUCKET_CATEGORIES = [
  { label: "Movies", value: "movies" },
  { label: "Musicals", value: "musicals" },
  { label: "Workshops", value: "workshops" },
  { label: "Concerts", value: "concerts" },
  { label: "Theatre", value: "theatre" },
  { label: "Exhibitions", value: "exhibitions" },
  { label: "Festivals", value: "festivals" },
  { label: "Thrifting", value: "thrifting" },
  { label: "Classes", value: "classes" },
  { label: "Experiences", value: "experiences" },
];
const ACTIVITY_DIFFICULTY_OPTIONS = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];
const resolveAvatarUrl = (value) => {
  if (!value) {
    return undefined;
  }
  if (value.startsWith("data:")) {
    return value;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`;
  }
  return value;
};

const resolveHeaderUrl = (value) => resolveAvatarUrl(value);

const normalizeName = (value) => value.trim().toLowerCase();


const pickRandomItems = (items, count) => {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const swapIndex = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[swapIndex]] = [pool[swapIndex], pool[i]];
  }
  return pool.slice(0, count);
};

const getTripQuery = (trip) => {
  if (!trip) {
    return "travel";
  }
  if (trip.cities?.length) {
    return trip.cities[0];
  }
  if (trip.countries?.length) {
    return trip.countries[0];
  }
  return "travel";
};

const QuestionMarkIcon = ({ className = "" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.09 9a3 3 0 0 1 5.82 1c0 2-3 2-3 4" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CHECK_IN_ITEMS_PER_PAGE = 12;
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const parseCheckInDate = (value) => {
  if (!value) {
    return new Date("");
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    const hasTimeZone = /[zZ]|[+-]\d{2}:\d{2}$/.test(value);
    return new Date(hasTimeZone ? value : `${value}Z`);
  }
  return new Date(value);
};

const formatCheckInDate = (value) => {
  const date = parseCheckInDate(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatMonthYear = (value) => {
  const date = parseCheckInDate(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatRelativeTime = (value) => {
  const date = parseCheckInDate(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const absSeconds = Math.abs(diffSeconds);
  if (absSeconds < 60) {
    return rtf.format(diffSeconds, "second");
  }
  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }
  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, "day");
  }
  const diffWeeks = Math.round(diffDays / 7);
  if (Math.abs(diffWeeks) < 4) {
    return rtf.format(diffWeeks, "week");
  }
  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) {
    return rtf.format(diffMonths, "month");
  }
  const diffYears = Math.round(diffDays / 365);
  return rtf.format(diffYears, "year");
};

const toLocalDateString = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatCheckInAddress = (address, fallback) => {
  if (!address) {
    return fallback || "Unknown location";
  }
  const country = address.country || "Unknown country";
  const isSingapore =
    address.country_code?.toLowerCase() === "sg" ||
    country.toLowerCase().includes("singapore");
  const vicinity =
    address.neighbourhood ||
    address.suburb ||
    address.city_district ||
    address.borough ||
    address.quarter ||
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state;
  if (isSingapore) {
    const houseNumber = address.house_number || "";
    const road = address.road || address.pedestrian || address.footway || "";
    const street = [houseNumber, road].filter(Boolean).join(" ").trim();
    if (street) {
      return `${street}, Singapore`;
    }
    return `${vicinity || "Singapore"}, Singapore`;
  }
  const district =
    address.neighbourhood ||
    address.suburb ||
    address.city_district ||
    address.borough ||
    address.quarter;
  const city = address.city || address.town || address.village || district;
  const parts = [district, city, country].filter(Boolean);
  return parts.length ? parts.join(", ") : fallback || country;
};

const formatBirthday = (value) => {
  if (!value) {
    return "Not set";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Not set";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
  }).format(parsed);
};

const getDeviceIcon = (userAgent = "", deviceName = "") => {
  const agent = `${userAgent} ${deviceName}`.toLowerCase();
  if (
    agent.includes("mac") ||
    agent.includes("iphone") ||
    agent.includes("ipad")
  ) {
    return Apple;
  }
  if (agent.includes("android")) {
    return Smartphone;
  }
  if (agent.includes("windows")) {
    return Monitor;
  }
  return Laptop;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });

const compressImageDataUrl = async (
  imageSrc,
  maxSize = 1400,
  quality = 0.6,
) => {
  const image = new window.Image();
  if (!imageSrc.startsWith("data:")) {
    image.crossOrigin = "anonymous";
  }
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error("Image failed to load"));
  });
  if (image.decode) {
    try {
      await image.decode();
    } catch (error) {
      // Fallback to onload result if decode fails.
    }
  }
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) {
    throw new Error("Invalid image size");
  }
  const scale = Math.min(1, maxSize / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL("image/jpeg", quality);
};

const getCroppedImage = async (
  imageSrc,
  cropPixels,
  outputWidth = 500,
  outputHeight = 500,
  shape = "round",
) => {
  const image = new window.Image();
  if (!imageSrc.startsWith("data:")) {
    image.crossOrigin = "anonymous";
  }
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error("Image failed to load"));
  });
  if (image.decode) {
    try {
      await image.decode();
    } catch (error) {
      // Fallback to onload result if decode fails.
    }
  }
  if (!cropPixels?.width || !cropPixels?.height) {
    throw new Error("Invalid crop area");
  }
  const maxWidth = image.naturalWidth || image.width;
  const maxHeight = image.naturalHeight || image.height;
  const cropX = Math.max(0, Math.round(cropPixels.x));
  const cropY = Math.max(0, Math.round(cropPixels.y));
  const cropWidth = Math.max(
    1,
    Math.min(Math.round(cropPixels.width), maxWidth - cropX),
  );
  const cropHeight = Math.max(
    1,
    Math.min(Math.round(cropPixels.height), maxHeight - cropY),
  );

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;
  const cropCtx = cropCanvas.getContext("2d");
  if (!cropCtx) {
    throw new Error("Canvas not supported");
  }
  cropCtx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  );

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = outputWidth;
  outputCanvas.height = outputHeight;
  const outputCtx = outputCanvas.getContext("2d");
  if (!outputCtx) {
    throw new Error("Canvas not supported");
  }
  outputCtx.clearRect(0, 0, outputWidth, outputHeight);
  outputCtx.save();
  if (shape === "round") {
    outputCtx.beginPath();
    const radius = Math.min(outputWidth, outputHeight) / 2;
    outputCtx.arc(outputWidth / 2, outputHeight / 2, radius, 0, Math.PI * 2);
    outputCtx.closePath();
    outputCtx.clip();
  }
  outputCtx.drawImage(cropCanvas, 0, 0, outputWidth, outputHeight);
  outputCtx.restore();
  return outputCanvas.toDataURL(
    shape === "round" ? "image/png" : "image/jpeg",
    0.6,
  );
};

function useMagicLinkLogin(setAuthState, setStatusMessage) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      return;
    }
    consumeMagicLink(token)
      .then((data) => {
        localStorage.setItem("auth_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        setAuthState(true);
        setStatusMessage("Magic link accepted. Welcome back!");
        window.history.replaceState({}, document.title, "/");
      })
      .catch(() => {
        setStatusMessage("Magic link expired or invalid.");
      });
  }, [setAuthState, setStatusMessage]);
}

export default function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState("");
  const [pinVerified, setPinVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pinError, setPinError] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [isPinLoading, setIsPinLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [pinShake, setPinShake] = useState(false);
  const [otpShake, setOtpShake] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [isActivityLogLoading, setIsActivityLogLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBirthday, setEditBirthday] = useState("");
  const [editAccent, setEditAccent] = useState(ACCENT_COLORS[0].value);
  const [editAvatarPreview, setEditAvatarPreview] = useState("");
  const [editAvatarData, setEditAvatarData] = useState(null);
  const [editAvatarChanged, setEditAvatarChanged] = useState(false);
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [editHeaderPreview, setEditHeaderPreview] = useState("");
  const [editHeaderData, setEditHeaderData] = useState(null);
  const [editHeaderChanged, setEditHeaderChanged] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [currentPinError, setCurrentPinError] = useState(false);
  const [currentPinShake, setCurrentPinShake] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [newPinError, setNewPinError] = useState(false);
  const [newPinShake, setNewPinShake] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");
  const [confirmPinError, setConfirmPinError] = useState(false);
  const [confirmPinShake, setConfirmPinShake] = useState(false);
  const [isPinSaving, setIsPinSaving] = useState(false);
  const [isPinVerifying, setIsPinVerifying] = useState(false);
  const [pinStep, setPinStep] = useState(0);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isHeaderCropOpen, setIsHeaderCropOpen] = useState(false);
  const [isFoodHeaderCropOpen, setIsFoodHeaderCropOpen] = useState(false);
  const [isActivityCropOpen, setIsActivityCropOpen] = useState(false);
  const [isTierlistHeaderCropOpen, setIsTierlistHeaderCropOpen] =
    useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [headerCropImageSrc, setHeaderCropImageSrc] = useState("");
  const [foodHeaderCropImageSrc, setFoodHeaderCropImageSrc] = useState("");
  const [activityCropImageSrc, setActivityCropImageSrc] = useState("");
  const [tierlistHeaderCropImageSrc, setTierlistHeaderCropImageSrc] =
    useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [avatarCroppedAreaPixels, setAvatarCroppedAreaPixels] = useState(null);
  const [headerCrop, setHeaderCrop] = useState({ x: 0, y: 0 });
  const [headerZoom, setHeaderZoom] = useState(1);
  const [headerCroppedAreaPixels, setHeaderCroppedAreaPixels] = useState(null);
  const [foodHeaderCrop, setFoodHeaderCrop] = useState({ x: 0, y: 0 });
  const [foodHeaderZoom, setFoodHeaderZoom] = useState(1);
  const [foodHeaderCroppedAreaPixels, setFoodHeaderCroppedAreaPixels] =
    useState(null);
  const [activityCrop, setActivityCrop] = useState({ x: 0, y: 0 });
  const [activityZoom, setActivityZoom] = useState(1);
  const [activityCroppedAreaPixels, setActivityCroppedAreaPixels] =
    useState(null);
  const [tierlistHeaderCrop, setTierlistHeaderCrop] = useState({ x: 0, y: 0 });
  const [tierlistHeaderZoom, setTierlistHeaderZoom] = useState(1);
  const [tierlistHeaderCroppedAreaPixels, setTierlistHeaderCroppedAreaPixels] =
    useState(null);
  const [isCheckInMenuOpen, setIsCheckInMenuOpen] = useState(false);
  const [isManualCheckInOpen, setIsManualCheckInOpen] = useState(false);
  const [manualDate, setManualDate] = useState(today(getLocalTimeZone()));
  const [manualTime, setManualTime] = useState(new Time(11, 45));
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isLocationCollapsed, setIsLocationCollapsed] = useState(false);
  const [checkInTab, setCheckInTab] = useState("checkins");
  const [checkInSearchQuery, setCheckInSearchQuery] = useState("");
  const [checkInSearchError, setCheckInSearchError] = useState(false);
  const [checkInFilterStatus, setCheckInFilterStatus] = useState("all");
  const [checkInSortName, setCheckInSortName] = useState("az");
  const [checkInSortRating, setCheckInSortRating] = useState("high");
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [foodSearchError, setFoodSearchError] = useState(false);
  const [foodFilterStatus, setFoodFilterStatus] = useState("all");
  const [foodCategoryFilter, setFoodCategoryFilter] = useState("all");
  const [foodSortName, setFoodSortName] = useState("az");
  const [foodSortRating, setFoodSortRating] = useState("na");
  const [foodPage, setFoodPage] = useState(1);
  const [foodTotal, setFoodTotal] = useState(0);
  const [foodPlaces, setFoodPlaces] = useState([]);
  const [foodStats, setFoodStats] = useState({
    total: 0,
    visited: 0,
    year: 0,
    top_all_time: null,
    top_year: null,
  });
  const [foodCuisineStats, setFoodCuisineStats] = useState([]);
  const [featuredFood, setFeaturedFood] = useState(null);
  const [featuredFoodHeroUrl, setFeaturedFoodHeroUrl] = useState("");
  const [isFoodPlaceOpen, setIsFoodPlaceOpen] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [foodNameExists, setFoodNameExists] = useState(false);
  const [foodCuisine, setFoodCuisine] = useState("");
  const [foodCuisineCategory, setFoodCuisineCategory] = useState("");
  const [foodCuisineSubcategory, setFoodCuisineSubcategory] = useState("");
  const [foodComments, setFoodComments] = useState("");
  const [foodOpen, setFoodOpen] = useState(true);
  const [foodHeaderPreview, setFoodHeaderPreview] = useState("");
  const [foodHeaderData, setFoodHeaderData] = useState(null);
  const [foodHeaderChanged, setFoodHeaderChanged] = useState(false);
  const [foodLocationQuery, setFoodLocationQuery] = useState("");
  const [foodLocationResults, setFoodLocationResults] = useState([]);
  const [foodSelectedLocation, setFoodSelectedLocation] = useState(null);
  const [isFoodSearching, setIsFoodSearching] = useState(false);
  const [isFoodLocating, setIsFoodLocating] = useState(false);
  const [isFoodLocationCollapsed, setIsFoodLocationCollapsed] = useState(false);
  const [foodSearchTerm, setFoodSearchTerm] = useState("");
  const [isFoodSaving, setIsFoodSaving] = useState(false);
  const [isFoodLoading, setIsFoodLoading] = useState(false);
  const [foodRefreshKey, setFoodRefreshKey] = useState(0);
  const [foodEditingPlace, setFoodEditingPlace] = useState(null);
  const [foodPlaceDetailRefreshKey, setFoodPlaceDetailRefreshKey] = useState(0);
  const [foodVisitRefreshKey, setFoodVisitRefreshKey] = useState(0);
  const [isFoodVisitOpen, setIsFoodVisitOpen] = useState(false);
  const [isFoodVisitSelectOpen, setIsFoodVisitSelectOpen] = useState(false);
  const [foodVisitPlaceSearchQuery, setFoodVisitPlaceSearchQuery] =
    useState("");
  const [foodVisitPlaceSearchResults, setFoodVisitPlaceSearchResults] =
    useState([]);
  const [isFoodVisitPlaceSearching, setIsFoodVisitPlaceSearching] =
    useState(false);
  const [foodVisitPlaceSelected, setFoodVisitPlaceSelected] = useState(null);
  const [foodEditingVisit, setFoodEditingVisit] = useState(null);
  const [foodVisitDeleteTarget, setFoodVisitDeleteTarget] = useState(null);
  const [foodPlaceDeleteTarget, setFoodPlaceDeleteTarget] = useState(null);
  const [foodPlaceDeleteConfirmName, setFoodPlaceDeleteConfirmName] =
    useState("");
  const [isHelpDecideOpen, setIsHelpDecideOpen] = useState(false);
  const [isHelpDecideRolling, setIsHelpDecideRolling] = useState(false);
  const [isHelpDecideRevealing, setIsHelpDecideRevealing] = useState(false);
  const [helpDecidePendingResult, setHelpDecidePendingResult] = useState(null);
  const [helpDecidePendingRadius, setHelpDecidePendingRadius] = useState(null);
  const [helpDecideResponseReady, setHelpDecideResponseReady] = useState(false);
  const [helpDecideVideoDone, setHelpDecideVideoDone] = useState(false);
  const [helpDecideVideoKey, setHelpDecideVideoKey] = useState(0);
  const helpDecideVideoRef = useRef(null);
  const activityDecideVideoRef = useRef(null);
  const [activities, setActivities] = useState([]);
  const [activityStats, setActivityStats] = useState({
    total: 0,
    done_all: 0,
    done_year: 0,
    top_all_time: null,
    top_year: null,
  });
  const [homeTimeline, setHomeTimeline] = useState([]);
  const [isHomeTimelineLoading, setIsHomeTimelineLoading] = useState(false);
  const [homeHeroSlides, setHomeHeroSlides] = useState([]);
  const [isHomeHeroLoading, setIsHomeHeroLoading] = useState(false);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [tierlists, setTierlists] = useState([]);
  const [tierlistTotal, setTierlistTotal] = useState(0);
  const [isTierlistsLoading, setIsTierlistsLoading] = useState(false);
  const [tierlistRefreshKey, setTierlistRefreshKey] = useState(0);
  const [tierlistPage, setTierlistPage] = useState(1);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isActivitySaving, setIsActivitySaving] = useState(false);
  const [activityEditing, setActivityEditing] = useState(null);
  const [activityType, setActivityType] = useState("exercise");
  const [activityName, setActivityName] = useState("");
  const [activityNameExists, setActivityNameExists] = useState(false);
  const [activityAddress, setActivityAddress] = useState("");
  const [activityLocationQuery, setActivityLocationQuery] = useState("");
  const [activityLocationResults, setActivityLocationResults] = useState([]);
  const [activitySelectedLocation, setActivitySelectedLocation] =
    useState(null);
  const [isActivitySearchingLocation, setIsActivitySearchingLocation] =
    useState(false);
  const [isActivityLocationCollapsed, setIsActivityLocationCollapsed] =
    useState(false);
  const [activityCategory, setActivityCategory] = useState("hike");
  const [activityBucketFormCategory, setActivityBucketFormCategory] = useState(
    ACTIVITY_BUCKET_CATEGORIES[0].value,
  );
  const [activityDifficulty, setActivityDifficulty] = useState("easy");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityImagePreview, setActivityImagePreview] = useState("");
  const [activityImageData, setActivityImageData] = useState(null);
  const [activityImageChanged, setActivityImageChanged] = useState(false);
  const [isActivityVisitOpen, setIsActivityVisitOpen] = useState(false);
  const [activityVisitActivity, setActivityVisitActivity] = useState(null);
  const [isActivityVisitSelectOpen, setIsActivityVisitSelectOpen] =
    useState(false);
  const [activityVisitSearchQuery, setActivityVisitSearchQuery] = useState("");
  const [activityVisitSearchResults, setActivityVisitSearchResults] = useState(
    [],
  );
  const [isActivityVisitSearching, setIsActivityVisitSearching] =
    useState(false);
  const [activityVisitSelected, setActivityVisitSelected] = useState(null);
  const [activityVisitDistance, setActivityVisitDistance] = useState("");
  const [activityVisitRating, setActivityVisitRating] = useState("na");
  const [activityVisitDate, setActivityVisitDate] = useState(
    today(getLocalTimeZone()),
  );
  const [activityVisitTitle, setActivityVisitTitle] = useState("");
  const [activityVisitDescription, setActivityVisitDescription] = useState("");
  const [activityVisitPhotoPreview, setActivityVisitPhotoPreview] =
    useState("");
  const [activityVisitPhotoData, setActivityVisitPhotoData] = useState(null);
  const [activityVisitPhotoChanged, setActivityVisitPhotoChanged] =
    useState(false);
  const [activityVisitEditing, setActivityVisitEditing] = useState(null);
  const [activityVisitDetail, setActivityVisitDetail] = useState(null);
  const [activityVisitComments, setActivityVisitComments] = useState({});
  const [activityVisitCommentInputKey, setActivityVisitCommentInputKey] =
    useState(0);
  const [
    activityVisitCommentDeleteTarget,
    setActivityVisitCommentDeleteTarget,
  ] = useState(null);
  const [isActivityVisitCommentsLoading, setIsActivityVisitCommentsLoading] =
    useState(false);
  const [isActivityVisitCommentSaving, setIsActivityVisitCommentSaving] =
    useState(false);
  const [activityVisitDeleteTarget, setActivityVisitDeleteTarget] =
    useState(null);
  const [isDeletingActivityVisit, setIsDeletingActivityVisit] = useState(false);
  const activityVisitCommentDraftRef = useRef({});
  const [activityDeleteTarget, setActivityDeleteTarget] = useState(null);
  const [activityDeleteConfirmName, setActivityDeleteConfirmName] =
    useState("");
  const [activityDeleteHasVisits, setActivityDeleteHasVisits] = useState(false);
  const [isActivityVisitCropOpen, setIsActivityVisitCropOpen] = useState(false);
  const [activityVisitCropImageSrc, setActivityVisitCropImageSrc] =
    useState("");
  const [activityVisitCrop, setActivityVisitCrop] = useState({ x: 0, y: 0 });
  const [activityVisitZoom, setActivityVisitZoom] = useState(1);
  const [activityVisitCroppedAreaPixels, setActivityVisitCroppedAreaPixels] =
    useState(null);
  const [isActivityVisitSaving, setIsActivityVisitSaving] = useState(false);
  const [activityTab, setActivityTab] = useState("exercise");
  const [activityPage, setActivityPage] = useState(1);
  const [activitySearchQuery, setActivitySearchQuery] = useState("");
  const [activityExerciseStatus, setActivityExerciseStatus] = useState("all");
  const [activityExerciseCategory, setActivityExerciseCategory] =
    useState("all");
  const [activityExerciseSort, setActivityExerciseSort] = useState("az");
  const [activityExerciseDifficulty, setActivityExerciseDifficulty] =
    useState("all");
  const [activityBucketStatus, setActivityBucketStatus] = useState("all");
  const [activityBucketCategory, setActivityBucketCategory] = useState("all");
  const [activityBucketSort, setActivityBucketSort] = useState("az");
  const [isFoodVisitSaving, setIsFoodVisitSaving] = useState(false);
  const [isManualCheckInSaving, setIsManualCheckInSaving] = useState(false);
  const [isQuickCheckInSaving, setIsQuickCheckInSaving] = useState(false);
  const [isFoodVisitCommentSaving, setIsFoodVisitCommentSaving] =
    useState(false);
  const [isDeletingCheckIn, setIsDeletingCheckIn] = useState(false);
  const [isDeletingFoodVisit, setIsDeletingFoodVisit] = useState(false);
  const [isDeletingFoodPlace, setIsDeletingFoodPlace] = useState(false);
  const [isDeletingFoodVisitComment, setIsDeletingFoodVisitComment] =
    useState(false);
  const [isDeletingActivityVisitComment, setIsDeletingActivityVisitComment] =
    useState(false);
  const [isAvatarCropSaving, setIsAvatarCropSaving] = useState(false);
  const [isHeaderCropSaving, setIsHeaderCropSaving] = useState(false);
  const [isFoodHeaderCropSaving, setIsFoodHeaderCropSaving] = useState(false);
  const [isFoodVisitCropSaving, setIsFoodVisitCropSaving] = useState(false);
  const [isActivityCropSaving, setIsActivityCropSaving] = useState(false);
  const [isActivityVisitCropSaving, setIsActivityVisitCropSaving] =
    useState(false);
  const [isTierlistHeaderCropSaving, setIsTierlistHeaderCropSaving] =
    useState(false);
  const [helpDecideLocationEnabled, setHelpDecideLocationEnabled] =
    useState(false);
  const [helpDecideLocation, setHelpDecideLocation] = useState(null);
  const [helpDecideCuisineSelection, setHelpDecideCuisineSelection] = useState(
    new Set(["all"]),
  );
  const [helpDecideResult, setHelpDecideResult] = useState(null);
  const [helpDecideRadius, setHelpDecideRadius] = useState(null);
  const [isActivityDecideOpen, setIsActivityDecideOpen] = useState(false);
  const [activityDecideLocationEnabled, setActivityDecideLocationEnabled] =
    useState(false);
  const [activityDecideLocation, setActivityDecideLocation] = useState(null);
  const [activityDecidePreference, setActivityDecidePreference] =
    useState("all");
  const [activityDecideCategorySelection, setActivityDecideCategorySelection] =
    useState(new Set(["all"]));
  const [activityDecideResult, setActivityDecideResult] = useState(null);
  const [activityDecideRadius, setActivityDecideRadius] = useState(null);
  const [activityDecidePendingResult, setActivityDecidePendingResult] =
    useState(null);
  const [activityDecidePendingRadius, setActivityDecidePendingRadius] =
    useState(null);
  const [activityDecideResponseReady, setActivityDecideResponseReady] =
    useState(false);
  const [activityDecideVideoDone, setActivityDecideVideoDone] = useState(false);
  const [activityDecideVideoKey, setActivityDecideVideoKey] = useState(0);
  const [isActivityDecideRolling, setIsActivityDecideRolling] = useState(false);
  const [isActivityDecideRevealing, setIsActivityDecideRevealing] =
    useState(false);
  const [isTierlistOpen, setIsTierlistOpen] = useState(false);
  const [tierlistTitle, setTierlistTitle] = useState("");
  const [tierlistDescription, setTierlistDescription] = useState("");
  const [tierlistTiers, setTierlistTiers] = useState(
    DEFAULT_TIERLIST_TIERS.map((tier) => ({
      ...tier,
      items: [{ id: `${tier.id}-item-1`, value: "", isNew: false }],
    })),
  );
  const [tierlistHeaderPreview, setTierlistHeaderPreview] = useState("");
  const [tierlistHeaderData, setTierlistHeaderData] = useState(null);
  const [tierlistHeaderChanged, setTierlistHeaderChanged] = useState(false);
  const [isTierlistSaving, setIsTierlistSaving] = useState(false);
  const [tierlistEditing, setTierlistEditing] = useState(null);
  const [selectedTierlist, setSelectedTierlist] = useState(null);
  const [tierlistDeleteTarget, setTierlistDeleteTarget] = useState(null);
  const [tierlistComments, setTierlistComments] = useState({});
  const [tierlistCommentInputKey, setTierlistCommentInputKey] = useState(0);
  const [tierlistCommentDeleteTarget, setTierlistCommentDeleteTarget] =
    useState(null);
  const [isTierlistCommentsLoading, setIsTierlistCommentsLoading] =
    useState(false);
  const [isTierlistCommentSaving, setIsTierlistCommentSaving] = useState(false);
  const tierlistCommentDraftRef = useRef({});
  const [foodVisitDetail, setFoodVisitDetail] = useState(null);
  const [foodVisitComments, setFoodVisitComments] = useState({});
  const [foodVisitCommentInputKey, setFoodVisitCommentInputKey] = useState(0);
  const [foodVisitCommentDeleteTarget, setFoodVisitCommentDeleteTarget] =
    useState(null);
  const [isFoodVisitCommentsLoading, setIsFoodVisitCommentsLoading] =
    useState(false);
  const foodVisitCommentDraftRef = useRef({});
  const [foodVisitPlace, setFoodVisitPlace] = useState(null);
  const [foodVisitDate, setFoodVisitDate] = useState(today(getLocalTimeZone()));
  const [foodVisitDishes, setFoodVisitDishes] = useState([
    { id: 1, name: "", rating: 0, isNew: false },
  ]);
  const [foodVisitOverallRating, setFoodVisitOverallRating] = useState(0);
  const [foodVisitDescription, setFoodVisitDescription] = useState("");
  const [foodVisitAgain, setFoodVisitAgain] = useState("maybe");
  const [foodVisitPhotoPreview, setFoodVisitPhotoPreview] = useState("");
  const [foodVisitPhotoData, setFoodVisitPhotoData] = useState(null);
  const [foodVisitPhotoChanged, setFoodVisitPhotoChanged] = useState(false);
  const [isFoodVisitCropOpen, setIsFoodVisitCropOpen] = useState(false);
  const [foodVisitCropImageSrc, setFoodVisitCropImageSrc] = useState("");
  const [foodVisitCrop, setFoodVisitCrop] = useState({ x: 0, y: 0 });
  const [foodVisitZoom, setFoodVisitZoom] = useState(1);
  const [foodVisitCroppedAreaPixels, setFoodVisitCroppedAreaPixels] =
    useState(null);
  const [checkInPage, setCheckInPage] = useState(1);
  const [checkInYear, setCheckInYear] = useState("");
  const [checkInMonth, setCheckInMonth] = useState("all");
  const [checkIns, setCheckIns] = useState([]);
  const [checkInStats, setCheckInStats] = useState({
    total: 0,
    year: 0,
    month: 0,
    top_all_time: null,
    top_year: null,
  });
  const [tripEntries, setTripEntries] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isTripLoading, setIsTripLoading] = useState(false);
  const [checkInYears, setCheckInYears] = useState([]);
  const [checkInTotal, setCheckInTotal] = useState(0);
  const [checkInRefreshKey, setCheckInRefreshKey] = useState(0);
  const [editingCheckIn, setEditingCheckIn] = useState(null);
  const [deleteCheckInTarget, setDeleteCheckInTarget] = useState(null);
  const [currentMonthCheckIns, setCurrentMonthCheckIns] = useState([]);
  const [tripImages, setTripImages] = useState({});
  const [latestActivityHeroUrl, setLatestActivityHeroUrl] = useState("");
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapLayerRef = useRef(null);
  const mapTilesRef = useRef(null);
  const topAllTimeMapContainerRef = useRef(null);
  const topYearMapContainerRef = useRef(null);
  const topAllTimeMapRef = useRef(null);
  const topYearMapRef = useRef(null);
  const topAllTimeTilesRef = useRef(null);
  const topYearTilesRef = useRef(null);
  const [mapReadyKey, setMapReadyKey] = useState(0);
  const avatarInputRef = useRef(null);
  const headerInputRef = useRef(null);
  const foodHeaderInputRef = useRef(null);
  const foodVisitInputRef = useRef(null);
  const activityImageInputRef = useRef(null);
  const activityVisitInputRef = useRef(null);
  const tierlistHeaderInputRef = useRef(null);
  const foodVisitRowIdRef = useRef(2);
  const pinInputRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateModalTitle, setDuplicateModalTitle] = useState("");
  const [duplicateModalMessage, setDuplicateModalMessage] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("auth_token")),
  );
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevPathRef = useRef(location.pathname);
  const isFoodPlaceDetail = location.pathname.startsWith("/food/place/");
  const isActivityDetail = location.pathname.startsWith("/activities/");
  const accentColor =
    profile?.accent_color ||
    selectedUser?.accent_color ||
    ACCENT_COLORS[0].value;
  const accentRgb = parseHexColor(accentColor) || [59, 130, 246];
  const accentHsl = rgbToHslChannels(accentRgb);
  const appStyle = {
    "--np-accent": accentColor,
  };
  const modalMotionProps = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 22,
      mass: 0.6,
    },
  };
  const headerTitleClass = "text-neutral-900 dark:text-neutral-100";

  const latestTrip = tripEntries[0] || null;
  useEffect(() => {
    if (!foodSearchError) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setFoodSearchError(false);
    }, 2000);
    return () => window.clearTimeout(timeout);
  }, [foodSearchError]);
  useEffect(() => {
    if (!checkInSearchError) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setCheckInSearchError(false);
    }, 2000);
    return () => window.clearTimeout(timeout);
  }, [checkInSearchError]);
  const selectedTripCheckIns = useMemo(() => {
    if (!selectedTrip?.check_ins) {
      return [];
    }
    return [...selectedTrip.check_ins].sort(
      (a, b) =>
        parseCheckInDate(a.visited_at).getTime() -
        parseCheckInDate(b.visited_at).getTime(),
    );
  }, [selectedTrip]);

  const selectedTripCheckInGroups = useMemo(() => {
    const groups = [];
    selectedTripCheckIns.forEach((entry) => {
      const date = parseCheckInDate(entry.visited_at);
      const label = formatCheckInDate(date);
      const last = groups[groups.length - 1];
      if (!last || last.label !== label) {
        groups.push({ label, entries: [entry] });
      } else {
        last.entries.push(entry);
      }
    });
    return groups;
  }, [selectedTripCheckIns]);

  const availableMonths = useMemo(
    () =>
      MONTH_LABELS.map((label, index) => ({
        label,
        value: String(index + 1).padStart(2, "0"),
      })),
    [],
  );

  const sortedCheckIns = useMemo(() => {
    return [...checkIns].sort(
      (a, b) =>
        parseCheckInDate(b.visited_at).getTime() -
        parseCheckInDate(a.visited_at).getTime(),
    );
  }, [checkIns]);
  const monthCheckIns = useMemo(() => {
    return currentMonthCheckIns;
  }, [currentMonthCheckIns]);
  const cuisineHighlights = useMemo(
    () =>
      [...foodCuisineStats]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    [foodCuisineStats],
  );
  const homeTimelineEntries = useMemo(
    () =>
      homeTimeline.map((entry) => ({
        id:
          entry.food_visit_id ||
          entry.activity_visit_id ||
          `${entry.type}-${entry.visited_at || "visit"}`,
        label: entry.visited_at ? formatCheckInDate(entry.visited_at) : "",
        title: entry.title,
        detail: entry.detail,
        type: entry.type,
        imageUrl: entry.image_url ? resolveHeaderUrl(entry.image_url) : "",
      })),
    [homeTimeline],
  );
  const homeHeroEntries = useMemo(
    () =>
      homeHeroSlides.map((entry, index) => ({
        id:
          entry.food_visit_id ||
          entry.activity_visit_id ||
          entry.food_place_id ||
          `${entry.type}-${index}`,
        label:
          entry.type === "food_visit"
            ? "Latest food visit"
            : entry.type === "activity_visit"
              ? "Latest activity visit"
              : "Latest food place",
        title: entry.title,
        subtitle: entry.subtitle,
        imageUrl: entry.image_url ? resolveHeaderUrl(entry.image_url) : "",
        type: entry.type,
      })),
    [homeHeroSlides],
  );

  const activityExerciseItems = useMemo(
    () => activities.filter((item) => item.activity_type === "exercise"),
    [activities],
  );
  const activityBucketItems = useMemo(
    () => activities.filter((item) => item.activity_type === "bucket"),
    [activities],
  );
  const activityKpis = useMemo(
    () => ({
      total: activityStats.total,
      doneAll: activityStats.done_all,
      doneYear: activityStats.done_year,
    }),
    [activityStats],
  );
  const latestDoneActivity = useMemo(() => {
    const done = activities.filter((item) => item.done_at);
    if (!done.length) {
      return null;
    }
    return [...done].sort(
      (a, b) =>
        parseCheckInDate(b.done_at).getTime() -
        parseCheckInDate(a.done_at).getTime(),
    )[0];
  }, [activities]);

  useEffect(() => {
    if (!latestDoneActivity?.id) {
      setLatestActivityHeroUrl("");
      return;
    }
    let isActive = true;
    fetchActivityVisits(latestDoneActivity.id, { page: 1, pageSize: 1 })
      .then((payload) => {
        if (!isActive) {
          return;
        }
        const visitPhoto = payload.items?.[0]?.photo_url || "";
        const fallbackPhoto = latestDoneActivity.image_url || "";
        const nextUrl = resolveHeaderUrl(visitPhoto || fallbackPhoto) || "";
        if (!nextUrl) {
          setLatestActivityHeroUrl("");
          return;
        }
        const image = new window.Image();
        image.onload = () => {
          if (isActive) {
            setLatestActivityHeroUrl(nextUrl);
          }
        };
        image.onerror = () => {
          if (isActive) {
            setLatestActivityHeroUrl("");
          }
        };
        image.src = nextUrl;
      })
      .catch(() => {
        if (isActive) {
          setLatestActivityHeroUrl("");
        }
      });
    return () => {
      isActive = false;
    };
  }, [latestDoneActivity]);

  const activityTopAllTime = activityStats.top_all_time;
  const activityTopYear = activityStats.top_year;

  const filteredExerciseActivities = useMemo(() => {
    const query = activitySearchQuery.trim().toLowerCase();
    let items = activityExerciseItems;
    if (query) {
      items = items.filter((item) => {
        const haystack = [
          item.name,
          item.address,
          item.category,
          item.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
    }
    if (activityExerciseStatus !== "all") {
      items = items.filter((item) =>
        activityExerciseStatus === "done" ? item.done_at : !item.done_at,
      );
    }
    if (activityExerciseCategory !== "all") {
      items = items.filter(
        (item) => item.category === activityExerciseCategory,
      );
    }
    if (activityExerciseDifficulty !== "all") {
      items = items.filter(
        (item) => item.difficulty === activityExerciseDifficulty,
      );
    }
    const sorted = [...items].sort((a, b) =>
      activityExerciseSort === "za"
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name),
    );
    return sorted;
  }, [
    activityExerciseCategory,
    activityExerciseDifficulty,
    activityExerciseItems,
    activityExerciseSort,
    activityExerciseStatus,
    activitySearchQuery,
  ]);

  const filteredBucketActivities = useMemo(() => {
    const query = activitySearchQuery.trim().toLowerCase();
    let items = activityBucketItems;
    if (query) {
      items = items.filter((item) => {
        const haystack = [item.name, item.address, item.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
    }
    if (activityBucketStatus !== "all") {
      items = items.filter((item) =>
        activityBucketStatus === "done" ? item.done_at : !item.done_at,
      );
    }
    if (activityBucketCategory !== "all") {
      items = items.filter((item) => item.category === activityBucketCategory);
    }
    const sorted = [...items].sort((a, b) =>
      activityBucketSort === "za"
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name),
    );
    return sorted;
  }, [
    activityBucketItems,
    activityBucketCategory,
    activityBucketSort,
    activityBucketStatus,
    activitySearchQuery,
  ]);
  const pagedExerciseActivities = useMemo(() => {
    const start = (activityPage - 1) * ACTIVITY_ITEMS_PER_PAGE;
    return filteredExerciseActivities.slice(
      start,
      start + ACTIVITY_ITEMS_PER_PAGE,
    );
  }, [activityPage, filteredExerciseActivities]);
  const pagedBucketActivities = useMemo(() => {
    const start = (activityPage - 1) * ACTIVITY_ITEMS_PER_PAGE;
    return filteredBucketActivities.slice(
      start,
      start + ACTIVITY_ITEMS_PER_PAGE,
    );
  }, [activityPage, filteredBucketActivities]);
  const activityTotalPages = Math.max(
    1,
    Math.ceil(
      (activityTab === "exercise"
        ? filteredExerciseActivities.length
        : filteredBucketActivities.length) / ACTIVITY_ITEMS_PER_PAGE,
    ),
  );

  useMagicLinkLogin(setIsAuthenticated, setStatusMessage);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);
  useEffect(() => {
    const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    if (!accessKey || !tripEntries.length) {
      setTripImages({});
      return;
    }
    let isActive = true;
    const loadImages = async () => {
      try {
        const requests = tripEntries.map(async (trip) => {
          const cityQuery = trip?.cities?.[0] || getTripQuery(trip);
          const countryQuery = trip?.countries?.[0] || "travel";
          const fetchTripImage = async (query) => {
            const response = await fetch(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                query,
              )}&per_page=1&orientation=landscape`,
              {
                headers: {
                  Authorization: `Client-ID ${accessKey}`,
                  "Accept-Version": "v1",
                },
              },
            );
            if (!response.ok) {
              return null;
            }
            const data = await response.json();
            return data?.results?.[0]?.urls?.regular || null;
          };
          const cityImage = await fetchTripImage(cityQuery);
          const url = cityImage || (await fetchTripImage(countryQuery));
          return [trip.id, url];
        });
        const results = await Promise.all(requests);
        if (!isActive) {
          return;
        }
        const next = results.reduce((acc, [id, url]) => {
          if (url) {
            acc[id] = url;
          }
          return acc;
        }, {});
        setTripImages(next);
      } catch (error) {
        if (isActive) {
          setTripImages({});
        }
      }
    };
    loadImages();
    return () => {
      isActive = false;
    };
  }, [tripEntries]);
  useEffect(() => {
    if (!mapRef.current || !mapTilesRef.current) {
      return;
    }
    const tileUrl = isDarkMode
      ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    mapTilesRef.current.setUrl(tileUrl);
  }, [isDarkMode]);
  useEffect(() => {
    const tileUrl = isDarkMode
      ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    topAllTimeTilesRef.current?.setUrl(tileUrl);
    topYearTilesRef.current?.setUrl(tileUrl);
  }, [isDarkMode]);
  useEffect(() => {
    if (location.pathname !== "/check-in") {
      return;
    }
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([1.3521, 103.8198], 11);
    const pulsePane = map.createPane("checkinPulse");
    pulsePane.style.zIndex = "640";
    const markerPane = map.createPane("checkinMarkers");
    markerPane.style.zIndex = "650";
    const tileUrl = isDarkMode
      ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    mapTilesRef.current = L.tileLayer(tileUrl, {
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    }).addTo(map);
    mapLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setMapReadyKey((prev) => prev + 1);
    setTimeout(() => map.invalidateSize(), 0);
    return () => {
      map.remove();
      mapRef.current = null;
      mapLayerRef.current = null;
      mapTilesRef.current = null;
    };
  }, [location.pathname]);
  useEffect(() => {
    if (location.pathname !== "/check-in") {
      if (topAllTimeMapRef.current) {
        topAllTimeMapRef.current.remove();
        topAllTimeMapRef.current = null;
        topAllTimeTilesRef.current = null;
      }
      if (topYearMapRef.current) {
        topYearMapRef.current.remove();
        topYearMapRef.current = null;
        topYearTilesRef.current = null;
      }
      return;
    }
    const tileUrl = isDarkMode
      ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    const initMap = (containerRef, mapRefTarget, tilesRefTarget) => {
      if (!containerRef.current || mapRefTarget.current) {
        return;
      }
      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
        touchZoom: false,
      }).setView([1.3521, 103.8198], 12);
      tilesRefTarget.current = L.tileLayer(tileUrl, {
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
      }).addTo(map);
      mapRefTarget.current = map;
      setTimeout(() => map.invalidateSize(), 0);
    };
    const hasAllTimeCoords =
      Number.isFinite(checkInStats.top_all_time?.latitude) &&
      Number.isFinite(checkInStats.top_all_time?.longitude);
    const hasYearCoords =
      Number.isFinite(checkInStats.top_year?.latitude) &&
      Number.isFinite(checkInStats.top_year?.longitude);
    if (hasAllTimeCoords) {
      initMap(topAllTimeMapContainerRef, topAllTimeMapRef, topAllTimeTilesRef);
    } else if (topAllTimeMapRef.current) {
      topAllTimeMapRef.current.remove();
      topAllTimeMapRef.current = null;
      topAllTimeTilesRef.current = null;
    }
    if (hasYearCoords) {
      initMap(topYearMapContainerRef, topYearMapRef, topYearTilesRef);
    } else if (topYearMapRef.current) {
      topYearMapRef.current.remove();
      topYearMapRef.current = null;
      topYearTilesRef.current = null;
    }
  }, [
    location.pathname,
    checkInStats.top_all_time,
    checkInStats.top_year,
    isDarkMode,
  ]);
  useEffect(() => {
    if (location.pathname !== "/check-in") {
      return;
    }
    if (
      topAllTimeMapRef.current &&
      Number.isFinite(checkInStats.top_all_time?.latitude) &&
      Number.isFinite(checkInStats.top_all_time?.longitude)
    ) {
      topAllTimeMapRef.current.setView(
        [
          checkInStats.top_all_time.latitude,
          checkInStats.top_all_time.longitude,
        ],
        13,
        { animate: false },
      );
    }
    if (
      topYearMapRef.current &&
      Number.isFinite(checkInStats.top_year?.latitude) &&
      Number.isFinite(checkInStats.top_year?.longitude)
    ) {
      topYearMapRef.current.setView(
        [checkInStats.top_year.latitude, checkInStats.top_year.longitude],
        13,
        { animate: false },
      );
    }
  }, [checkInStats.top_all_time, checkInStats.top_year, location.pathname]);
  useEffect(() => {
    if (location.pathname !== "/check-in") {
      return;
    }
    if (!mapRef.current || !mapLayerRef.current) {
      return;
    }
    const layer = mapLayerRef.current;
    layer.clearLayers();
    const points = monthCheckIns
      .filter((entry) => {
        const lat = Number(entry.latitude);
        const lon = Number(entry.longitude);
        return Number.isFinite(lat) && Number.isFinite(lon);
      })
      .map((entry) => {
        const lat = Number(entry.latitude);
        const lon = Number(entry.longitude);
        const pulse = L.circleMarker([lat, lon], {
          radius: 14,
          color: accentColor,
          fillColor: accentColor,
          fillOpacity: 0.1,
          weight: 2,
          className: "checkin-pulse",
          pane: "checkinPulse",
        });
        const marker = L.circleMarker([lat, lon], {
          radius: 6,
          color: accentColor,
          fillColor: accentColor,
          fillOpacity: 0.7,
          weight: 1,
          pane: "checkinMarkers",
        });
        if (entry.location_label) {
          marker.bindPopup(entry.location_label);
        }
        pulse.addTo(layer);
        marker.addTo(layer);
        return marker;
      });
    if (points.length) {
      const bounds = L.featureGroup(points).getBounds().pad(0.2);
      mapRef.current.fitBounds(bounds, { animate: false });
    } else {
      mapRef.current.setView([1.3521, 103.8198], 11);
    }
  }, [monthCheckIns, checkIns, accentColor, mapReadyKey, location.pathname]);
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--heroui-primary", accentHsl);
    root.style.setProperty("--heroui-primary-foreground", "0 0% 100%");
    root.style.setProperty("--heroui-secondary", accentHsl);
    root.style.setProperty("--heroui-secondary-foreground", "0 0% 100%");
    root.style.setProperty("--heroui-focus", accentHsl);
  }, [accentHsl]);
  useEffect(() => {
    if (localStorage.getItem("auth_token")) {
      return;
    }
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      return;
    }
    refreshAccessToken(refreshToken)
      .then((tokens) => {
        localStorage.setItem("auth_token", tokens.access_token);
        localStorage.setItem("refresh_token", tokens.refresh_token);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("refresh_token");
      });
  }, []);
  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }
    if (!localStorage.getItem("refresh_token")) {
      setIsAuthenticated(false);
      navigate("/");
      return;
    }
    fetchProfile()
      .then((payload) => setProfile(payload))
      .catch(() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        setIsAuthenticated(false);
        setProfile(null);
        navigate("/");
      });
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (!isAuthenticated) {
      setActivityLog([]);
      return;
    }
    const loadActivityLog = () => {
      setIsActivityLogLoading(true);
      fetchUserActivity({ limit: 6 })
        .then((payload) => setActivityLog(payload.items || []))
        .catch(() => setActivityLog([]))
        .finally(() => setIsActivityLogLoading(false));
    };
    loadActivityLog();
    if (location.pathname !== "/profile") {
      return;
    }
    const refreshTimeout = window.setTimeout(loadActivityLog, 400);
    return () => window.clearTimeout(refreshTimeout);
  }, [isAuthenticated, location.pathname]);
  useEffect(() => {
    fetchUsers()
      .then((payload) => setUsers(payload.users || []))
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setCheckIns([]);
      setCheckInStats({
        total: 0,
        year: 0,
        month: 0,
        top_all_time: null,
        top_year: null,
      });
      setCheckInYears([]);
      setTripEntries([]);
      return;
    }
    fetchCheckIns({
      year: checkInYear || undefined,
      month: checkInMonth,
      page: checkInPage,
      pageSize: CHECK_IN_ITEMS_PER_PAGE,
    })
      .then((payload) => {
        setCheckIns(payload.items || []);
        setCheckInStats(
          payload.stats || {
            total: 0,
            year: 0,
            month: 0,
            top_all_time: null,
            top_year: null,
          },
        );
        setCheckInYears(payload.years || []);
        setCheckInTotal(payload.total || 0);
        if (!checkInYear && payload.years?.length) {
          setCheckInYear(payload.years[0]);
        }
      })
      .catch(() => {
        setCheckIns([]);
        setCheckInStats({
          total: 0,
          year: 0,
          month: 0,
          top_all_time: null,
          top_year: null,
        });
        setCheckInYears([]);
        setCheckInTotal(0);
      });
  }, [
    isAuthenticated,
    checkInYear,
    checkInMonth,
    checkInPage,
    checkInRefreshKey,
  ]);
  useEffect(() => {
    if (!isAuthenticated) {
      setTripEntries([]);
      return;
    }
    fetchTrips()
      .then((payload) => {
        const trips = (payload.trips || []).map((trip) => ({
          ...trip,
          monthLabel: formatMonthYear(trip.end_at),
        }));
        setTripEntries(trips);
      })
      .catch(() => {
        setTripEntries([]);
      });
  }, [isAuthenticated, checkInRefreshKey]);
  useEffect(() => {
    if (!isAuthenticated) {
      setFoodPlaces([]);
      setFoodStats({
        total: 0,
        visited: 0,
        year: 0,
        top_all_time: null,
        top_year: null,
      });
      setFoodTotal(0);
      return;
    }
    setIsFoodLoading(true);
    fetchFoodPlaces({
      page: foodPage,
      pageSize: FOOD_ITEMS_PER_PAGE,
      search: foodSearchTerm || undefined,
      status: foodFilterStatus !== "all" ? foodFilterStatus : undefined,
      category: foodCategoryFilter !== "all" ? foodCategoryFilter : undefined,
      sortName: foodSortName,
      sortRating: foodSortRating === "na" ? undefined : foodSortRating,
    })
      .then((payload) => {
        setFoodPlaces(payload.items || []);
        setFoodStats(
          payload.stats || {
            total: 0,
            visited: 0,
            year: 0,
            top_all_time: null,
            top_year: null,
          },
        );
        setFoodTotal(payload.total || 0);
      })
      .catch(() => {
        setFoodPlaces([]);
        setFoodStats({
          total: 0,
          visited: 0,
          year: 0,
          top_all_time: null,
          top_year: null,
        });
        setFoodTotal(0);
      })
      .finally(() => {
        setIsFoodLoading(false);
      });
  }, [
    isAuthenticated,
    foodPage,
    foodSearchTerm,
    foodFilterStatus,
    foodCategoryFilter,
    foodSortName,
    foodSortRating,
    foodRefreshKey,
  ]);
  useEffect(() => {
    if (!isAuthenticated) {
      setActivities([]);
      setActivityStats({
        total: 0,
        done_all: 0,
        done_year: 0,
        top_all_time: null,
        top_year: null,
      });
      return;
    }
    setIsActivitiesLoading(true);
    Promise.all([
      fetchActivities({ page: 1, page_size: 200 }),
      fetchActivityStats(),
    ])
      .then(([activityPayload, statsPayload]) => {
        setActivities(activityPayload.items || []);
        setActivityStats(
          statsPayload || {
            total: 0,
            done_all: 0,
            done_year: 0,
            top_all_time: null,
            top_year: null,
          },
        );
      })
      .catch(() => {
        setActivities([]);
        setActivityStats({
          total: 0,
          done_all: 0,
          done_year: 0,
          top_all_time: null,
          top_year: null,
        });
      })
      .finally(() => setIsActivitiesLoading(false));
  }, [activityRefreshKey, isAuthenticated]);
  useEffect(() => {
    if (!isAuthenticated) {
      setHomeTimeline([]);
      return;
    }
    setIsHomeTimelineLoading(true);
    fetchHomeTimeline(5)
      .then((payload) => {
        setHomeTimeline(payload.items || []);
      })
      .catch(() => {
        setHomeTimeline([]);
      })
      .finally(() => setIsHomeTimelineLoading(false));
  }, [isAuthenticated, foodVisitRefreshKey, activityRefreshKey]);
  useEffect(() => {
    if (!isAuthenticated) {
      setHomeHeroSlides([]);
      return;
    }
    setIsHomeHeroLoading(true);
    fetchHomeHero()
      .then((payload) => {
        setHomeHeroSlides(payload.items || []);
      })
      .catch(() => {
        setHomeHeroSlides([]);
      })
      .finally(() => setIsHomeHeroLoading(false));
  }, [isAuthenticated, foodVisitRefreshKey, activityRefreshKey, foodRefreshKey]);
  useEffect(() => {
    if (!isAuthenticated) {
      setTierlists([]);
      setTierlistTotal(0);
      return;
    }
    setIsTierlistsLoading(true);
    fetchTierlists({ page: 1, pageSize: 200 })
      .then((payload) => {
        setTierlists(payload.items || []);
        setTierlistTotal(payload.total || 0);
      })
      .catch(() => {
        setTierlists([]);
        setTierlistTotal(0);
      })
      .finally(() => setIsTierlistsLoading(false));
  }, [isAuthenticated, tierlistRefreshKey]);
  useEffect(() => {
    if (!isAuthenticated) {
      setFeaturedFood(null);
      return;
    }
    fetchFeaturedFoodPlace()
      .then((payload) => {
        setFeaturedFood(payload);
      })
      .catch(() => {
        setFeaturedFood(null);
      });
  }, [isAuthenticated, foodRefreshKey]);
  useEffect(() => {
    if (!isAuthenticated) {
      setFoodCuisineStats([]);
      return;
    }
    fetchFoodCuisineStats()
      .then((payload) => {
        setFoodCuisineStats(payload.items || []);
      })
      .catch(() => {
        setFoodCuisineStats([]);
      });
  }, [isAuthenticated, foodRefreshKey]);
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentMonthCheckIns([]);
      return;
    }
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    fetchCheckIns({
      year: currentYear,
      month: currentMonth,
      page: 1,
      pageSize: 50,
    })
      .then((payload) => {
        setCurrentMonthCheckIns(payload.items || []);
      })
      .catch(() => {
        setCurrentMonthCheckIns([]);
      });
  }, [isAuthenticated, checkInRefreshKey]);

  useEffect(() => {
    if (checkInPage !== 1) {
      setCheckInPage(1);
    }
  }, [checkInYear, checkInMonth]);

  useEffect(() => {
    if (activityPage !== 1) {
      setActivityPage(1);
    }
  }, [
    activityTab,
    activitySearchQuery,
    activityExerciseStatus,
    activityExerciseCategory,
    activityExerciseSort,
    activityExerciseDifficulty,
    activityBucketStatus,
    activityBucketCategory,
    activityBucketSort,
  ]);

  useEffect(() => {
    if (prevPathRef.current === location.pathname) {
      return;
    }
    if (navigationType === "POP" && location.pathname === "/food") {
      setFoodRefreshKey((prev) => prev + 1);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, navigationType]);

  const featuredFoodImage = featuredFood?.header_url || "";
  const helpDecideVideoUrl = `${API_BASE_URL}/assets/loading.mp4`;
  const helpDecideSfxUrl = `${API_BASE_URL}/assets/loaded_sfx.mp3`;
  useEffect(() => {
    if (!featuredFoodImage) {
      setFeaturedFoodHeroUrl("");
      return;
    }
    let isActive = true;
    const image = new window.Image();
    image.onload = () => {
      if (isActive) {
        setFeaturedFoodHeroUrl(featuredFoodImage);
      }
    };
    image.onerror = () => {
      if (isActive) {
        setFeaturedFoodHeroUrl("");
      }
    };
    image.src = resolveHeaderUrl(featuredFoodImage);
    return () => {
      isActive = false;
    };
  }, [featuredFoodImage]);

  const openFoodPlaceEdit = (place) => {
    const cuisineParts = place?.cuisine?.split(" • ") || [];
    const [category, subcategory] = cuisineParts;
    setFoodEditingPlace(place || null);
    setFoodName(place?.name || "");
    setFoodNameExists(false);
    setFoodCuisineCategory(category || "");
    setFoodCuisineSubcategory(subcategory || "");
    setFoodComments(place?.comments || "");
    setFoodOpen(place?.open ?? true);
    setFoodHeaderPreview(resolveHeaderUrl(place?.header_url) || "");
    setFoodHeaderData(null);
    setFoodHeaderChanged(false);
    setFoodLocationQuery(place?.location_label || "");
    setFoodSelectedLocation(
      place
        ? {
            id: `food-${place.id}`,
            name: place.location_name || place.name,
            formatted: place.location_label,
            lat: place.latitude,
            lon: place.longitude,
          }
        : null,
    );
    setFoodLocationResults(
      place
        ? [
            {
              id: `food-${place.id}`,
              name: place.location_name || place.name,
              formatted: place.location_label,
              lat: place.latitude,
              lon: place.longitude,
            },
          ]
        : [],
    );
    setIsFoodLocationCollapsed(Boolean(place));
    setIsFoodPlaceOpen(true);
  };

  const foodVisitComputedRating = useMemo(() => {
    const rated = foodVisitDishes.filter((dish) => dish.name.trim());
    if (!rated.length) {
      return 0;
    }
    const total = rated.reduce((sum, dish) => sum + (dish.rating || 0), 0);
    return total / rated.length;
  }, [foodVisitDishes]);

  useEffect(() => {
    setFoodVisitOverallRating(
      Number.isNaN(foodVisitComputedRating) ? 0 : foodVisitComputedRating,
    );
  }, [foodVisitComputedRating]);

  const openFoodVisitModal = (place) => {
    setFoodVisitPlace(place || null);
    setFoodEditingVisit(null);
    setFoodVisitDate(today(getLocalTimeZone()));
    setFoodVisitDishes([{ id: 1, name: "", rating: 0, isNew: false }]);
    foodVisitRowIdRef.current = 2;
    setFoodVisitOverallRating(0);
    setFoodVisitDescription("");
    setFoodVisitAgain("maybe");
    setFoodVisitPhotoPreview("");
    setFoodVisitPhotoData(null);
    setFoodVisitPhotoChanged(false);
    setFoodVisitCropImageSrc("");
    setFoodVisitCrop({ x: 0, y: 0 });
    setFoodVisitZoom(1);
    setFoodVisitCroppedAreaPixels(null);
    setIsFoodVisitOpen(true);
  };

  const openFoodVisitDetail = (visit, place) => {
    if (!visit) {
      setFoodVisitDetail(null);
      return;
    }
    if (place) {
      setFoodVisitPlace(place);
    }
    const snapshot = {
      ...visit,
      dishes: visit.dishes ? [...visit.dishes] : [],
    };
    setFoodVisitDetail(snapshot);
    setFoodVisitCommentInputKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (!foodVisitDetail) {
      return;
    }
    setIsFoodVisitCommentsLoading(true);
    fetchFoodVisitComments(foodVisitDetail.food_place_id, foodVisitDetail.id)
      .then((payload) => {
        setFoodVisitComments((prev) => ({
          ...prev,
          [foodVisitDetail.id]: payload.items || [],
        }));
      })
      .catch(() => {})
      .finally(() => setIsFoodVisitCommentsLoading(false));
  }, [foodVisitDetail]);

  const openFoodVisitEdit = (visit, place) => {
    const resolvedPlace =
      place ||
      foodVisitPlace ||
      foodPlaces.find((entry) => entry.id === visit?.food_place_id) ||
      null;
    const parsed = visit?.visited_at
      ? parseCheckInDate(visit.visited_at)
      : new Date();
    const dateValue = parseDate(toLocalDateString(parsed));
    const mappedDishes = (visit?.dishes || []).map((dish, index) => ({
      id: index + 1,
      name: dish.name || "",
      rating: dish.rating || 0,
      isNew: false,
    }));
    const dishes =
      mappedDishes.length > 0
        ? mappedDishes
        : [{ id: 1, name: "", rating: 0, isNew: false }];
    setFoodEditingVisit(visit);
    setFoodVisitPlace(resolvedPlace);
    setFoodVisitDate(dateValue);
    setFoodVisitDishes(dishes);
    foodVisitRowIdRef.current = dishes.length + 1;
    setFoodVisitOverallRating(visit?.rating || 0);
    setFoodVisitDescription(visit?.description || "");
    setFoodVisitAgain(visit?.again || "maybe");
    setFoodVisitPhotoPreview(resolveHeaderUrl(visit?.photo_url) || "");
    setFoodVisitPhotoData(null);
    setFoodVisitPhotoChanged(false);
    setFoodVisitCropImageSrc("");
    setFoodVisitCrop({ x: 0, y: 0 });
    setFoodVisitZoom(1);
    setFoodVisitCroppedAreaPixels(null);
    setIsFoodVisitOpen(true);
  };

  const renderStarRow = (value, keyPrefix) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const fill = Math.min(Math.max(value - index, 0), 1);
        return (
          <span key={`${keyPrefix}-star-${index}`} className="relative h-4 w-4">
            <Star className="h-4 w-4 text-neutral-300 dark:text-neutral-700" />
            <span
              className="absolute left-0 top-0 h-4 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            </span>
          </span>
        );
      })}
    </div>
  );

  const renderStarRowCompact = (value, keyPrefix) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const fill = Math.min(Math.max(value - index, 0), 1);
        return (
          <span
            key={`${keyPrefix}-star-${index}`}
            className="relative h-3.5 w-3.5"
          >
            <Star className="h-3.5 w-3.5 text-neutral-300 dark:text-white/40" />
            <span
              className="absolute left-0 top-0 h-3.5 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            </span>
          </span>
        );
      })}
    </div>
  );

  const handleFoodVisitDishNameChange = (id, value) => {
    setFoodVisitDishes((prev) => {
      const next = prev.map((dish) =>
        dish.id === id ? { ...dish, name: value } : dish,
      );
      const last = next[next.length - 1];
      if (last && last.id === id && value.trim()) {
        const newId = foodVisitRowIdRef.current++;
        next.push({ id: newId, name: "", rating: 0, isNew: true });
      }
      return next;
    });
  };

  const handleFoodVisitDishRatingChange = (id, value) => {
    setFoodVisitDishes((prev) =>
      prev.map((dish) => (dish.id === id ? { ...dish, rating: value } : dish)),
    );
  };

  const handleFoodVisitDishDelete = (id) => {
    setFoodVisitDishes((prev) => {
      const filtered = prev.filter((dish) => dish.id !== id);
      return filtered.length
        ? filtered
        : [{ id: 1, name: "", rating: 0, isNew: false }];
    });
  };

  const handleFoodVisitPhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFoodVisitCropImageSrc(dataUrl);
      setFoodVisitCrop({ x: 0, y: 0 });
      setFoodVisitZoom(1);
      setFoodVisitCroppedAreaPixels(null);
      setIsFoodVisitCropOpen(true);
    } catch (error) {
      addToast({
        title: "Unable to process image",
        description: "Please try a different photo.",
        color: "warning",
        timeout: 3000,
      });
    }
  };

  const handleFoodVisitCropConfirm = async () => {
    if (!foodVisitCropImageSrc || !foodVisitCroppedAreaPixels) {
      addToast({
        title: "Select a crop area",
        description: "Pinch or drag to set the crop.",
        color: "warning",
        timeout: 2000,
      });
      return;
    }
    setIsFoodVisitCropSaving(true);
    setIsFoodVisitCropOpen(false);
    try {
      const cropped = await getCroppedImage(
        foodVisitCropImageSrc,
        foodVisitCroppedAreaPixels,
        1200,
        900,
        "rect",
      );
      setFoodVisitPhotoPreview(cropped);
      setFoodVisitPhotoData(cropped);
      setFoodVisitPhotoChanged(true);
    } catch (error) {
      addToast({
        title: "Unable to crop image",
        description: error?.message || "Please try again.",
        color: "warning",
        timeout: 3000,
      });
    } finally {
      setIsFoodVisitCropSaving(false);
    }
  };

  const handleFoodVisitSave = async () => {
    if (!foodVisitPlace) {
      return;
    }
    if (!foodVisitDate) {
      addToast({
        title: "Select a date",
        description: "Pick the date of your visit.",
        color: "warning",
        timeout: 2500,
      });
      return;
    }
    const dateValue = foodVisitDate.toDate(getLocalTimeZone());
    const dishes = foodVisitDishes
      .filter((dish) => dish.name.trim())
      .map((dish) => ({
        name: dish.name.trim(),
        rating: dish.rating || null,
      }));
    const ratingValue =
      foodVisitOverallRating > 0 ? foodVisitOverallRating : null;
    const photoPayload = foodVisitPhotoChanged
      ? foodVisitPhotoData || ""
      : null;
    setIsFoodVisitSaving(true);
    try {
      if (foodEditingVisit) {
        await updateFoodVisit(foodVisitPlace.id, foodEditingVisit.id, {
          visited_at: dateValue.toISOString(),
          rating: ratingValue,
          description: foodVisitDescription.trim() || null,
          again: foodVisitAgain || null,
          dishes: dishes.length ? dishes : null,
          photo_data: photoPayload,
        });
      } else {
        await createFoodVisit(foodVisitPlace.id, {
          visited_at: dateValue.toISOString(),
          rating: ratingValue,
          description: foodVisitDescription.trim() || null,
          again: foodVisitAgain || null,
          dishes: dishes.length ? dishes : null,
          photo_data: photoPayload,
        });
      }
      setFoodVisitRefreshKey((prev) => prev + 1);
      setFoodPlaceDetailRefreshKey((prev) => prev + 1);
      setFoodRefreshKey((prev) => prev + 1);
      addToast({
        title: foodEditingVisit ? "Food visit updated" : "Food visit saved",
        description: foodVisitPlace.name,
        color: "success",
        timeout: 2000,
      });
      setFoodEditingVisit(null);
      setIsFoodVisitOpen(false);
    } catch (error) {
      addToast({
        title: "Unable to save visit",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsFoodVisitSaving(false);
    }
  };

  const handleVerifyPin = async (pinValue = pin) => {
    if (!selectedUser?.telegram_uid) {
      setStatusMessage("Select your user first.");
      return;
    }
    setStatusMessage("");
    setIsPinLoading(true);
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        const refreshed = await refreshAccessToken(refreshToken);
        localStorage.setItem("auth_token", refreshed.access_token);
        localStorage.setItem("refresh_token", refreshed.refresh_token);
        setIsAuthenticated(true);
        setIsPinLoading(false);
        return;
      } catch (error) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
      }
    }
    try {
      const device = getDeviceInfo();
      const response = await verifyPin(
        selectedUser.telegram_uid,
        pinValue.trim(),
        device,
      );
      if (response.status === "trusted") {
        if (response.access_token) {
          localStorage.setItem("auth_token", response.access_token);
        }
        if (response.refresh_token) {
          localStorage.setItem("refresh_token", response.refresh_token);
        }
        setPinVerified(false);
        setOtpCode("");
        setPinError(false);
        setIsAuthenticated(true);
      } else {
        setPinVerified(true);
        setPinError(false);
        if (response.status === "otp_pending") {
          addToast({
            title: "Telegram unavailable",
            description: "We could not deliver the OTP. Try again in a moment.",
            color: "warning",
            timeout: 4000,
            shouldShowTimeoutProgress: true,
          });
        } else {
          addToast({
            title: "OTP sent",
            description: "Check your Telegram messages.",
            color: "success",
            timeout: 3000,
            shouldShowTimeoutProgress: true,
          });
        }
      }
    } catch (error) {
      setPinError(true);
      setPinShake(true);
      setPin("");
    }
    setIsPinLoading(false);
  };

  const handleResendOtp = async () => {
    if (!selectedUser?.telegram_uid || !pin) {
      addToast({
        title: "Enter your PIN first",
        description: "We need your PIN to resend the OTP.",
        color: "warning",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }
    await handleVerifyPin(pin);
  };

  const handlePinChange = (value) => {
    setPin(value);
    setPinError(false);
    if (value.length === PIN_LENGTH && !isPinLoading) {
      handleVerifyPin(value);
    }
  };

  const handleOtpChange = (value) => {
    setOtpCode(value);
    setOtpError(false);
    if (value.length === 6 && !isOtpLoading) {
      handleVerifyOtp(value);
    }
  };

  const handleVerifyOtp = async (otpValue = otpCode) => {
    if (!selectedUser?.telegram_uid) {
      setStatusMessage("Select your user first.");
      return;
    }
    setStatusMessage("");
    setIsOtpLoading(true);
    try {
      const device = getDeviceInfo();
      const response = await verifyOtp(
        selectedUser.telegram_uid,
        otpValue.trim(),
        device,
      );
      localStorage.setItem("auth_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      setIsAuthenticated(true);
      navigate("/");
    } catch (error) {
      setOtpError(true);
      setOtpShake(true);
      setOtpCode("");
    }
    setIsOtpLoading(false);
  };

  const handleLogout = () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      logout(refreshToken).catch(() => {});
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    setSelectedUser(null);
    setPin("");
    setOtpCode("");
    setPinVerified(false);
    setPinError(false);
    setOtpError(false);
    setStatusMessage("");
    navigate("/");
  };

  const handleRevokeDevice = async (deviceId) => {
    if (!localStorage.getItem("refresh_token")) {
      return;
    }
    await revokeDevice(deviceId);
    const refreshed = await fetchProfile();
    setProfile(refreshed);
  };

  const openEditProfile = () => {
    if (!profile) {
      return;
    }
    setEditName(profile.display_name || "");
    setEditBirthday(profile.birthday ? profile.birthday.slice(0, 10) : "");
    setEditAccent(profile.accent_color || ACCENT_COLORS[0].value);
    setEditAvatarPreview(resolveAvatarUrl(profile.avatar_url) || "");
    setEditAvatarData(null);
    setEditAvatarChanged(false);
    setEditHeaderPreview(resolveHeaderUrl(profile.header_url) || "");
    setEditHeaderData(null);
    setEditHeaderChanged(false);
    setIsEditOpen(true);
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCropImageSrc(dataUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setAvatarCroppedAreaPixels(null);
      setIsCropOpen(true);
    } catch (error) {
      addToast({
        title: "Unable to process image",
        description: "Please try a different photo.",
        color: "warning",
        timeout: 3000,
      });
    }
  };

  const handleHeaderChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setHeaderCropImageSrc(dataUrl);
      setHeaderCrop({ x: 0, y: 0 });
      setHeaderZoom(1);
      setHeaderCroppedAreaPixels(null);
      setIsHeaderCropOpen(true);
    } catch (error) {
      addToast({
        title: "Unable to process image",
        description: "Please try a different photo.",
        color: "warning",
        timeout: 3000,
      });
    }
  };

  const handleCropConfirm = async () => {
    if (!cropImageSrc || !avatarCroppedAreaPixels) {
      addToast({
        title: "Select a crop area",
        description: "Pinch or drag to set the crop.",
        color: "warning",
        timeout: 2000,
      });
      return;
    }
    setIsAvatarCropSaving(true);
    setIsCropOpen(false);
    try {
      const cropped = await getCroppedImage(
        cropImageSrc,
        avatarCroppedAreaPixels,
        500,
        500,
        "round",
      );
      setEditAvatarPreview(cropped);
      setEditAvatarData(cropped);
      setEditAvatarChanged(true);
    } catch (error) {
      addToast({
        title: "Unable to crop image",
        description: error?.message || "Please try again.",
        color: "warning",
        timeout: 3000,
      });
    } finally {
      setIsAvatarCropSaving(false);
    }
  };

  const handleHeaderCropConfirm = async () => {
    if (!headerCropImageSrc || !headerCroppedAreaPixels) {
      addToast({
        title: "Select a crop area",
        description: "Pinch or drag to set the crop.",
        color: "warning",
        timeout: 2000,
      });
      return;
    }
    setIsHeaderCropSaving(true);
    setIsHeaderCropOpen(false);
    try {
      const cropped = await getCroppedImage(
        headerCropImageSrc,
        headerCroppedAreaPixels,
        1200,
        400,
        "rect",
      );
      setEditHeaderPreview(cropped);
      setEditHeaderData(cropped);
      setEditHeaderChanged(true);
    } catch (error) {
      addToast({
        title: "Unable to crop header",
        description: error?.message || "Please try again.",
        color: "warning",
        timeout: 3000,
      });
    } finally {
      setIsHeaderCropSaving(false);
    }
  };

  const handleProfileSave = async () => {
    if (!profile) {
      return;
    }
    if (!localStorage.getItem("refresh_token")) {
      addToast({
        title: "Session expired",
        description: "Please log in again.",
        color: "warning",
        timeout: 3000,
      });
      return;
    }
    setIsEditSaving(true);
    const payload = {
      display_name: editName.trim() || null,
      birthday: editBirthday || "",
      accent_color: editAccent,
    };
    if (editAvatarData !== null) {
      payload.avatar_data = editAvatarData;
    } else if (editAvatarChanged && editAvatarPreview?.startsWith("data:")) {
      payload.avatar_data = editAvatarPreview;
    }
    if (editHeaderData !== null) {
      payload.header_data = editHeaderData;
    } else if (editHeaderChanged && editHeaderPreview?.startsWith("data:")) {
      payload.header_data = editHeaderPreview;
    }
    if (editAvatarChanged && payload.avatar_data === undefined) {
      addToast({
        title: "No avatar data",
        description: "Please reselect the photo.",
        color: "warning",
        timeout: 2000,
      });
      setIsEditSaving(false);
      return;
    }
    if (editHeaderChanged && payload.header_data === undefined) {
      addToast({
        title: "No header data",
        description: "Please reselect the photo.",
        color: "warning",
        timeout: 2000,
      });
      setIsEditSaving(false);
      return;
    }
    try {
      const updated = await updateProfile(payload);
      setProfile(updated);
      setEditAvatarPreview(resolveAvatarUrl(updated.avatar_url) || "");
      setEditAvatarData(null);
      setEditAvatarChanged(false);
      setEditHeaderPreview(resolveHeaderUrl(updated.header_url) || "");
      setEditHeaderData(null);
      setEditHeaderChanged(false);
      setEditAccent(updated.accent_color || ACCENT_COLORS[0].value);
      setIsEditOpen(false);
      addToast({
        title: "Profile updated",
        description: updated.avatar_url
          ? "Avatar saved."
          : "Saved without avatar.",
        color: "success",
        timeout: 2500,
      });
    } catch (error) {
      addToast({
        title: "Profile update failed",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsEditSaving(false);
    }
  };

  const handleChangePin = async () => {
    if (newPin.length !== PIN_LENGTH) {
      setNewPinError(true);
      setNewPinShake(true);
      return;
    }
    if (newPin !== confirmPin) {
      setConfirmPinError(true);
      setConfirmPinShake(true);
      return;
    }
    setIsPinSaving(true);
    try {
      await changePin(currentPin, newPin);
      setIsPinModalOpen(false);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setPinStep(0);
      addToast({
        title: "PIN updated",
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      setConfirmPinError(true);
      setConfirmPinShake(true);
    } finally {
      setIsPinSaving(false);
    }
  };

  const handleVerifyCurrentPin = async () => {
    if (currentPin.length !== PIN_LENGTH) {
      return;
    }
    setIsPinVerifying(true);
    try {
      await verifyCurrentPin(currentPin);
      setCurrentPinError(false);
      setPinStep(1);
    } catch (error) {
      setCurrentPinError(true);
      setCurrentPinShake(true);
      setCurrentPin("");
    } finally {
      setIsPinVerifying(false);
    }
  };

  const fetchLocationSearch = async (query) => {
    if (!query.trim()) {
      setLocationResults([]);
      return;
    }
    setIsLocationCollapsed(false);
    setIsSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&viewbox=103.6,1.2,104.1,1.5&bounded=0&q=${encodeURIComponent(
          query,
        )}`,
      );
      const results = await response.json();
      const normalized = results.map((item) => ({
        id: `${item.place_id}`,
        name: item.name || item.display_name,
        formatted: formatCheckInAddress(item.address, item.display_name),
        lat: Number(item.lat),
        lon: Number(item.lon),
      }));
      setLocationResults(normalized);
    } catch (error) {
      setLocationResults([]);
      addToast({
        title: "Unable to search locations",
        description: "Please try again in a moment.",
        color: "warning",
        timeout: 3000,
      });
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const fetchFoodLocationSearch = async (query) => {
    if (!query.trim()) {
      setFoodLocationResults([]);
      return;
    }
    setIsFoodLocationCollapsed(false);
    setIsFoodSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&viewbox=103.6,1.2,104.1,1.5&bounded=0&q=${encodeURIComponent(
          query,
        )}`,
      );
      const results = await response.json();
      const normalized = results.map((item) => ({
        id: `${item.place_id}`,
        name: item.name || item.display_name,
        formatted: formatCheckInAddress(item.address, item.display_name),
        lat: Number(item.lat),
        lon: Number(item.lon),
      }));
      setFoodLocationResults(normalized);
    } catch (error) {
      setFoodLocationResults([]);
      addToast({
        title: "Unable to search locations",
        description: "Please try again in a moment.",
        color: "warning",
        timeout: 3000,
      });
    } finally {
      setIsFoodSearching(false);
    }
  };

  const fetchReverseGeocode = async (lat, lon) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`,
    );
    const result = await response.json();
    return {
      id: `${result.place_id || `${lat}-${lon}`}`,
      name: result.name || result.display_name || "Current location",
      formatted: formatCheckInAddress(result.address, result.display_name),
      lat: Number(result.lat || lat),
      lon: Number(result.lon || lon),
    };
  };

  const handleLocateMe = async () => {
    if (!navigator.geolocation) {
      addToast({
        title: "Location unavailable",
        description: "Enable location services to use this feature.",
        color: "warning",
        timeout: 3000,
      });
      return null;
    }
    setIsLocating(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const result = await fetchReverseGeocode(latitude, longitude);
            setLocationResults([result]);
            setSelectedLocation(result);
            resolve(result);
          } catch (error) {
            addToast({
              title: "Unable to fetch address",
              description: "Please try again.",
              color: "warning",
              timeout: 3000,
            });
            resolve(null);
          } finally {
            setIsLocating(false);
          }
        },
        () => {
          setIsLocating(false);
          addToast({
            title: "Location denied",
            description: "Allow location access to use quick check in.",
            color: "warning",
            timeout: 3000,
          });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  };

  const handleFoodLocate = async () => {
    if (!navigator.geolocation) {
      addToast({
        title: "Location unavailable",
        description: "Enable location services to use this feature.",
        color: "warning",
        timeout: 3000,
      });
      return null;
    }
    setIsFoodLocating(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const result = await fetchReverseGeocode(latitude, longitude);
            setFoodLocationResults([result]);
            setFoodSelectedLocation(result);
            resolve(result);
          } catch (error) {
            addToast({
              title: "Unable to fetch address",
              description: "Please try again.",
              color: "warning",
              timeout: 3000,
            });
            resolve(null);
          } finally {
            setIsFoodLocating(false);
          }
        },
        () => {
          setIsFoodLocating(false);
          addToast({
            title: "Location denied",
            description: "Allow location access to use this feature.",
            color: "warning",
            timeout: 3000,
          });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  };

  const handleQuickCheckIn = async () => {
    const result = await handleLocateMe();
    if (!result) {
      return;
    }
    setIsQuickCheckInSaving(true);
    try {
      await createCheckIn({
        location_name: result.name,
        location_label: result.formatted,
        latitude: result.lat,
        longitude: result.lon,
        visited_at: new Date().toISOString(),
      });
      setCheckInPage(1);
      setCheckInRefreshKey((prev) => prev + 1);
      addToast({
        title: "Check in saved",
        description: result.formatted,
        color: "success",
        timeout: 2500,
      });
    } catch (error) {
      addToast({
        title: "Unable to save check in",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsQuickCheckInSaving(false);
    }
  };

  const handleManualCheckInSave = async () => {
    if (!selectedLocation) {
      addToast({
        title: "Select a location",
        description: "Choose a location before saving.",
        color: "warning",
        timeout: 2500,
      });
      return;
    }
    if (!manualDate) {
      addToast({
        title: "Select a date",
        description: "Pick the date of your visit.",
        color: "warning",
        timeout: 2500,
      });
      return;
    }
    const dateValue = manualDate.toDate(getLocalTimeZone());
    if (manualTime) {
      dateValue.setHours(manualTime.hour, manualTime.minute, 0, 0);
    }
    setIsManualCheckInSaving(true);
    try {
      if (editingCheckIn) {
        await updateCheckIn(editingCheckIn.id, {
          location_name: selectedLocation.name,
          location_label: selectedLocation.formatted,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lon,
          visited_at: dateValue.toISOString(),
        });
      } else {
        await createCheckIn({
          location_name: selectedLocation.name,
          location_label: selectedLocation.formatted,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lon,
          visited_at: dateValue.toISOString(),
        });
      }
      setCheckInPage(1);
      setCheckInRefreshKey((prev) => prev + 1);
      setIsManualCheckInOpen(false);
      setEditingCheckIn(null);
      addToast({
        title: editingCheckIn ? "Check in updated" : "Check in saved",
        description: selectedLocation.formatted,
        color: "success",
        timeout: 2500,
      });
    } catch (error) {
      addToast({
        title: editingCheckIn
          ? "Unable to update check in"
          : "Unable to save check in",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsManualCheckInSaving(false);
    }
  };

  const openManualCheckIn = () => {
    setEditingCheckIn(null);
    setManualDate(today(getLocalTimeZone()));
    const now = new Date();
    setManualTime(new Time(now.getHours(), now.getMinutes()));
    setLocationQuery("");
    setLocationResults([]);
    setSelectedLocation(null);
    setIsLocationCollapsed(false);
    setIsManualCheckInOpen(true);
  };

  const openFoodPlaceModal = () => {
    setFoodEditingPlace(null);
    setFoodName("");
    setFoodNameExists(false);
    setFoodCuisine("");
    setFoodCuisineCategory("");
    setFoodCuisineSubcategory("");
    setFoodComments("");
    setFoodOpen(true);
    setFoodHeaderPreview("");
    setFoodHeaderData(null);
    setFoodHeaderChanged(false);
    setFoodLocationQuery("");
    setFoodLocationResults([]);
    setFoodSelectedLocation(null);
    setIsFoodLocationCollapsed(false);
    setIsFoodPlaceOpen(true);
  };

  const resetActivityForm = () => {
    setActivityType("exercise");
    setActivityName("");
    setActivityNameExists(false);
    setActivityAddress("");
    setActivityLocationQuery("");
    setActivityLocationResults([]);
    setActivitySelectedLocation(null);
    setIsActivityLocationCollapsed(false);
    setActivityCategory("hike");
    setActivityBucketFormCategory(ACTIVITY_BUCKET_CATEGORIES[0].value);
    setActivityDifficulty("easy");
    setActivityDescription("");
    setActivityImagePreview("");
    setActivityImageData(null);
    setActivityImageChanged(false);
    setActivityCropImageSrc("");
    setActivityCrop({ x: 0, y: 0 });
    setActivityZoom(1);
    setActivityCroppedAreaPixels(null);
    setIsActivityCropOpen(false);
  };

  const openActivityVisitModal = (activity) => {
    if (!activity) {
      return;
    }
    setActivityVisitEditing(null);
    setActivityVisitActivity(activity);
    setActivityVisitDistance("");
    setActivityVisitRating("na");
    setActivityVisitDate(today(getLocalTimeZone()));
    setActivityVisitTitle("");
    setActivityVisitDescription("");
    setActivityVisitPhotoPreview("");
    setActivityVisitPhotoData(null);
    setActivityVisitPhotoChanged(false);
    setActivityVisitCropImageSrc("");
    setActivityVisitCrop({ x: 0, y: 0 });
    setActivityVisitZoom(1);
    setActivityVisitCroppedAreaPixels(null);
    setIsActivityVisitCropOpen(false);
    setIsActivityVisitOpen(true);
  };

  const openActivityVisitSelect = () => {
    setActivityVisitSearchQuery("");
    setActivityVisitSearchResults([]);
    setActivityVisitSelected(null);
    setIsActivityVisitSelectOpen(true);
  };

  const handleActivityVisitSearch = () => {
    const query = activityVisitSearchQuery.trim().toLowerCase();
    if (!query) {
      setActivityVisitSearchResults([]);
      return;
    }
    setIsActivityVisitSearching(true);
    try {
      const results = (activities || []).filter((item) => {
        const haystack = [item.name, item.address, item.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
      setActivityVisitSearchResults(results);
    } finally {
      setIsActivityVisitSearching(false);
    }
  };

  const openActivityVisitEdit = (visit, activityOverride) => {
    if (!visit) {
      return;
    }
    const fallbackActivity =
      activities.find((entry) => entry.id === visit.activity_id) || null;
    const activity = activityOverride ||
      activityVisitActivity ||
      fallbackActivity || {
        id: visit.activity_id,
        name: visit.activity_name || "Activity",
        address: visit.activity_address,
        activity_type: visit.activity_type,
        category: visit.activity_category,
      };
    const parsed = visit.visited_at
      ? parseCheckInDate(visit.visited_at)
      : new Date();
    const dateValue = parseDate(toLocalDateString(parsed));
    setActivityVisitEditing(visit);
    setActivityVisitActivity(activity);
    setActivityVisitDistance(
      typeof visit.distance_km === "number" ? String(visit.distance_km) : "",
    );
    setActivityVisitRating(visit.rating || "na");
    setActivityVisitDate(dateValue);
    setActivityVisitTitle(visit.activity_title || "");
    setActivityVisitDescription(visit.description || "");
    setActivityVisitPhotoPreview(resolveHeaderUrl(visit.photo_url) || "");
    setActivityVisitPhotoData(null);
    setActivityVisitPhotoChanged(false);
    setActivityVisitCropImageSrc("");
    setActivityVisitCrop({ x: 0, y: 0 });
    setActivityVisitZoom(1);
    setActivityVisitCroppedAreaPixels(null);
    setIsActivityVisitCropOpen(false);
    setIsActivityVisitOpen(true);
  };

  const openActivityModal = (activity = null) => {
    setActivityEditing(activity);
    setActivityNameExists(false);
    if (!activity) {
      resetActivityForm();
      setIsActivityModalOpen(true);
      return;
    }
    setActivityType(activity.activity_type || "exercise");
    setActivityName(activity.name || "");
    setActivityAddress(activity.address || "");
    setActivityLocationQuery(activity.address || "");
    setActivityLocationResults([]);
    setActivitySelectedLocation(
      activity.address
        ? {
            id: `activity-${activity.id}`,
            name: activity.address,
            formatted: activity.address,
            lat: activity.latitude ?? null,
            lon: activity.longitude ?? null,
          }
        : null,
    );
    setIsActivityLocationCollapsed(false);
    if (activity.activity_type === "bucket") {
      setActivityBucketFormCategory(
        activity.category || ACTIVITY_BUCKET_CATEGORIES[0].value,
      );
    } else {
      setActivityCategory(activity.category || "hike");
    }
    setActivityDifficulty(activity.difficulty || "easy");
    setActivityDescription(activity.description || "");
    setActivityImagePreview(resolveHeaderUrl(activity.image_url) || "");
    setActivityImageData(null);
    setActivityImageChanged(false);
    setActivityCropImageSrc("");
    setActivityCrop({ x: 0, y: 0 });
    setActivityZoom(1);
    setActivityCroppedAreaPixels(null);
    setIsActivityCropOpen(false);
    setIsActivityModalOpen(true);
  };

  const handleActivityImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setActivityCropImageSrc(dataUrl);
      setActivityCrop({ x: 0, y: 0 });
      setActivityZoom(1);
      setActivityCroppedAreaPixels(null);
      setIsActivityCropOpen(true);
    } catch (error) {
      addToast({
        title: "Unable to process image",
        description: "Please try a different photo.",
        color: "warning",
        timeout: 3000,
      });
    }
  };

  const handleActivityVisitPhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setActivityVisitCropImageSrc(dataUrl);
      setActivityVisitCrop({ x: 0, y: 0 });
      setActivityVisitZoom(1);
      setActivityVisitCroppedAreaPixels(null);
      setIsActivityVisitCropOpen(true);
    } catch (error) {
      addToast({
        title: "Unable to process image",
        description: "Please try a different photo.",
        color: "warning",
        timeout: 3000,
      });
    }
  };

  const handleActivityVisitCropConfirm = async () => {
    if (!activityVisitCropImageSrc || !activityVisitCroppedAreaPixels) {
      addToast({
        title: "Select a crop area",
        description: "Pinch or drag to set the crop.",
        color: "warning",
        timeout: 2000,
      });
      return;
    }
    setIsActivityVisitCropSaving(true);
    setIsActivityVisitCropOpen(false);
    try {
      const cropped = await getCroppedImage(
        activityVisitCropImageSrc,
        activityVisitCroppedAreaPixels,
        1200,
        800,
        "rect",
      );
      setActivityVisitPhotoPreview(cropped);
      setActivityVisitPhotoData(cropped);
      setActivityVisitPhotoChanged(true);
    } catch (error) {
      addToast({
        title: "Unable to crop image",
        description: error?.message || "Please try again.",
        color: "warning",
        timeout: 3000,
      });
    } finally {
      setIsActivityVisitCropSaving(false);
    }
  };

  const handleActivityVisitSave = async () => {
    if (!activityVisitActivity) {
      return;
    }
    setIsActivityVisitSaving(true);
    try {
      const dateValue = activityVisitDate?.toDate
        ? activityVisitDate.toDate(getLocalTimeZone())
        : new Date();
      const payload = {
        visited_at: dateValue.toISOString(),
        rating: activityVisitRating === "na" ? null : activityVisitRating,
        activity_title: activityVisitTitle.trim() || null,
        description: activityVisitDescription.trim() || null,
        distance_km: activityVisitDistance
          ? Number.parseFloat(activityVisitDistance)
          : null,
        photo_data: activityVisitPhotoChanged
          ? activityVisitPhotoData || ""
          : null,
      };
      if (activityVisitEditing) {
        await updateActivityVisit(
          activityVisitActivity.id,
          activityVisitEditing.id,
          payload,
        );
      } else {
        await createActivityVisit(activityVisitActivity.id, payload);
      }
      setActivityRefreshKey((prev) => prev + 1);
      addToast({
        title: activityVisitEditing
          ? "Activity visit updated"
          : "Activity visit saved",
        description: activityVisitActivity.name,
        color: "success",
        timeout: 2000,
      });
      setIsActivityVisitOpen(false);
    } catch (error) {
      addToast({
        title: "Unable to save visit",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsActivityVisitSaving(false);
    }
  };

  useEffect(() => {
    if (!activityVisitDetail) {
      return;
    }
    setIsActivityVisitCommentsLoading(true);
    fetchActivityVisitComments(
      activityVisitDetail.activity_id,
      activityVisitDetail.id,
    )
      .then((payload) => {
        setActivityVisitComments((prev) => ({
          ...prev,
          [activityVisitDetail.id]: payload.items || [],
        }));
      })
      .catch(() => {})
      .finally(() => setIsActivityVisitCommentsLoading(false));
  }, [activityVisitDetail]);

  useEffect(() => {
    if (!selectedTierlist) {
      return;
    }
    setIsTierlistCommentsLoading(true);
    fetchTierlistComments(selectedTierlist.id)
      .then((payload) => {
        setTierlistComments((prev) => ({
          ...prev,
          [selectedTierlist.id]: payload.items || [],
        }));
      })
      .catch(() => {})
      .finally(() => setIsTierlistCommentsLoading(false));
  }, [selectedTierlist]);

  const handleActivityVisitCommentAdd = async (visitId, activityId) => {
    const draft = activityVisitCommentDraftRef.current[visitId] || "";
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }
    setIsActivityVisitCommentSaving(true);
    try {
      const created = await createActivityVisitComment(activityId, visitId, {
        body: trimmed,
      });
      setActivityVisitComments((prev) => {
        const current = prev[visitId] || [];
        return { ...prev, [visitId]: [created, ...current] };
      });
      activityVisitCommentDraftRef.current[visitId] = "";
      setActivityVisitCommentInputKey((prev) => prev + 1);
    } catch (error) {
      addToast({
        title: "Unable to post comment",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsActivityVisitCommentSaving(false);
    }
  };

  const handleTierlistCommentAdd = async (tierlistId) => {
    const draft = tierlistCommentDraftRef.current[tierlistId] || "";
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }
    setIsTierlistCommentSaving(true);
    try {
      const created = await createTierlistComment(tierlistId, {
        body: trimmed,
      });
      setTierlistComments((prev) => {
        const current = prev[tierlistId] || [];
        return { ...prev, [tierlistId]: [created, ...current] };
      });
      tierlistCommentDraftRef.current[tierlistId] = "";
      setTierlistCommentInputKey((prev) => prev + 1);
    } catch (error) {
      addToast({
        title: "Unable to post comment",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsTierlistCommentSaving(false);
    }
  };

  const handleTierlistCommentDelete = async (tierlistId, comment) => {
    if (!comment) {
      return;
    }
    try {
      await deleteTierlistComment(tierlistId, comment.id);
      setTierlistComments((prev) => {
        const current = prev[tierlistId] || [];
        return {
          ...prev,
          [tierlistId]: current.filter((entry) => entry.id !== comment.id),
        };
      });
    } catch (error) {
      addToast({
        title: "Unable to delete comment",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    }
  };

  const handleActivityVisitCommentDelete = async (comment) => {
    const visit = activityVisitDetail;
    if (!comment || !visit) {
      return;
    }
    try {
      await deleteActivityVisitComment(visit.activity_id, visit.id, comment.id);
      setActivityVisitComments((prev) => {
        const current = prev[visit.id] || [];
        return {
          ...prev,
          [visit.id]: current.filter((entry) => entry.id !== comment.id),
        };
      });
      addToast({
        title: "Comment deleted",
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      addToast({
        title: "Unable to delete comment",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    }
  };

  const confirmDeleteActivityVisitComment = async () => {
    if (!activityVisitCommentDeleteTarget) {
      return;
    }
    setIsDeletingActivityVisitComment(true);
    await handleActivityVisitCommentDelete(activityVisitCommentDeleteTarget);
    setIsDeletingActivityVisitComment(false);
    setActivityVisitCommentDeleteTarget(null);
  };

  const handleActivityVisitDelete = async (visit) => {
    if (!visit?.activity_id) {
      return;
    }
    setIsDeletingActivityVisit(true);
    try {
      await deleteActivityVisit(visit.activity_id, visit.id);
      setActivityRefreshKey((prev) => prev + 1);
      addToast({
        title: "Activity visit deleted",
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      addToast({
        title: "Unable to delete visit",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsDeletingActivityVisit(false);
    }
  };

  const confirmDeleteActivityVisit = async () => {
    if (!activityVisitDeleteTarget) {
      return;
    }
    await handleActivityVisitDelete(activityVisitDeleteTarget);
    setActivityVisitDeleteTarget(null);
  };

  const confirmDeleteActivity = async (onClose) => {
    if (!activityDeleteTarget) {
      return;
    }
    try {
      await deleteActivity(activityDeleteTarget.id);
      setActivityRefreshKey((prev) => prev + 1);
      addToast({
        title: "Activity deleted",
        color: "success",
        timeout: 2000,
      });
      setActivityDeleteTarget(null);
      onClose();
      navigate("/activities");
    } catch (error) {
      addToast({
        title: "Unable to delete activity",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    }
  };

  const fetchActivityLocationSearch = async (query) => {
    if (!query.trim()) {
      setActivityLocationResults([]);
      return;
    }
    setIsActivityLocationCollapsed(false);
    setIsActivitySearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&viewbox=103.6,1.2,104.1,1.5&bounded=0&q=${encodeURIComponent(
          query,
        )}`,
      );
      const results = await response.json();
      const normalized = results.map((item) => ({
        id: `${item.place_id}`,
        name: item.name || item.display_name,
        formatted: formatCheckInAddress(item.address, item.display_name),
        lat: Number(item.lat),
        lon: Number(item.lon),
      }));
      setActivityLocationResults(normalized);
    } catch (error) {
      setActivityLocationResults([]);
      addToast({
        title: "Unable to search locations",
        description: "Please try again in a moment.",
        color: "warning",
        timeout: 3000,
      });
    } finally {
      setIsActivitySearchingLocation(false);
    }
  };

  const isDuplicateNameInList = (name, entries, currentId) => {
    const normalized = normalizeName(name);
    if (!normalized) {
      return false;
    }
    return entries.some(
      (entry) =>
        normalizeName(entry?.name || "") === normalized &&
        entry?.id !== currentId,
    );
  };

  const checkFoodNameDuplicate = async (name = foodName) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return false;
    }
    const currentId = foodEditingPlace?.id;
    if (isDuplicateNameInList(trimmed, foodPlaces, currentId)) {
      return true;
    }
    try {
      const payload = await fetchFoodPlaces({
        page: 1,
        pageSize: 10,
        search: trimmed,
      });
      return isDuplicateNameInList(trimmed, payload.items || [], currentId);
    } catch (error) {
      return false;
    }
  };

  const checkActivityNameDuplicate = async (name = activityName) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return false;
    }
    const currentId = activityEditing?.id;
    if (isDuplicateNameInList(trimmed, activities, currentId)) {
      return true;
    }
    try {
      const payload = await fetchActivities({
        page: 1,
        page_size: 25,
        search: trimmed,
      });
      return isDuplicateNameInList(trimmed, payload.items || [], currentId);
    } catch (error) {
      return false;
    }
  };

  const handleActivitySave = async () => {
    if (!activityName.trim()) {
      addToast({
        title: "Add an activity name",
        color: "warning",
        timeout: 2000,
      });
      return;
    }
    setIsActivitySaving(true);
    const activityDuplicate = await checkActivityNameDuplicate();
    if (activityDuplicate) {
      setActivityNameExists(true);
      setDuplicateModalTitle("Activity already exists");
      setDuplicateModalMessage(
        `An activity named "${activityName.trim()}" already exists.`,
      );
      setIsDuplicateModalOpen(true);
      setIsActivitySaving(false);
      return;
    }
    const categoryValue =
      activityType === "exercise"
        ? activityCategory
        : activityBucketFormCategory || ACTIVITY_BUCKET_CATEGORIES[0].value;
    const payload = {
      activity_type: activityType,
      name: activityName.trim(),
      address: activityAddress.trim() || null,
      latitude: activitySelectedLocation?.lat ?? null,
      longitude: activitySelectedLocation?.lon ?? null,
      category: categoryValue,
      difficulty: activityType === "exercise" ? activityDifficulty : null,
      description: activityDescription.trim() || null,
    };
    if (activityImageChanged) {
      payload.image_data = activityImageData || "";
    }
    try {
      if (activityEditing) {
        await updateActivity(activityEditing.id, payload);
      } else {
        await createActivity(payload);
      }
      setActivityRefreshKey((prev) => prev + 1);
      setIsActivityModalOpen(false);
      setActivityEditing(null);
      addToast({
        title: activityEditing ? "Activity updated" : "Activity saved",
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      addToast({
        title: activityEditing
          ? "Unable to update activity"
          : "Unable to save activity",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsActivitySaving(false);
    }
  };

  const handleFoodHeaderChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFoodHeaderCropImageSrc(dataUrl);
      setFoodHeaderCrop({ x: 0, y: 0 });
      setFoodHeaderZoom(1);
      setFoodHeaderCroppedAreaPixels(null);
      setIsFoodHeaderCropOpen(true);
    } catch (error) {
      addToast({
        title: "Unable to process image",
        description: "Please try a different photo.",
        color: "warning",
        timeout: 3000,
      });
    }
  };

  const handleFoodHeaderCropConfirm = async () => {
    if (!foodHeaderCropImageSrc || !foodHeaderCroppedAreaPixels) {
      addToast({
        title: "Select a crop area",
        description: "Pinch or drag to set the crop.",
        color: "warning",
        timeout: 2000,
      });
      return;
    }
    setIsFoodHeaderCropSaving(true);
    setIsFoodHeaderCropOpen(false);
    try {
      const cropped = await getCroppedImage(
        foodHeaderCropImageSrc,
        foodHeaderCroppedAreaPixels,
        1200,
        800,
        "rect",
      );
      setFoodHeaderPreview(cropped);
      setFoodHeaderData(cropped);
      setFoodHeaderChanged(true);
    } catch (error) {
      addToast({
        title: "Unable to crop header",
        description: error?.message || "Please try again.",
        color: "warning",
        timeout: 3000,
      });
    } finally {
      setIsFoodHeaderCropSaving(false);
    }
  };

  const handleActivityCropConfirm = async () => {
    if (!activityCropImageSrc || !activityCroppedAreaPixels) {
      addToast({
        title: "Select a crop area",
        description: "Pinch or drag to set the crop.",
        color: "warning",
        timeout: 2000,
      });
      return;
    }
    setIsActivityCropSaving(true);
    setIsActivityCropOpen(false);
    try {
      const cropped = await getCroppedImage(
        activityCropImageSrc,
        activityCroppedAreaPixels,
        1200,
        800,
        "rect",
      );
      setActivityImagePreview(cropped);
      setActivityImageData(cropped);
      setActivityImageChanged(true);
    } catch (error) {
      addToast({
        title: "Unable to crop image",
        description: error?.message || "Please try again.",
        color: "warning",
        timeout: 3000,
      });
    } finally {
      setIsActivityCropSaving(false);
    }
  };

  const normalizeTierItems = (items, tierId) => {
    const list = (items || []).map((item, index) => ({
      id: `${tierId}-item-${index + 1}`,
      value: item,
      isNew: false,
    }));
    return list.length
      ? list
      : [{ id: `${tierId}-item-1`, value: "", isNew: false }];
  };

  const resetTierlistForm = () => {
    setTierlistTitle("");
    setTierlistDescription("");
    setTierlistTiers(
      DEFAULT_TIERLIST_TIERS.map((tier) => ({
        ...tier,
        items: [{ id: `${tier.id}-item-1`, value: "", isNew: false }],
      })),
    );
    setTierlistHeaderPreview("");
    setTierlistHeaderData(null);
    setTierlistHeaderChanged(false);
    setTierlistEditing(null);
  };

  const openTierlistModal = () => {
    resetTierlistForm();
    setIsTierlistOpen(true);
  };

  const openTierlistEdit = (entry) => {
    if (!entry) {
      return;
    }
    setTierlistEditing(entry);
    setTierlistTitle(entry.title || "");
    setTierlistDescription(entry.description || "");
    const tiers = (entry.tiers || DEFAULT_TIERLIST_TIERS).map((tier) => ({
      id: tier.id || tier.label || `${Date.now()}`,
      label: tier.label || tier.id || "Tier",
      color: tier.color || "#A855F7",
      items: normalizeTierItems(tier.items, tier.id || tier.label || "tier"),
    }));
    setTierlistTiers(tiers);
    setTierlistHeaderPreview(resolveHeaderUrl(entry.header_url) || "");
    setTierlistHeaderData(null);
    setTierlistHeaderChanged(false);
    setIsTierlistOpen(true);
  };

  const handleTierlistHeaderChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setTierlistHeaderCropImageSrc(dataUrl);
      setTierlistHeaderCrop({ x: 0, y: 0 });
      setTierlistHeaderZoom(1);
      setTierlistHeaderCroppedAreaPixels(null);
      setIsTierlistHeaderCropOpen(true);
    } catch (error) {
      addToast({
        title: "Unable to process image",
        description: "Please try a different photo.",
        color: "warning",
        timeout: 3000,
      });
    }
  };

  const handleTierlistHeaderCropConfirm = async () => {
    if (!tierlistHeaderCropImageSrc || !tierlistHeaderCroppedAreaPixels) {
      addToast({
        title: "Select a crop area",
        description: "Pinch or drag to set the crop.",
        color: "warning",
        timeout: 2000,
      });
      return;
    }
    setIsTierlistHeaderCropSaving(true);
    setIsTierlistHeaderCropOpen(false);
    try {
      const cropped = await getCroppedImage(
        tierlistHeaderCropImageSrc,
        tierlistHeaderCroppedAreaPixels,
        1200,
        800,
        "rect",
      );
      setTierlistHeaderPreview(cropped);
      setTierlistHeaderData(cropped);
      setTierlistHeaderChanged(true);
    } catch (error) {
      addToast({
        title: "Unable to crop header",
        description: error?.message || "Please try again.",
        color: "warning",
        timeout: 3000,
      });
    } finally {
      setIsTierlistHeaderCropSaving(false);
    }
  };

  const handleTierlistTierLabelChange = (id, value) => {
    setTierlistTiers((prev) =>
      prev.map((tier) => (tier.id === id ? { ...tier, label: value } : tier)),
    );
  };

  const handleTierlistTierColorChange = (id, color) => {
    setTierlistTiers((prev) =>
      prev.map((tier) => (tier.id === id ? { ...tier, color } : tier)),
    );
  };

  const handleTierlistTierAdd = () => {
    setTierlistTiers((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        label: "New tier",
        color: "#A855F7",
        items: [{ id: `${Date.now()}-item-1`, value: "", isNew: true }],
      },
    ]);
  };

  const handleTierlistTierRemove = (id) => {
    setTierlistTiers((prev) =>
      prev.length > 1 ? prev.filter((tier) => tier.id !== id) : prev,
    );
  };

  const handleTierItemChange = (tierId, itemId, value) => {
    setTierlistTiers((prev) =>
      prev.map((tier) => {
        if (tier.id !== tierId) {
          return tier;
        }
        const nextItems = tier.items.map((item) =>
          item.id === itemId ? { ...item, value, isNew: false } : item,
        );
        const hasEmpty = nextItems.some((item) => !item.value.trim());
        if (!hasEmpty) {
          nextItems.push({
            id: `${tierId}-item-${Date.now()}`,
            value: "",
            isNew: true,
          });
        }
        return { ...tier, items: nextItems };
      }),
    );
  };

  const handleTierItemCommit = (tierId, itemId) => {
    setTierlistTiers((prev) =>
      prev.map((tier) => {
        if (tier.id !== tierId) {
          return tier;
        }
        const nextItems = tier.items
          .filter((item) => {
            if (item.id !== itemId) {
              return true;
            }
            return item.value.trim().length > 0;
          })
          .map((item) => ({ ...item, isNew: false }));
        if (!nextItems.length) {
          nextItems.push({
            id: `${tierId}-item-${Date.now()}`,
            value: "",
            isNew: true,
          });
        }
        return { ...tier, items: nextItems };
      }),
    );
  };

  const handleTierItemAdd = (tierId) => {
    setTierlistTiers((prev) =>
      prev.map((tier) => {
        if (tier.id !== tierId) {
          return tier;
        }
        const nextItems = [...tier.items];
        const last = nextItems[nextItems.length - 1];
        if (last && !last.value.trim()) {
          return tier;
        }
        nextItems.push({
          id: `${tierId}-item-${Date.now()}`,
          value: "",
          isNew: true,
        });
        return { ...tier, items: nextItems };
      }),
    );
  };

  const handleTierlistSave = async () => {
    if (!tierlistTitle.trim()) {
      addToast({
        title: "Add a title",
        description: "Tierlists need a title to save.",
        color: "warning",
        timeout: 2000,
      });
      return;
    }
    const tiers = tierlistTiers.map((tier) => ({
      label: tier.label?.trim() || "Tier",
      color: tier.color || "#A855F7",
      items: (tier.items || [])
        .map((item) => item.value?.trim())
        .filter(Boolean),
    }));
    const payload = {
      title: tierlistTitle.trim(),
      description: tierlistDescription.trim() || null,
      tiers,
    };
    if (tierlistHeaderChanged) {
      payload.header_data = tierlistHeaderData || "";
    }
    setIsTierlistSaving(true);
    try {
      const saved = tierlistEditing
        ? await updateTierlist(tierlistEditing.id, payload)
        : await createTierlist(payload);
      setTierlists((prev) => {
        const next = [...prev];
        const index = next.findIndex((entry) => entry.id === saved.id);
        if (index >= 0) {
          next[index] = saved;
        } else {
          next.unshift(saved);
        }
        return next;
      });
      setTierlistTotal((prev) =>
        tierlistEditing ? prev : Math.max(0, prev + 1),
      );
      setSelectedTierlist((prev) => (prev?.id === saved.id ? saved : prev));
      setIsTierlistOpen(false);
      setTierlistEditing(null);
      addToast({
        title: tierlistEditing ? "Tierlist updated" : "Tierlist saved",
        description: tierlistTitle.trim(),
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      addToast({
        title: tierlistEditing
          ? "Unable to update tierlist"
          : "Unable to save tierlist",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsTierlistSaving(false);
    }
  };

  const handleTierlistDelete = async () => {
    if (!tierlistDeleteTarget) {
      return;
    }
    setIsTierlistSaving(true);
    try {
      await deleteTierlist(tierlistDeleteTarget.id);
      setTierlists((prev) =>
        prev.filter((entry) => entry.id !== tierlistDeleteTarget.id),
      );
      setTierlistTotal((prev) => Math.max(0, prev - 1));
      setTierlistDeleteTarget(null);
      setSelectedTierlist(null);
      addToast({
        title: "Tierlist deleted",
        description: tierlistDeleteTarget.title,
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      addToast({
        title: "Unable to delete tierlist",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsTierlistSaving(false);
    }
  };

  const handleFoodPlaceSave = async () => {
    if (!foodName.trim()) {
      addToast({
        title: "Add a place name",
        color: "warning",
        timeout: 2000,
      });
      return;
    }
    if (!foodSelectedLocation) {
      addToast({
        title: "Select a location",
        description: "Choose a location before saving.",
        color: "warning",
        timeout: 2500,
      });
      return;
    }
    setIsFoodSaving(true);
    const foodDuplicate = await checkFoodNameDuplicate();
    if (foodDuplicate) {
      setFoodNameExists(true);
      setDuplicateModalTitle("Place already exists");
      setDuplicateModalMessage(
        `A place named "${foodName.trim()}" already exists.`,
      );
      setIsDuplicateModalOpen(true);
      setIsFoodSaving(false);
      return;
    }
    const cuisineValue = foodCuisineSubcategory || foodCuisineCategory;
    const cuisineLabel =
      foodCuisineCategory && foodCuisineSubcategory
        ? `${foodCuisineCategory} • ${foodCuisineSubcategory}`
        : cuisineValue || null;
    const payload = {
      name: foodName.trim(),
      location_name: foodSelectedLocation.name,
      location_label: foodSelectedLocation.formatted,
      latitude: foodSelectedLocation.lat,
      longitude: foodSelectedLocation.lon,
      cuisine: cuisineLabel,
      open: foodOpen,
      comments: foodComments.trim() || null,
    };
    if (foodHeaderChanged) {
      payload.header_data = foodHeaderData || "";
    }
    try {
      if (foodEditingPlace) {
        await updateFoodPlace(foodEditingPlace.id, payload);
        setFoodPlaceDetailRefreshKey((prev) => prev + 1);
      } else {
        await createFoodPlace(payload);
      }
      setFoodRefreshKey((prev) => prev + 1);
      setIsFoodPlaceOpen(false);
      setFoodEditingPlace(null);
      addToast({
        title: foodEditingPlace ? "Food place updated" : "Food place saved",
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      addToast({
        title: foodEditingPlace
          ? "Unable to update food place"
          : "Unable to save food place",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsFoodSaving(false);
    }
  };

  const openTripModal = (trip) => {
    setSelectedTrip(trip);
    setIsTripLoading(true);
    setIsTripModalOpen(true);
    fetchTrip(trip.id)
      .then((payload) => {
        setSelectedTrip({
          ...payload,
          monthLabel: formatMonthYear(payload.end_at),
        });
      })
      .catch(() => {})
      .finally(() => {
        setIsTripLoading(false);
      });
  };

  const handleFoodSearch = () => {
    if (!foodSearchQuery.trim()) {
      setFoodSearchError(false);
      setFoodSearchTerm("");
      setFoodPage(1);
      return;
    }
    setFoodSearchError(false);
    setFoodSearchTerm(foodSearchQuery.trim());
    setFoodPage(1);
  };

  const handleFoodVisitPlaceSearch = async (query) => {
    if (!query.trim()) {
      setFoodVisitPlaceSearchResults([]);
      return;
    }
    setIsFoodVisitPlaceSearching(true);
    try {
      const payload = await fetchFoodPlaces({
        page: 1,
        pageSize: 6,
        search: query.trim(),
      });
      setFoodVisitPlaceSearchResults(payload.items || []);
    } catch (error) {
      setFoodVisitPlaceSearchResults([]);
      addToast({
        title: "Unable to search food places",
        description: "Please try again in a moment.",
        color: "warning",
        timeout: 3000,
      });
    } finally {
      setIsFoodVisitPlaceSearching(false);
    }
  };

  const handleHelpDecideRoll = async () => {
    setIsHelpDecideRolling(true);
    setIsHelpDecideRevealing(true);
    setHelpDecideResult(null);
    setHelpDecideRadius(null);
    setHelpDecidePendingResult(null);
    setHelpDecidePendingRadius(null);
    setHelpDecideResponseReady(false);
    setHelpDecideVideoDone(false);
    setHelpDecideVideoKey((prev) => prev + 1);
    window.setTimeout(() => {
      const video = helpDecideVideoRef.current;
      if (!video) {
        return;
      }
      video.currentTime = 0;
      video.play().catch(() => {});
    }, 0);
    try {
      const cuisineCategories = helpDecideCuisineSelection.has("all")
        ? []
        : Array.from(helpDecideCuisineSelection);
      const payload = {
        latitude: helpDecideLocationEnabled
          ? (helpDecideLocation?.lat ?? null)
          : null,
        longitude: helpDecideLocationEnabled
          ? (helpDecideLocation?.lon ?? null)
          : null,
        cuisine_categories: cuisineCategories.length ? cuisineCategories : null,
      };
      const response = await rollFoodPlace(payload);
      setHelpDecidePendingResult(response.place || null);
      setHelpDecidePendingRadius(response.radius_km ?? null);
      setHelpDecideResponseReady(true);
    } catch (error) {
      setIsHelpDecideRevealing(false);
      setIsHelpDecideRolling(false);
      addToast({
        title: "Unable to help decide",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    }
  };

  useEffect(() => {
    if (!isHelpDecideRevealing || !helpDecideVideoDone) {
      return;
    }
    if (!helpDecideResponseReady) {
      return;
    }
    setHelpDecideResult(helpDecidePendingResult);
    setHelpDecideRadius(helpDecidePendingRadius);
    setIsHelpDecideRevealing(false);
    setIsHelpDecideRolling(false);
    const audio = new Audio(helpDecideSfxUrl);
    audio.play().catch(() => {});
  }, [
    helpDecidePendingRadius,
    helpDecidePendingResult,
    helpDecideResponseReady,
    helpDecideSfxUrl,
    helpDecideVideoDone,
    isHelpDecideRevealing,
  ]);

  const handleActivityDecideRoll = async () => {
    setIsActivityDecideRolling(true);
    setIsActivityDecideRevealing(true);
    setActivityDecideResult(null);
    setActivityDecideRadius(null);
    setActivityDecidePendingResult(null);
    setActivityDecidePendingRadius(null);
    setActivityDecideResponseReady(false);
    setActivityDecideVideoDone(false);
    setActivityDecideVideoKey((prev) => prev + 1);
    window.setTimeout(() => {
      const video = activityDecideVideoRef.current;
      if (!video) {
        return;
      }
      video.currentTime = 0;
      video.play().catch(() => {});
    }, 0);
    try {
      const categories = activityDecideCategorySelection.has("all")
        ? []
        : Array.from(activityDecideCategorySelection);
      const payload = {
        latitude: activityDecideLocationEnabled
          ? (activityDecideLocation?.lat ?? null)
          : null,
        longitude: activityDecideLocationEnabled
          ? (activityDecideLocation?.lon ?? null)
          : null,
        activity_type:
          activityDecidePreference === "all" ? null : activityDecidePreference,
        categories: categories.length ? categories : null,
      };
      const response = await rollActivity(payload);
      setActivityDecidePendingResult(response.activity || null);
      setActivityDecidePendingRadius(response.radius_km ?? null);
      setActivityDecideResponseReady(true);
    } catch (error) {
      setIsActivityDecideRevealing(false);
      setIsActivityDecideRolling(false);
      addToast({
        title: "Unable to help decide",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    }
  };

  useEffect(() => {
    if (!isActivityDecideRevealing || !activityDecideVideoDone) {
      return;
    }
    if (!activityDecideResponseReady) {
      return;
    }
    setActivityDecideResult(activityDecidePendingResult);
    setActivityDecideRadius(activityDecidePendingRadius);
    setIsActivityDecideRevealing(false);
    setIsActivityDecideRolling(false);
    const audio = new Audio(helpDecideSfxUrl);
    audio.play().catch(() => {});
  }, [
    activityDecidePendingRadius,
    activityDecidePendingResult,
    activityDecideResponseReady,
    activityDecideVideoDone,
    helpDecideSfxUrl,
    isActivityDecideRevealing,
  ]);

  const handleCheckInSearch = () => {
    if (!checkInSearchQuery.trim()) {
      setCheckInSearchError(false);
      return;
    }
    setCheckInSearchError(false);
  };

  const openEditCheckIn = (entry) => {
    const parsed = parseCheckInDate(entry.visited_at);
    const dateValue = parseDate(toLocalDateString(parsed));
    setEditingCheckIn(entry);
    setManualDate(dateValue);
    setManualTime(new Time(parsed.getHours(), parsed.getMinutes()));
    setLocationQuery(entry.location_label || "");
    setLocationResults([]);
    setSelectedLocation({
      id: entry.id,
      name: entry.location_name || entry.location_label,
      formatted: entry.location_label,
      lat: entry.latitude,
      lon: entry.longitude,
    });
    setIsManualCheckInOpen(true);
  };

  const handleDeleteCheckIn = async (entry) => {
    setIsDeletingCheckIn(true);
    try {
      await deleteCheckIn(entry.id);
      setCheckInPage(1);
      setCheckInRefreshKey((prev) => prev + 1);
      addToast({
        title: "Check in deleted",
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      addToast({
        title: "Unable to delete check in",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsDeletingCheckIn(false);
    }
  };

  const confirmDeleteCheckIn = async () => {
    if (!deleteCheckInTarget) {
      return;
    }
    await handleDeleteCheckIn(deleteCheckInTarget);
    setDeleteCheckInTarget(null);
  };

  const handleFoodVisitCommentAdd = async (visitId) => {
    const draft = foodVisitCommentDraftRef.current[visitId] || "";
    const trimmed = draft.trim();
    const visit = foodVisitDetail;
    if (!trimmed || !visit) {
      return;
    }
    setIsFoodVisitCommentSaving(true);
    try {
      const created = await createFoodVisitComment(
        visit.food_place_id,
        visitId,
        { body: trimmed },
      );
      setFoodVisitComments((prev) => {
        const current = prev[visitId] || [];
        return { ...prev, [visitId]: [created, ...current] };
      });
      foodVisitCommentDraftRef.current[visitId] = "";
      setFoodVisitCommentInputKey((prev) => prev + 1);
    } catch (error) {
      addToast({
        title: "Unable to post comment",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsFoodVisitCommentSaving(false);
    }
  };

  const handleFoodVisitDelete = async (visit) => {
    if (!visit?.food_place_id) {
      return;
    }
    setIsDeletingFoodVisit(true);
    try {
      await deleteFoodVisit(visit.food_place_id, visit.id);
      setFoodVisitRefreshKey((prev) => prev + 1);
      setFoodPlaceDetailRefreshKey((prev) => prev + 1);
      addToast({
        title: "Food visit deleted",
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      addToast({
        title: "Unable to delete visit",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsDeletingFoodVisit(false);
    }
  };

  const confirmDeleteFoodVisit = async () => {
    if (!foodVisitDeleteTarget) {
      return;
    }
    await handleFoodVisitDelete(foodVisitDeleteTarget);
    setFoodVisitDeleteTarget(null);
  };

  const handleFoodPlaceDelete = async (place) => {
    if (!place?.id) {
      return;
    }
    setIsDeletingFoodPlace(true);
    try {
      await deleteFoodPlace(place.id);
      setFoodRefreshKey((prev) => prev + 1);
      setFoodPlaceDetailRefreshKey((prev) => prev + 1);
      addToast({
        title: "Food place deleted",
        color: "success",
        timeout: 2000,
      });
      navigate("/food");
    } catch (error) {
      addToast({
        title: "Unable to delete food place",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsDeletingFoodPlace(false);
    }
  };

  const confirmDeleteFoodPlace = async () => {
    if (!foodPlaceDeleteTarget) {
      return;
    }
    await handleFoodPlaceDelete(foodPlaceDeleteTarget);
    setFoodPlaceDeleteTarget(null);
    setFoodPlaceDeleteConfirmName("");
  };

  const handleHelpDecideLocationToggle = async (enabled) => {
    setHelpDecideLocationEnabled(enabled);
    if (!enabled) {
      setHelpDecideLocation(null);
      return;
    }
    if (!navigator.geolocation) {
      addToast({
        title: "Location unavailable",
        description: "Enable location services to use this feature.",
        color: "warning",
        timeout: 3000,
      });
      setHelpDecideLocationEnabled(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setHelpDecideLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setHelpDecideLocationEnabled(false);
        setHelpDecideLocation(null);
        addToast({
          title: "Location denied",
          description: "Allow location access to filter nearby places.",
          color: "warning",
          timeout: 3000,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleActivityDecideLocationToggle = async (enabled) => {
    setActivityDecideLocationEnabled(enabled);
    if (!enabled) {
      setActivityDecideLocation(null);
      return;
    }
    if (!navigator.geolocation) {
      addToast({
        title: "Location unavailable",
        description: "Enable location services to use this feature.",
        color: "warning",
        timeout: 3000,
      });
      setActivityDecideLocationEnabled(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setActivityDecideLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setActivityDecideLocationEnabled(false);
        setActivityDecideLocation(null);
        addToast({
          title: "Location denied",
          description: "Allow location access to filter nearby activities.",
          color: "warning",
          timeout: 3000,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleFoodVisitCommentDelete = async (comment) => {
    const visit = foodVisitDetail;
    if (!comment || !visit) {
      return;
    }
    setIsDeletingFoodVisitComment(true);
    try {
      await deleteFoodVisitComment(visit.food_place_id, visit.id, comment.id);
      setFoodVisitComments((prev) => {
        const current = prev[visit.id] || [];
        return {
          ...prev,
          [visit.id]: current.filter((entry) => entry.id !== comment.id),
        };
      });
      addToast({
        title: "Comment deleted",
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      addToast({
        title: "Unable to delete comment",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsDeletingFoodVisitComment(false);
    }
  };

  const confirmDeleteFoodVisitComment = async () => {
    if (!foodVisitCommentDeleteTarget) {
      return;
    }
    await handleFoodVisitCommentDelete(foodVisitCommentDeleteTarget);
    setFoodVisitCommentDeleteTarget(null);
  };

  return (
    <AppShell
      appStyle={appStyle}
      isAuthenticated={isAuthenticated}
      isScrolled={isScrolled}
      headerTitleClass={headerTitleClass}
      isDetailPage={isFoodPlaceDetail || isActivityDetail}
      navigate={navigate}
      currentPath={location.pathname}
      profile={profile}
      resolveAvatarUrl={resolveAvatarUrl}
      handleLogout={handleLogout}
      accentColor={accentColor}
      setIsFoodVisitSelectOpen={setIsFoodVisitSelectOpen}
      openFoodPlaceModal={openFoodPlaceModal}
      handleQuickCheckIn={handleQuickCheckIn}
      openManualCheckIn={openManualCheckIn}
      openActivityModal={openActivityModal}
    >
      {!isAuthenticated ? (
        <AuthScreen
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          setPin={setPin}
          setOtpCode={setOtpCode}
          setPinVerified={setPinVerified}
          setPinError={setPinError}
          setStatusMessage={setStatusMessage}
          pinInputRef={pinInputRef}
          pinVerified={pinVerified}
          pinShake={pinShake}
          setPinShake={setPinShake}
          pin={pin}
          handlePinChange={handlePinChange}
          handleVerifyPin={handleVerifyPin}
          isPinLoading={isPinLoading}
          pinError={pinError}
          otpShake={otpShake}
          setOtpShake={setOtpShake}
          otpCode={otpCode}
          handleOtpChange={handleOtpChange}
          handleVerifyOtp={handleVerifyOtp}
          isOtpLoading={isOtpLoading}
          otpError={otpError}
          handleResendOtp={handleResendOtp}
          statusMessage={statusMessage}
          resolveAvatarUrl={resolveAvatarUrl}
          PIN_LENGTH={PIN_LENGTH}
        />
      ) : (
        <main className="px-4 pb-28 pt-6">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  accentColor={accentColor}
                  isDarkMode={isDarkMode}
                  buildAccentLeakGradient={buildAccentLeakGradient}
                  buildAccentKpiGradient={buildAccentKpiGradient}
                  foodStats={foodStats}
                  activityStats={activityStats}
                  checkInStats={checkInStats}
                  formatCheckInDate={formatCheckInDate}
                  resolveHeaderUrl={resolveHeaderUrl}
                  cuisineHighlights={cuisineHighlights}
                  timelineEntries={homeTimelineEntries}
                  isTimelineLoading={isHomeTimelineLoading}
                  heroSlides={homeHeroEntries}
                  isHeroLoading={isHomeHeroLoading}
                />
              }
            />
            <Route
              path="/food/place/:placeId"
              element={
                <FoodDetailPage
                  accentColor={accentColor}
                  isDarkMode={isDarkMode}
                  isScrolled={isScrolled}
                  foodVisitRefreshKey={foodVisitRefreshKey}
                  foodPlaceDetailRefreshKey={foodPlaceDetailRefreshKey}
                  openFoodVisitModal={openFoodVisitModal}
                  openFoodPlaceEdit={openFoodPlaceEdit}
                  openFoodVisitEdit={openFoodVisitEdit}
                  openFoodVisitDetail={openFoodVisitDetail}
                  onVisitDeleteRequest={setFoodVisitDeleteTarget}
                  renderStarRow={renderStarRow}
                  renderStarRowCompact={renderStarRowCompact}
                  resolveHeaderUrl={resolveHeaderUrl}
                  buildAccentLeakGradient={buildAccentLeakGradient}
                  buildAccentKpiGradient={buildAccentKpiGradient}
                  formatRelativeTime={formatRelativeTime}
                  formatCheckInDate={formatCheckInDate}
                  formatMonthYear={formatMonthYear}
                  parseCheckInDate={parseCheckInDate}
                  FOOD_VISIT_ITEMS_PER_PAGE={FOOD_VISIT_ITEMS_PER_PAGE}
                  QuestionMarkIcon={QuestionMarkIcon}
                  setFoodPlaceDeleteTarget={setFoodPlaceDeleteTarget}
                  fetchFoodPlace={fetchFoodPlace}
                  fetchFoodVisits={fetchFoodVisits}
                />
              }
            />
            <Route
              path="/activities/exercise/:activityId"
              element={
                <ActivityDetailPage
                  accentColor={accentColor}
                  isDarkMode={isDarkMode}
                  isScrolled={isScrolled}
                  activityRefreshKey={activityRefreshKey}
                  openActivityModal={openActivityModal}
                  openActivityVisitModal={openActivityVisitModal}
                  openActivityVisitEdit={openActivityVisitEdit}
                  openActivityVisitDetail={setActivityVisitDetail}
                  onActivityVisitDeleteRequest={setActivityVisitDeleteTarget}
                  setActivityDeleteTarget={setActivityDeleteTarget}
                  setActivityDeleteConfirmName={setActivityDeleteConfirmName}
                  setActivityDeleteHasVisits={setActivityDeleteHasVisits}
                  resolveHeaderUrl={resolveHeaderUrl}
                  formatCheckInDate={formatCheckInDate}
                  formatRelativeTime={formatRelativeTime}
                  ACTIVITY_EXERCISE_CATEGORIES={ACTIVITY_EXERCISE_CATEGORIES}
                  ACTIVITY_BUCKET_CATEGORIES={ACTIVITY_BUCKET_CATEGORIES}
                  ACTIVITY_DIFFICULTY_OPTIONS={ACTIVITY_DIFFICULTY_OPTIONS}
                  ACTIVITY_VISIT_ITEMS_PER_PAGE={ACTIVITY_VISIT_ITEMS_PER_PAGE}
                />
              }
            />
            <Route
              path="/activities/bucketlist/:activityId"
              element={
                <ActivityDetailPage
                  accentColor={accentColor}
                  isDarkMode={isDarkMode}
                  isScrolled={isScrolled}
                  activityRefreshKey={activityRefreshKey}
                  openActivityModal={openActivityModal}
                  openActivityVisitModal={openActivityVisitModal}
                  openActivityVisitEdit={openActivityVisitEdit}
                  openActivityVisitDetail={setActivityVisitDetail}
                  onActivityVisitDeleteRequest={setActivityVisitDeleteTarget}
                  setActivityDeleteTarget={setActivityDeleteTarget}
                  setActivityDeleteConfirmName={setActivityDeleteConfirmName}
                  setActivityDeleteHasVisits={setActivityDeleteHasVisits}
                  resolveHeaderUrl={resolveHeaderUrl}
                  formatCheckInDate={formatCheckInDate}
                  formatRelativeTime={formatRelativeTime}
                  ACTIVITY_EXERCISE_CATEGORIES={ACTIVITY_EXERCISE_CATEGORIES}
                  ACTIVITY_BUCKET_CATEGORIES={ACTIVITY_BUCKET_CATEGORIES}
                  ACTIVITY_DIFFICULTY_OPTIONS={ACTIVITY_DIFFICULTY_OPTIONS}
                  ACTIVITY_VISIT_ITEMS_PER_PAGE={ACTIVITY_VISIT_ITEMS_PER_PAGE}
                />
              }
            />
            <Route
              path="/food"
              element={
                <FoodPage
                  featuredFoodHeroUrl={featuredFoodHeroUrl}
                  featuredFood={featuredFood}
                  resolveHeaderUrl={resolveHeaderUrl}
                  buildAccentLeakGradient={buildAccentLeakGradient}
                  accentColor={accentColor}
                  isDarkMode={isDarkMode}
                  openFoodPlaceModal={openFoodPlaceModal}
                  setIsFoodVisitSelectOpen={setIsFoodVisitSelectOpen}
                  setIsHelpDecideOpen={setIsHelpDecideOpen}
                  foodStats={foodStats}
                  navigate={navigate}
                  foodSearchQuery={foodSearchQuery}
                  setFoodSearchQuery={setFoodSearchQuery}
                  foodSearchError={foodSearchError}
                  setFoodSearchError={setFoodSearchError}
                  handleFoodSearch={handleFoodSearch}
                  foodFilterStatus={foodFilterStatus}
                  setFoodFilterStatus={setFoodFilterStatus}
                  foodCategoryFilter={foodCategoryFilter}
                  setFoodCategoryFilter={setFoodCategoryFilter}
                  FOOD_CUISINE_OPTIONS={FOOD_CUISINE_OPTIONS}
                  foodSortName={foodSortName}
                  setFoodSortName={setFoodSortName}
                  foodSortRating={foodSortRating}
                  setFoodSortRating={setFoodSortRating}
                  isFoodLoading={isFoodLoading}
                  foodPlaces={foodPlaces}
                  renderStarRowCompact={renderStarRowCompact}
                  openFoodPlaceEdit={openFoodPlaceEdit}
                  openFoodVisitModal={openFoodVisitModal}
                  setFoodPlaceDeleteTarget={setFoodPlaceDeleteTarget}
                  foodPage={foodPage}
                  foodTotal={foodTotal}
                  FOOD_ITEMS_PER_PAGE={FOOD_ITEMS_PER_PAGE}
                  setFoodPage={setFoodPage}
                />
              }
            />
            <Route
              path="/activities"
              element={
                <ActivityPage
                  latestActivityHeroUrl={latestActivityHeroUrl}
                  accentColor={accentColor}
                  isDarkMode={isDarkMode}
                  latestDoneActivity={latestDoneActivity}
                  formatCheckInDate={formatCheckInDate}
                  openActivityModal={openActivityModal}
                  openActivityVisitSelect={openActivityVisitSelect}
                  setIsActivityDecideOpen={setIsActivityDecideOpen}
                  activityKpis={activityKpis}
                  activityTopAllTime={activityTopAllTime}
                  activityTopYear={activityTopYear}
                  navigate={navigate}
                  resolveHeaderUrl={resolveHeaderUrl}
                  activityTab={activityTab}
                  setActivityTab={setActivityTab}
                  activitySearchQuery={activitySearchQuery}
                  setActivitySearchQuery={setActivitySearchQuery}
                  activityExerciseStatus={activityExerciseStatus}
                  setActivityExerciseStatus={setActivityExerciseStatus}
                  activityExerciseCategory={activityExerciseCategory}
                  setActivityExerciseCategory={setActivityExerciseCategory}
                  activityExerciseSort={activityExerciseSort}
                  setActivityExerciseSort={setActivityExerciseSort}
                  activityExerciseDifficulty={activityExerciseDifficulty}
                  setActivityExerciseDifficulty={setActivityExerciseDifficulty}
                  activityBucketStatus={activityBucketStatus}
                  setActivityBucketStatus={setActivityBucketStatus}
                  activityBucketCategory={activityBucketCategory}
                  setActivityBucketCategory={setActivityBucketCategory}
                  activityBucketSort={activityBucketSort}
                  setActivityBucketSort={setActivityBucketSort}
                  ACTIVITY_EXERCISE_CATEGORIES={ACTIVITY_EXERCISE_CATEGORIES}
                  ACTIVITY_DIFFICULTY_OPTIONS={ACTIVITY_DIFFICULTY_OPTIONS}
                  ACTIVITY_BUCKET_CATEGORIES={ACTIVITY_BUCKET_CATEGORIES}
                  isActivitiesLoading={isActivitiesLoading}
                  pagedExerciseActivities={pagedExerciseActivities}
                  pagedBucketActivities={pagedBucketActivities}
                  openActivityVisitModal={openActivityVisitModal}
                  fetchActivityVisitCount={fetchActivityVisitCount}
                  setActivityDeleteHasVisits={setActivityDeleteHasVisits}
                  setActivityDeleteConfirmName={setActivityDeleteConfirmName}
                  setActivityDeleteTarget={setActivityDeleteTarget}
                  activityPage={activityPage}
                  activityTotalPages={activityTotalPages}
                  setActivityPage={setActivityPage}
                  filteredExerciseActivities={filteredExerciseActivities}
                  filteredBucketActivities={filteredBucketActivities}
                />
              }
            />
            <Route
              path="/check-in"
              element={
                <CheckInPage
                  mapContainerRef={mapContainerRef}
                  accentColor={accentColor}
                  isDarkMode={isDarkMode}
                  buildAccentLeakGradient={buildAccentLeakGradient}
                  formatMonthYear={formatMonthYear}
                  checkInStats={checkInStats}
                  isCheckInMenuOpen={isCheckInMenuOpen}
                  setIsCheckInMenuOpen={setIsCheckInMenuOpen}
                  handleQuickCheckIn={handleQuickCheckIn}
                  openManualCheckIn={openManualCheckIn}
                  isQuickCheckInSaving={isQuickCheckInSaving}
                  topAllTimeMapContainerRef={topAllTimeMapContainerRef}
                  topYearMapContainerRef={topYearMapContainerRef}
                  latestTrip={latestTrip}
                  tripImages={tripImages}
                  openTripModal={openTripModal}
                  checkInTab={checkInTab}
                  setCheckInTab={setCheckInTab}
                  checkInSearchQuery={checkInSearchQuery}
                  setCheckInSearchQuery={setCheckInSearchQuery}
                  checkInSearchError={checkInSearchError}
                  setCheckInSearchError={setCheckInSearchError}
                  handleCheckInSearch={handleCheckInSearch}
                  checkInYear={checkInYear}
                  setCheckInYear={setCheckInYear}
                  checkInMonth={checkInMonth}
                  setCheckInMonth={setCheckInMonth}
                  checkInYears={checkInYears}
                  availableMonths={availableMonths}
                  sortedCheckIns={sortedCheckIns}
                  parseCheckInDate={parseCheckInDate}
                  openEditCheckIn={openEditCheckIn}
                  setDeleteCheckInTarget={setDeleteCheckInTarget}
                  checkInPage={checkInPage}
                  checkInTotal={checkInTotal}
                  CHECK_IN_ITEMS_PER_PAGE={CHECK_IN_ITEMS_PER_PAGE}
                  setCheckInPage={setCheckInPage}
                  tripEntries={tripEntries}
                  formatCheckInDate={formatCheckInDate}
                />
              }
            />

            <Route
              path="/profile"
              element={
                <ProfilePage
                  profile={profile}
                  isDarkMode={isDarkMode}
                  ACCENT_COLORS={ACCENT_COLORS}
                  resolveHeaderUrl={resolveHeaderUrl}
                  resolveAvatarUrl={resolveAvatarUrl}
                  buildAccentLeakGradient={buildAccentLeakGradient}
                  formatBirthday={formatBirthday}
                  formatCheckInDate={formatCheckInDate}
                  formatRelativeTime={formatRelativeTime}
                  openEditProfile={openEditProfile}
                  setIsPinModalOpen={setIsPinModalOpen}
                  handleRevokeDevice={handleRevokeDevice}
                  getDeviceIcon={getDeviceIcon}
                  activityLog={activityLog}
                  isActivityLogLoading={isActivityLogLoading}
                />
              }
            />
            <Route
              path="/journal"
              element={
                <JournalPage
                  isAuthenticated={isAuthenticated}
                  fetchJournalEntries={fetchJournalEntries}
                  deleteJournalEntry={deleteJournalEntry}
                  searchFoodVisits={searchFoodVisits}
                  searchActivityVisits={searchActivityVisits}
                  formatCheckInDate={formatCheckInDate}
                  parseCheckInDate={parseCheckInDate}
                  formatRelativeTime={formatRelativeTime}
                  resolveAvatarUrl={resolveAvatarUrl}
                  resolveHeaderUrl={resolveHeaderUrl}
                  buildAccentLeakGradient={buildAccentLeakGradient}
                  accentColor={accentColor}
                  isDarkMode={isDarkMode}
                  MONTH_LABELS={MONTH_LABELS}
                  getLocalTimeZone={getLocalTimeZone}
                  today={today}
                  parseDate={parseDate}
                  toLocalDateString={toLocalDateString}
                  readFileAsDataUrl={readFileAsDataUrl}
                  compressImageDataUrl={compressImageDataUrl}
                  createJournalEntry={createJournalEntry}
                  updateJournalEntry={updateJournalEntry}
                  profile={profile}
                  modalMotionProps={modalMotionProps}
                />
              }
            />
            <Route
              path="/tierlist"
              element={
                <TierlistPage
                  accentColor={accentColor}
                  isDarkMode={isDarkMode}
                  buildAccentLeakGradient={buildAccentLeakGradient}
                  resolveHeaderUrl={resolveHeaderUrl}
                  formatCheckInDate={formatCheckInDate}
                  pickRandomItems={pickRandomItems}
                  openTierlistModal={openTierlistModal}
                  openTierlistEdit={openTierlistEdit}
                  setTierlistDeleteTarget={setTierlistDeleteTarget}
                  setSelectedTierlist={setSelectedTierlist}
                  tierlists={tierlists}
                  isTierlistsLoading={isTierlistsLoading}
                  tierlistPage={tierlistPage}
                  setTierlistPage={setTierlistPage}
                  TIERLIST_ITEMS_PER_PAGE={TIERLIST_ITEMS_PER_PAGE}
                />
              }
            />
            <Route
              path="*"
              element={
                <section className="rounded-3xl bg-white/80 p-6 shadow-xl dark:bg-neutral-900/70">
                  <h2 className="text-2xl font-semibold">Not found</h2>
                  <p className="mt-2 text-neutral-700 dark:text-neutral-300">
                    That page does not exist.
                  </p>
                </section>
              }
            />
          </Routes>
        </main>
      )}
      <CheckInModals
        isTripModalOpen={isTripModalOpen}
        setIsTripModalOpen={setIsTripModalOpen}
        selectedTrip={selectedTrip}
        setSelectedTrip={setSelectedTrip}
        modalMotionProps={modalMotionProps}
        tripImages={tripImages}
        accentColor={accentColor}
        isDarkMode={isDarkMode}
        isTripLoading={isTripLoading}
        selectedTripCheckInGroups={selectedTripCheckInGroups}
        buildAccentLeakGradient={buildAccentLeakGradient}
        isManualCheckInOpen={isManualCheckInOpen}
        setIsManualCheckInOpen={setIsManualCheckInOpen}
        manualDate={manualDate}
        setManualDate={setManualDate}
        manualTime={manualTime}
        setManualTime={setManualTime}
        locationQuery={locationQuery}
        setLocationQuery={setLocationQuery}
        fetchLocationSearch={fetchLocationSearch}
        isSearchingLocation={isSearchingLocation}
        isLocating={isLocating}
        handleLocateMe={handleLocateMe}
        locationResults={locationResults}
        isLocationCollapsed={isLocationCollapsed}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        setIsLocationCollapsed={setIsLocationCollapsed}
        handleManualCheckInSave={handleManualCheckInSave}
        isManualCheckInSaving={isManualCheckInSaving}
        getLocalTimeZone={getLocalTimeZone}
        today={today}
        deleteCheckInTarget={deleteCheckInTarget}
        setDeleteCheckInTarget={setDeleteCheckInTarget}
        confirmDeleteCheckIn={confirmDeleteCheckIn}
        isDeletingCheckIn={isDeletingCheckIn}
      />
      <FoodModals
        isFoodPlaceOpen={isFoodPlaceOpen}
        setIsFoodPlaceOpen={setIsFoodPlaceOpen}
        modalMotionProps={modalMotionProps}
        foodEditingPlace={foodEditingPlace}
        setFoodEditingPlace={setFoodEditingPlace}
        foodHeaderPreview={foodHeaderPreview}
        isFoodHeaderCropSaving={isFoodHeaderCropSaving}
        accentColor={accentColor}
        isDarkMode={isDarkMode}
        foodName={foodName}
        foodSelectedLocation={foodSelectedLocation}
        foodCuisineSubcategory={foodCuisineSubcategory}
        foodCuisineCategory={foodCuisineCategory}
        foodOpen={foodOpen}
        setFoodHeaderPreview={setFoodHeaderPreview}
        setFoodHeaderData={setFoodHeaderData}
        setFoodHeaderChanged={setFoodHeaderChanged}
        foodHeaderInputRef={foodHeaderInputRef}
        handleFoodHeaderChange={handleFoodHeaderChange}
        foodNameExists={foodNameExists}
        setFoodName={setFoodName}
        setFoodNameExists={setFoodNameExists}
        isDuplicateNameInList={isDuplicateNameInList}
        foodPlaces={foodPlaces}
        foodLocationQuery={foodLocationQuery}
        setFoodLocationQuery={setFoodLocationQuery}
        fetchFoodLocationSearch={fetchFoodLocationSearch}
        isFoodSearching={isFoodSearching}
        foodLocationResults={foodLocationResults}
        isFoodLocationCollapsed={isFoodLocationCollapsed}
        setIsFoodLocationCollapsed={setIsFoodLocationCollapsed}
        setFoodSelectedLocation={setFoodSelectedLocation}
        handleFoodLocate={handleFoodLocate}
        isFoodLocating={isFoodLocating}
        setFoodCuisineCategory={setFoodCuisineCategory}
        setFoodCuisineSubcategory={setFoodCuisineSubcategory}
        foodCuisineOptions={FOOD_CUISINE_OPTIONS}
        foodComments={foodComments}
        setFoodComments={setFoodComments}
        setFoodOpen={setFoodOpen}
        handleFoodPlaceSave={handleFoodPlaceSave}
        isFoodSaving={isFoodSaving}
        isFoodVisitSelectOpen={isFoodVisitSelectOpen}
        setIsFoodVisitSelectOpen={setIsFoodVisitSelectOpen}
        foodVisitPlaceSelected={foodVisitPlaceSelected}
        setFoodVisitPlaceSelected={setFoodVisitPlaceSelected}
        foodVisitPlaceSearchQuery={foodVisitPlaceSearchQuery}
        setFoodVisitPlaceSearchQuery={setFoodVisitPlaceSearchQuery}
        foodVisitPlaceSearchResults={foodVisitPlaceSearchResults}
        setFoodVisitPlaceSearchResults={setFoodVisitPlaceSearchResults}
        handleFoodVisitPlaceSearch={handleFoodVisitPlaceSearch}
        isFoodVisitPlaceSearching={isFoodVisitPlaceSearching}
        openFoodVisitModal={openFoodVisitModal}
        buildAccentLeakGradient={buildAccentLeakGradient}
        resolveHeaderUrl={resolveHeaderUrl}
        isHelpDecideOpen={isHelpDecideOpen}
        setIsHelpDecideOpen={setIsHelpDecideOpen}
        helpDecideResult={helpDecideResult}
        setHelpDecideResult={setHelpDecideResult}
        helpDecideRadius={helpDecideRadius}
        setHelpDecideRadius={setHelpDecideRadius}
        helpDecidePendingResult={helpDecidePendingResult}
        setHelpDecidePendingResult={setHelpDecidePendingResult}
        helpDecidePendingRadius={helpDecidePendingRadius}
        setHelpDecidePendingRadius={setHelpDecidePendingRadius}
        helpDecideResponseReady={helpDecideResponseReady}
        setHelpDecideResponseReady={setHelpDecideResponseReady}
        helpDecideVideoDone={helpDecideVideoDone}
        setHelpDecideVideoDone={setHelpDecideVideoDone}
        isHelpDecideRolling={isHelpDecideRolling}
        setIsHelpDecideRolling={setIsHelpDecideRolling}
        isHelpDecideRevealing={isHelpDecideRevealing}
        setIsHelpDecideRevealing={setIsHelpDecideRevealing}
        helpDecideVideoKey={helpDecideVideoKey}
        helpDecideVideoRef={helpDecideVideoRef}
        helpDecideVideoUrl={helpDecideVideoUrl}
        handleHelpDecideRoll={handleHelpDecideRoll}
        helpDecideLocationEnabled={helpDecideLocationEnabled}
        handleHelpDecideLocationToggle={handleHelpDecideLocationToggle}
        helpDecideCuisineSelection={helpDecideCuisineSelection}
        setHelpDecideCuisineSelection={setHelpDecideCuisineSelection}
        navigate={navigate}
        isFoodVisitOpen={isFoodVisitOpen}
        setIsFoodVisitOpen={setIsFoodVisitOpen}
        foodEditingVisit={foodEditingVisit}
        foodVisitPhotoPreview={foodVisitPhotoPreview}
        isFoodVisitCropSaving={isFoodVisitCropSaving}
        foodVisitPlace={foodVisitPlace}
        foodVisitInputRef={foodVisitInputRef}
        handleFoodVisitPhotoChange={handleFoodVisitPhotoChange}
        setFoodVisitPhotoPreview={setFoodVisitPhotoPreview}
        setFoodVisitPhotoData={setFoodVisitPhotoData}
        setFoodVisitPhotoChanged={setFoodVisitPhotoChanged}
        foodVisitDate={foodVisitDate}
        setFoodVisitDate={setFoodVisitDate}
        foodVisitDishes={foodVisitDishes}
        setFoodVisitDishes={setFoodVisitDishes}
        handleFoodVisitDishNameChange={handleFoodVisitDishNameChange}
        handleFoodVisitDishDelete={handleFoodVisitDishDelete}
        handleFoodVisitDishRatingChange={handleFoodVisitDishRatingChange}
        renderStarRow={renderStarRow}
        foodVisitOverallRating={foodVisitOverallRating}
        setFoodVisitOverallRating={setFoodVisitOverallRating}
        foodVisitAgain={foodVisitAgain}
        setFoodVisitAgain={setFoodVisitAgain}
        foodVisitDescription={foodVisitDescription}
        setFoodVisitDescription={setFoodVisitDescription}
        handleFoodVisitSave={handleFoodVisitSave}
        isFoodVisitSaving={isFoodVisitSaving}
        foodVisitDetail={foodVisitDetail}
        setFoodVisitDetail={setFoodVisitDetail}
        resolveAvatarUrl={resolveAvatarUrl}
        formatCheckInDate={formatCheckInDate}
        formatRelativeTime={formatRelativeTime}
        openFoodVisitEdit={openFoodVisitEdit}
        foodVisitComments={foodVisitComments}
        isFoodVisitCommentsLoading={isFoodVisitCommentsLoading}
        profile={profile}
        setFoodVisitCommentDeleteTarget={setFoodVisitCommentDeleteTarget}
        handleFoodVisitCommentAdd={handleFoodVisitCommentAdd}
        foodVisitCommentInputKey={foodVisitCommentInputKey}
        foodVisitCommentDraftRef={foodVisitCommentDraftRef}
        isFoodVisitCommentSaving={isFoodVisitCommentSaving}
        QuestionMarkIcon={QuestionMarkIcon}
        foodVisitCommentDeleteTarget={foodVisitCommentDeleteTarget}
        confirmDeleteFoodVisitComment={confirmDeleteFoodVisitComment}
        isDeletingFoodVisitComment={isDeletingFoodVisitComment}
        isFoodHeaderCropOpen={isFoodHeaderCropOpen}
        setIsFoodHeaderCropOpen={setIsFoodHeaderCropOpen}
        foodHeaderCropImageSrc={foodHeaderCropImageSrc}
        foodHeaderCrop={foodHeaderCrop}
        setFoodHeaderCrop={setFoodHeaderCrop}
        foodHeaderZoom={foodHeaderZoom}
        setFoodHeaderZoom={setFoodHeaderZoom}
        setFoodHeaderCroppedAreaPixels={setFoodHeaderCroppedAreaPixels}
        handleFoodHeaderCropConfirm={handleFoodHeaderCropConfirm}
        isFoodVisitCropOpen={isFoodVisitCropOpen}
        setIsFoodVisitCropOpen={setIsFoodVisitCropOpen}
        foodVisitCropImageSrc={foodVisitCropImageSrc}
        foodVisitCrop={foodVisitCrop}
        setFoodVisitCrop={setFoodVisitCrop}
        foodVisitZoom={foodVisitZoom}
        setFoodVisitZoom={setFoodVisitZoom}
        setFoodVisitCroppedAreaPixels={setFoodVisitCroppedAreaPixels}
        handleFoodVisitCropConfirm={handleFoodVisitCropConfirm}
      />
      <ActivityModals
        isActivityModalOpen={isActivityModalOpen}
        setIsActivityModalOpen={setIsActivityModalOpen}
        modalMotionProps={modalMotionProps}
        activityEditing={activityEditing}
        setActivityEditing={setActivityEditing}
        activityImagePreview={activityImagePreview}
        isActivityCropSaving={isActivityCropSaving}
        accentColor={accentColor}
        isDarkMode={isDarkMode}
        activityName={activityName}
        activityAddress={activityAddress}
        activityType={activityType}
        activityImageInputRef={activityImageInputRef}
        handleActivityImageChange={handleActivityImageChange}
        setActivityImagePreview={setActivityImagePreview}
        setActivityImageData={setActivityImageData}
        setActivityImageChanged={setActivityImageChanged}
        setActivityType={setActivityType}
        setActivityBucketFormCategory={setActivityBucketFormCategory}
        setActivityDifficulty={setActivityDifficulty}
        setActivityCategory={setActivityCategory}
        activityNameExists={activityNameExists}
        setActivityName={setActivityName}
        setActivityNameExists={setActivityNameExists}
        isDuplicateNameInList={isDuplicateNameInList}
        activities={activities}
        activityLocationQuery={activityLocationQuery}
        setActivityLocationQuery={setActivityLocationQuery}
        fetchActivityLocationSearch={fetchActivityLocationSearch}
        isActivitySearchingLocation={isActivitySearchingLocation}
        activityLocationResults={activityLocationResults}
        activitySelectedLocation={activitySelectedLocation}
        isActivityLocationCollapsed={isActivityLocationCollapsed}
        setActivityAddress={setActivityAddress}
        setActivitySelectedLocation={setActivitySelectedLocation}
        setIsActivityLocationCollapsed={setIsActivityLocationCollapsed}
        activityCategory={activityCategory}
        activityDifficulty={activityDifficulty}
        activityBucketFormCategory={activityBucketFormCategory}
        activityDescription={activityDescription}
        setActivityDescription={setActivityDescription}
        handleActivitySave={handleActivitySave}
        isActivitySaving={isActivitySaving}
        ACTIVITY_EXERCISE_CATEGORIES={ACTIVITY_EXERCISE_CATEGORIES}
        ACTIVITY_DIFFICULTY_OPTIONS={ACTIVITY_DIFFICULTY_OPTIONS}
        ACTIVITY_BUCKET_CATEGORIES={ACTIVITY_BUCKET_CATEGORIES}
        isActivityVisitOpen={isActivityVisitOpen}
        setIsActivityVisitOpen={setIsActivityVisitOpen}
        activityVisitEditing={activityVisitEditing}
        activityVisitPhotoPreview={activityVisitPhotoPreview}
        isActivityVisitCropSaving={isActivityVisitCropSaving}
        activityVisitTitle={activityVisitTitle}
        setActivityVisitTitle={setActivityVisitTitle}
        activityVisitActivity={activityVisitActivity}
        activityVisitInputRef={activityVisitInputRef}
        handleActivityVisitPhotoChange={handleActivityVisitPhotoChange}
        setActivityVisitPhotoPreview={setActivityVisitPhotoPreview}
        setActivityVisitPhotoData={setActivityVisitPhotoData}
        setActivityVisitPhotoChanged={setActivityVisitPhotoChanged}
        activityVisitDate={activityVisitDate}
        setActivityVisitDate={setActivityVisitDate}
        activityVisitDistance={activityVisitDistance}
        setActivityVisitDistance={setActivityVisitDistance}
        activityVisitRating={activityVisitRating}
        setActivityVisitRating={setActivityVisitRating}
        activityVisitDescription={activityVisitDescription}
        setActivityVisitDescription={setActivityVisitDescription}
        handleActivityVisitSave={handleActivityVisitSave}
        isActivityVisitSaving={isActivityVisitSaving}
        isActivityVisitSelectOpen={isActivityVisitSelectOpen}
        setIsActivityVisitSelectOpen={setIsActivityVisitSelectOpen}
        activityVisitSelected={activityVisitSelected}
        setActivityVisitSelected={setActivityVisitSelected}
        activityVisitSearchQuery={activityVisitSearchQuery}
        setActivityVisitSearchQuery={setActivityVisitSearchQuery}
        activityVisitSearchResults={activityVisitSearchResults}
        setActivityVisitSearchResults={setActivityVisitSearchResults}
        handleActivityVisitSearch={handleActivityVisitSearch}
        isActivityVisitSearching={isActivityVisitSearching}
        openActivityVisitModal={openActivityVisitModal}
        buildAccentLeakGradient={buildAccentLeakGradient}
        resolveHeaderUrl={resolveHeaderUrl}
        isActivityDecideOpen={isActivityDecideOpen}
        setIsActivityDecideOpen={setIsActivityDecideOpen}
        activityDecideResult={activityDecideResult}
        setActivityDecideResult={setActivityDecideResult}
        activityDecideRadius={activityDecideRadius}
        setActivityDecideRadius={setActivityDecideRadius}
        activityDecidePendingResult={activityDecidePendingResult}
        setActivityDecidePendingResult={setActivityDecidePendingResult}
        activityDecidePendingRadius={activityDecidePendingRadius}
        setActivityDecidePendingRadius={setActivityDecidePendingRadius}
        activityDecideResponseReady={activityDecideResponseReady}
        setActivityDecideResponseReady={setActivityDecideResponseReady}
        activityDecideVideoDone={activityDecideVideoDone}
        setActivityDecideVideoDone={setActivityDecideVideoDone}
        isActivityDecideRolling={isActivityDecideRolling}
        setIsActivityDecideRolling={setIsActivityDecideRolling}
        isActivityDecideRevealing={isActivityDecideRevealing}
        setIsActivityDecideRevealing={setIsActivityDecideRevealing}
        activityDecideVideoKey={activityDecideVideoKey}
        activityDecideVideoRef={activityDecideVideoRef}
        helpDecideVideoUrl={helpDecideVideoUrl}
        handleActivityDecideRoll={handleActivityDecideRoll}
        activityDecideLocationEnabled={activityDecideLocationEnabled}
        handleActivityDecideLocationToggle={handleActivityDecideLocationToggle}
        activityDecidePreference={activityDecidePreference}
        setActivityDecidePreference={setActivityDecidePreference}
        activityDecideCategorySelection={activityDecideCategorySelection}
        setActivityDecideCategorySelection={setActivityDecideCategorySelection}
        navigate={navigate}
        activityVisitDetail={activityVisitDetail}
        setActivityVisitDetail={setActivityVisitDetail}
        resolveAvatarUrl={resolveAvatarUrl}
        formatCheckInDate={formatCheckInDate}
        formatRelativeTime={formatRelativeTime}
        openActivityVisitEdit={openActivityVisitEdit}
        setActivityVisitDeleteTarget={setActivityVisitDeleteTarget}
        activityVisitComments={activityVisitComments}
        isActivityVisitCommentsLoading={isActivityVisitCommentsLoading}
        profile={profile}
        setActivityVisitCommentDeleteTarget={setActivityVisitCommentDeleteTarget}
        handleActivityVisitCommentAdd={handleActivityVisitCommentAdd}
        activityVisitCommentInputKey={activityVisitCommentInputKey}
        activityVisitCommentDraftRef={activityVisitCommentDraftRef}
        isActivityVisitCommentSaving={isActivityVisitCommentSaving}
        activityVisitCommentDeleteTarget={activityVisitCommentDeleteTarget}
        setActivityVisitCommentDeleteTarget={setActivityVisitCommentDeleteTarget}
        confirmDeleteActivityVisitComment={confirmDeleteActivityVisitComment}
        isDeletingActivityVisitComment={isDeletingActivityVisitComment}
        isActivityCropOpen={isActivityCropOpen}
        setIsActivityCropOpen={setIsActivityCropOpen}
        activityCropImageSrc={activityCropImageSrc}
        activityCrop={activityCrop}
        setActivityCrop={setActivityCrop}
        activityZoom={activityZoom}
        setActivityZoom={setActivityZoom}
        setActivityCroppedAreaPixels={setActivityCroppedAreaPixels}
        handleActivityCropConfirm={handleActivityCropConfirm}
        isActivityVisitCropOpen={isActivityVisitCropOpen}
        setIsActivityVisitCropOpen={setIsActivityVisitCropOpen}
        activityVisitCropImageSrc={activityVisitCropImageSrc}
        activityVisitCrop={activityVisitCrop}
        setActivityVisitCrop={setActivityVisitCrop}
        activityVisitZoom={activityVisitZoom}
        setActivityVisitZoom={setActivityVisitZoom}
        setActivityVisitCroppedAreaPixels={setActivityVisitCroppedAreaPixels}
        handleActivityVisitCropConfirm={handleActivityVisitCropConfirm}
      />

      <ProfileModals
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        modalMotionProps={modalMotionProps}
        editHeaderPreview={editHeaderPreview}
        editAccent={editAccent}
        isDarkMode={isDarkMode}
        editName={editName}
        profile={profile}
        editBirthday={editBirthday}
        editAvatarPreview={editAvatarPreview}
        headerInputRef={headerInputRef}
        avatarInputRef={avatarInputRef}
        ACCENT_COLORS={ACCENT_COLORS}
        formatBirthday={formatBirthday}
        setEditAccent={setEditAccent}
        setEditName={setEditName}
        parseDate={parseDate}
        setEditBirthday={setEditBirthday}
        handleAvatarChange={handleAvatarChange}
        handleHeaderChange={handleHeaderChange}
        handleProfileSave={handleProfileSave}
        isEditSaving={isEditSaving}
        buildAccentLeakGradient={buildAccentLeakGradient}
        setDeleteTarget={setDeleteTarget}
        isPinModalOpen={isPinModalOpen}
        setIsPinModalOpen={setIsPinModalOpen}
        pinStep={pinStep}
        setPinStep={setPinStep}
        currentPin={currentPin}
        setCurrentPin={setCurrentPin}
        currentPinError={currentPinError}
        setCurrentPinError={setCurrentPinError}
        currentPinShake={currentPinShake}
        setCurrentPinShake={setCurrentPinShake}
        newPin={newPin}
        setNewPin={setNewPin}
        newPinError={newPinError}
        setNewPinError={setNewPinError}
        newPinShake={newPinShake}
        setNewPinShake={setNewPinShake}
        confirmPin={confirmPin}
        setConfirmPin={setConfirmPin}
        confirmPinError={confirmPinError}
        setConfirmPinError={setConfirmPinError}
        confirmPinShake={confirmPinShake}
        setConfirmPinShake={setConfirmPinShake}
        PIN_LENGTH={PIN_LENGTH}
        handleVerifyCurrentPin={handleVerifyCurrentPin}
        handleChangePin={handleChangePin}
        isPinVerifying={isPinVerifying}
        isPinSaving={isPinSaving}
      />
      <TierlistModals
        modalMotionProps={modalMotionProps}
        isTierlistHeaderCropOpen={isTierlistHeaderCropOpen}
        setIsTierlistHeaderCropOpen={setIsTierlistHeaderCropOpen}
        tierlistHeaderCropImageSrc={tierlistHeaderCropImageSrc}
        tierlistHeaderCrop={tierlistHeaderCrop}
        setTierlistHeaderCrop={setTierlistHeaderCrop}
        tierlistHeaderZoom={tierlistHeaderZoom}
        setTierlistHeaderZoom={setTierlistHeaderZoom}
        setTierlistHeaderCroppedAreaPixels={setTierlistHeaderCroppedAreaPixels}
        handleTierlistHeaderCropConfirm={handleTierlistHeaderCropConfirm}
        isTierlistHeaderCropSaving={isTierlistHeaderCropSaving}
        isTierlistOpen={isTierlistOpen}
        setIsTierlistOpen={setIsTierlistOpen}
        setIsTierlistSaving={setIsTierlistSaving}
        tierlistEditing={tierlistEditing}
        tierlistHeaderPreview={tierlistHeaderPreview}
        accentColor={accentColor}
        isDarkMode={isDarkMode}
        buildAccentLeakGradient={buildAccentLeakGradient}
        tierlistTitle={tierlistTitle}
        setTierlistTitle={setTierlistTitle}
        tierlistDescription={tierlistDescription}
        setTierlistDescription={setTierlistDescription}
        tierlistHeaderInputRef={tierlistHeaderInputRef}
        handleTierlistHeaderChange={handleTierlistHeaderChange}
        setTierlistHeaderPreview={setTierlistHeaderPreview}
        setTierlistHeaderData={setTierlistHeaderData}
        setTierlistHeaderChanged={setTierlistHeaderChanged}
        TIER_COLOR_PALETTE={TIER_COLOR_PALETTE}
        tierlistTiers={tierlistTiers}
        handleTierlistTierAdd={handleTierlistTierAdd}
        handleTierlistTierColorChange={handleTierlistTierColorChange}
        handleTierlistTierLabelChange={handleTierlistTierLabelChange}
        handleTierlistTierRemove={handleTierlistTierRemove}
        handleTierItemChange={handleTierItemChange}
        handleTierItemCommit={handleTierItemCommit}
        handleTierItemAdd={handleTierItemAdd}
        handleTierlistSave={handleTierlistSave}
        isTierlistSaving={isTierlistSaving}
        selectedTierlist={selectedTierlist}
        setSelectedTierlist={setSelectedTierlist}
        DEFAULT_TIERLIST_TIERS={DEFAULT_TIERLIST_TIERS}
        resolveHeaderUrl={resolveHeaderUrl}
        openTierlistEdit={openTierlistEdit}
        setTierlistDeleteTarget={setTierlistDeleteTarget}
        formatRelativeTime={formatRelativeTime}
        profile={profile}
        resolveAvatarUrl={resolveAvatarUrl}
        tierlistComments={tierlistComments}
        isTierlistCommentsLoading={isTierlistCommentsLoading}
        handleTierlistCommentDelete={handleTierlistCommentDelete}
        tierlistCommentInputKey={tierlistCommentInputKey}
        tierlistCommentDraftRef={tierlistCommentDraftRef}
        handleTierlistCommentAdd={handleTierlistCommentAdd}
        isTierlistCommentSaving={isTierlistCommentSaving}
        tierlistDeleteTarget={tierlistDeleteTarget}
        handleTierlistDelete={handleTierlistDelete}
      />
      <FormModals
        isDuplicateModalOpen={isDuplicateModalOpen}
        setIsDuplicateModalOpen={setIsDuplicateModalOpen}
        duplicateModalTitle={duplicateModalTitle}
        duplicateModalMessage={duplicateModalMessage}
        modalMotionProps={modalMotionProps}
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        setEditHeaderPreview={setEditHeaderPreview}
        setEditHeaderData={setEditHeaderData}
        setEditHeaderChanged={setEditHeaderChanged}
        setEditAvatarPreview={setEditAvatarPreview}
        setEditAvatarData={setEditAvatarData}
        setEditAvatarChanged={setEditAvatarChanged}
        foodVisitDeleteTarget={foodVisitDeleteTarget}
        setFoodVisitDeleteTarget={setFoodVisitDeleteTarget}
        confirmDeleteFoodVisit={confirmDeleteFoodVisit}
        isDeletingFoodVisit={isDeletingFoodVisit}
        foodPlaceDeleteTarget={foodPlaceDeleteTarget}
        setFoodPlaceDeleteTarget={setFoodPlaceDeleteTarget}
        foodPlaceDeleteConfirmName={foodPlaceDeleteConfirmName}
        setFoodPlaceDeleteConfirmName={setFoodPlaceDeleteConfirmName}
        confirmDeleteFoodPlace={confirmDeleteFoodPlace}
        isDeletingFoodPlace={isDeletingFoodPlace}
        activityVisitDeleteTarget={activityVisitDeleteTarget}
        setActivityVisitDeleteTarget={setActivityVisitDeleteTarget}
        confirmDeleteActivityVisit={confirmDeleteActivityVisit}
        isDeletingActivityVisit={isDeletingActivityVisit}
        activityDeleteTarget={activityDeleteTarget}
        setActivityDeleteTarget={setActivityDeleteTarget}
        activityDeleteConfirmName={activityDeleteConfirmName}
        setActivityDeleteConfirmName={setActivityDeleteConfirmName}
        activityDeleteHasVisits={activityDeleteHasVisits}
        confirmDeleteActivity={confirmDeleteActivity}
      />
      <ImageCropperModal
        isOpen={isCropOpen}
        onOpenChange={setIsCropOpen}
        motionProps={modalMotionProps}
        title="Crop your photo"
        imageSrc={cropImageSrc}
        crop={crop}
        setCrop={setCrop}
        zoom={zoom}
        setZoom={setZoom}
        aspect={1}
        cropShape="round"
        onCropComplete={(_, pixels) => setAvatarCroppedAreaPixels(pixels)}
        onConfirm={handleCropConfirm}
        confirmLabel="Use photo"
        isSaving={isAvatarCropSaving}
        containerClassName="relative h-72 w-full overflow-hidden rounded-2xl bg-neutral-900"
      />
      <ImageCropperModal
        isOpen={isHeaderCropOpen}
        onOpenChange={setIsHeaderCropOpen}
        motionProps={modalMotionProps}
        title="Crop header"
        imageSrc={headerCropImageSrc}
        crop={headerCrop}
        setCrop={setHeaderCrop}
        zoom={headerZoom}
        setZoom={setHeaderZoom}
        aspect={3}
        cropShape="rect"
        onCropComplete={(_, pixels) => setHeaderCroppedAreaPixels(pixels)}
        onConfirm={handleHeaderCropConfirm}
        confirmLabel="Use header"
        isSaving={isHeaderCropSaving}
      />
    </AppShell>
  );
}
