import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Skeleton,
} from "@heroui/react";
import {
  ArrowUpDown,
  BookOpen,
  Footprints,
  Layers,
  ListOrdered,
  MapPin,
  MoreHorizontal,
  Pencil,
  Search,
  Star,
  Trash2,
  User,
  Utensils,
} from "lucide-react";
import { addToast } from "@heroui/react";
import HeroSection from "./HeroSection.jsx";
import HeroInfoPill from "./HeroInfoPill.jsx";
import HeroActionButton from "./HeroActionButton.jsx";
import JournalModals from "./JournalModals.jsx";

const JOURNAL_ENTRIES = [];

export default function JournalPage({
  isAuthenticated,
  fetchJournalEntries,
  deleteJournalEntry,
  searchFoodVisits,
  searchActivityVisits,
  formatCheckInDate,
  parseCheckInDate,
  formatRelativeTime,
  resolveAvatarUrl,
  resolveHeaderUrl,
  buildAccentLeakGradient,
  accentColor,
  isDarkMode,
  MONTH_LABELS,
  getLocalTimeZone,
  today,
  parseDate,
  toLocalDateString,
  readFileAsDataUrl,
  compressImageDataUrl,
  createJournalEntry,
  updateJournalEntry,
  profile,
  modalMotionProps,
}) {
  const [journalEntries, setJournalEntries] = useState(JOURNAL_ENTRIES);
  const entries = journalEntries;
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [journalPhotos, setJournalPhotos] = useState({});
  const [journalMoodFilter, setJournalMoodFilter] = useState("all");
  const [journalDateSort, setJournalDateSort] = useState("desc");
  const [journalYearFilter, setJournalYearFilter] = useState("all");
  const [journalMonthFilter, setJournalMonthFilter] = useState("all");
  const [journalPage, setJournalPage] = useState(1);
  const [isJournalEntryOpen, setIsJournalEntryOpen] = useState(false);
  const [journalEntryMode, setJournalEntryMode] = useState("full");
  const [journalEditingEntry, setJournalEditingEntry] = useState(null);
  const [journalEntryTitle, setJournalEntryTitle] = useState("");
  const [journalEntryDate, setJournalEntryDate] = useState(
    today(getLocalTimeZone()),
  );
  const [journalEntryIcon, setJournalEntryIcon] = useState("food");
  const [journalEntryVisibility, setJournalEntryVisibility] =
    useState("private");
  const [journalEntryMood, setJournalEntryMood] = useState(3);
  const [journalEntryBody, setJournalEntryBody] = useState("");
  const [journalEntryLinkQuery, setJournalEntryLinkQuery] = useState("");
  const [journalEntryLinks, setJournalEntryLinks] = useState([]);
  const [journalEntryPhotos, setJournalEntryPhotos] = useState([]);
  const [isJournalEntrySaving, setIsJournalEntrySaving] = useState(false);
  const JOURNAL_ITEMS_PER_PAGE = 6;
  const typeMeta = {
    food: { label: "Food", icon: Utensils },
    activity: { label: "Activity", icon: Footprints },
    checkin: { label: "Check in", icon: MapPin },
    note: { label: "Note", icon: BookOpen },
    celebrate: { label: "Celebrate", icon: Star },
    personal: { label: "Personal", icon: User },
  };
  const moodLabels = ["Low", "Soft", "Balanced", "Bright", "Electric"];
  const journalIconOptions = [
    { value: "food", label: "Food", icon: Utensils },
    { value: "checkin", label: "Check in", icon: MapPin },
    { value: "activity", label: "Activity", icon: Footprints },
    { value: "note", label: "Note", icon: BookOpen },
    { value: "celebrate", label: "Celebrate", icon: Star },
    { value: "personal", label: "Personal", icon: User },
  ];
  const [journalLinkResults, setJournalLinkResults] = useState([]);
  const [isJournalLinkSearching, setIsJournalLinkSearching] = useState(false);
  const [isJournalLoading, setIsJournalLoading] = useState(false);
  const [journalDeleteTarget, setJournalDeleteTarget] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    let isActive = true;
    setIsJournalLoading(true);
    fetchJournalEntries({ page: 1, pageSize: 200 })
      .then((payload) => {
        if (!isActive) {
          return;
        }
        const mapped = (payload.items || []).map((entry) => ({
          id: entry.id,
          date: entry.entry_date,
          type: entry.icon || "note",
          icon: entry.icon || "note",
          title: entry.title,
          location: "",
          summary: entry.body || "",
          body: entry.body || "",
          accent: "#F97316",
          mood: entry.mood || 3,
          linked: entry.links || [],
          is_public: entry.is_public,
          photos: entry.photos || [],
          author_name: entry.author_name,
          author_avatar_url: entry.author_avatar_url,
          author_telegram_uid: entry.author_telegram_uid,
        }));
        setJournalEntries(mapped);
        setJournalPhotos((prev) => {
          const next = { ...prev };
          (payload.items || []).forEach((entry) => {
            next[entry.id] = entry.photos || [];
          });
          return next;
        });
      })
      .catch(() => {})
      .finally(() => {
        if (isActive) {
          setIsJournalLoading(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, [isAuthenticated, fetchJournalEntries]);

  const openJournalDeleteModal = (entry) => {
    setJournalDeleteTarget(entry);
  };

  const handleDeleteJournalEntry = async () => {
    if (!journalDeleteTarget) {
      return;
    }
    try {
      await deleteJournalEntry(journalDeleteTarget.id);
      setJournalEntries((prev) =>
        prev.filter((item) => item.id !== journalDeleteTarget.id),
      );
      setJournalPhotos((prev) => {
        const next = { ...prev };
        delete next[journalDeleteTarget.id];
        return next;
      });
      if (selectedEntry?.id === journalDeleteTarget.id) {
        setSelectedEntry(null);
      }
      setJournalDeleteTarget(null);
      addToast({
        title: "Journal entry deleted",
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      addToast({
        title: "Unable to delete entry",
        description: error?.message || "Please try again.",
        color: "danger",
        timeout: 3000,
      });
    }
  };

  useEffect(() => {
    const query = journalEntryLinkQuery.trim();
    if (!query) {
      setJournalLinkResults([]);
      return;
    }
    let isActive = true;
    setIsJournalLinkSearching(true);
    Promise.all([
      searchFoodVisits(query, 5).catch(() => ({ items: [] })),
      searchActivityVisits(query, 5).catch(() => ({ items: [] })),
    ])
      .then(([foodPayload, activityPayload]) => {
        if (!isActive) {
          return;
        }
        const foodItems = (foodPayload.items || []).map((visit) => {
          const visitDate = visit.visited_at
            ? formatCheckInDate(visit.visited_at)
            : "Unknown date";
          return {
            id: `food-${visit.id}`,
            type: "food",
            title: visit.place_name || "Food visit",
            dateLabel: visitDate,
            ratingValue:
              typeof visit.rating === "number"
                ? visit.rating.toFixed(1)
                : null,
            visit_id: visit.id,
          };
        });
        const activityItems = (activityPayload.items || []).map((visit) => {
          const visitDate = visit.visited_at
            ? formatCheckInDate(visit.visited_at)
            : "Unknown date";
          const activityName =
            visit.activity_name || visit.activity_title || "Activity";
          return {
            id: `activity-${visit.id}`,
            type: "activity",
            title:
              visit.activity_title || visit.activity_name || "Activity visit",
            activityName,
            dateLabel: visitDate,
            ratingValue: visit.rating || "na",
            visit_id: visit.id,
          };
        });
        setJournalLinkResults([...foodItems, ...activityItems]);
      })
      .finally(() => {
        if (isActive) {
          setIsJournalLinkSearching(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, [journalEntryLinkQuery, searchFoodVisits, searchActivityVisits, formatCheckInDate]);

  const availableYears = Array.from(
    new Set(entries.map((entry) => parseCheckInDate(entry.date).getFullYear())),
  )
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => b - a);
  const availableMonths = MONTH_LABELS.map((label, index) => ({
    label,
    value: String(index + 1).padStart(2, "0"),
  }));
  const filteredEntries = entries.filter((entry) => {
    const date = parseCheckInDate(entry.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    if (journalMoodFilter !== "all") {
      if (Number(entry.mood || 0) !== Number(journalMoodFilter)) {
        return false;
      }
    }
    if (journalYearFilter !== "all" && String(year) !== journalYearFilter) {
      return false;
    }
    if (journalMonthFilter !== "all" && month !== journalMonthFilter) {
      return false;
    }
    return true;
  });
  const orderedEntries = [...filteredEntries].sort((a, b) => {
    const aTime = parseCheckInDate(a.date).getTime();
    const bTime = parseCheckInDate(b.date).getTime();
    return journalDateSort === "asc" ? aTime - bTime : bTime - aTime;
  });
  const totalJournalPages = Math.max(
    1,
    Math.ceil(orderedEntries.length / JOURNAL_ITEMS_PER_PAGE),
  );
  const pagedEntries = orderedEntries.slice(
    (journalPage - 1) * JOURNAL_ITEMS_PER_PAGE,
    journalPage * JOURNAL_ITEMS_PER_PAGE,
  );
  const grouped = pagedEntries.reduce((acc, entry) => {
    const label = formatCheckInDate(entry.date);
    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push(entry);
    return acc;
  }, {});
  const orderedGroups = Object.entries(grouped).map(([label, items]) => ({
    label,
    items,
  }));

  useEffect(() => {
    setJournalPage(1);
  }, [journalMoodFilter, journalDateSort, journalYearFilter, journalMonthFilter]);

  const resetJournalEntryForm = () => {
    setJournalEntryMode("full");
    setJournalEditingEntry(null);
    setJournalEntryTitle("");
    setJournalEntryDate(today(getLocalTimeZone()));
    setJournalEntryIcon("food");
    setJournalEntryVisibility("private");
    setJournalEntryMood(3);
    setJournalEntryBody("");
    setJournalEntryLinkQuery("");
    setJournalEntryLinks([]);
    setJournalEntryPhotos([]);
    setIsJournalEntrySaving(false);
  };

  const openJournalEntryEdit = (entry) => {
    if (!entry) {
      return;
    }
    const parsedDate = parseCheckInDate(entry.date);
    const dateValue = Number.isNaN(parsedDate.getTime())
      ? today(getLocalTimeZone())
      : parseDate(toLocalDateString(parsedDate));
    setJournalEntryMode("full");
    setJournalEditingEntry(entry);
    setJournalEntryTitle(entry.title || "");
    setJournalEntryBody(entry.body || entry.summary || "");
    setJournalEntryDate(dateValue);
    const iconValue = entry.icon || entry.type;
    const nextIcon = journalIconOptions.some(
      (option) => option.value === iconValue,
    )
      ? iconValue
      : "note";
    setJournalEntryIcon(nextIcon);
    setJournalEntryMood(entry.mood || 3);
    setJournalEntryVisibility(entry.is_public ? "public" : "private");
    setJournalEntryLinkQuery("");
    setJournalEntryLinks(
      (entry.linked || []).map((item) => ({
        id:
          item.id ||
          `${item.type || "visit"}-${item.visit_id ?? item.id ?? "0"}`,
        type: item.type,
        visit_id: item.visit_id,
        title: item.title,
        subtitle: item.subtitle,
        meta: item.meta,
      })),
    );
    setJournalEntryPhotos(
      (journalPhotos[entry.id] || []).map((photo, index) => ({
        id: `journal-${entry.id}-${index}`,
        src: photo,
        status: "ready",
      })),
    );
    setIsJournalEntryOpen(true);
  };

  const featuredEntry = useMemo(
    () => entries[Math.floor(Math.random() * entries.length)],
    [entries],
  );
  const featuredPhotos =
    featuredEntry?.photos || journalPhotos[featuredEntry?.id] || [];
  const heroPhoto = useMemo(() => {
    if (!featuredPhotos.length) {
      return "";
    }
    const index = Math.floor(Math.random() * featuredPhotos.length);
    return featuredPhotos[index];
  }, [featuredPhotos]);

  return (
    <section className="grid gap-6">
      <HeroSection
        heightClass="h-[40vh] min-h-[280px] md:h-[65vh] md:min-h-[520px]"
        backgroundStyle={{
          backgroundImage: heroPhoto
            ? `url(\"${resolveHeaderUrl(heroPhoto)}\")`
            : buildAccentLeakGradient(accentColor, isDarkMode),
          backgroundPosition: heroPhoto ? "center" : "left center",
          backgroundSize: heroPhoto ? "cover" : "auto",
        }}
      >
        <HeroInfoPill className="max-w-[70%]">
          <div className="rounded-large border-1 border-white/20 bg-white/70 px-4 py-2 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
            {entries.length ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:text-white/80">
                  Featured entry
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {featuredEntry?.title || "Journal highlight"}
                </p>
                <p className="text-xs text-neutral-600 dark:text-white/70 line-clamp-2">
                  {featuredEntry?.summary || "A living scrapbook of moments."}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:text-white/80">
                  No journal entries
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Add one to get started.
                </p>
              </>
            )}
          </div>
        </HeroInfoPill>
        <HeroActionButton>
          <Dropdown placement="top-end">
            <DropdownTrigger>
              <Button
                isIconOnly
                className="h-16 w-16 rounded-full bg-white/70 text-neutral-900 shadow-xl backdrop-blur dark:bg-neutral-900/60 dark:text-neutral-100"
              >
                <BookOpen className="h-6 w-6" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Journal actions">
              <DropdownItem
                key="quick-note"
                onPress={() => {
                  resetJournalEntryForm();
                  setJournalEntryMode("quick");
                  setJournalEntryIcon("note");
                  setJournalEditingEntry(null);
                  setIsJournalEntryOpen(true);
                }}
              >
                Quick note
              </DropdownItem>
              <DropdownItem
                key="add-entry"
                onPress={() => {
                  resetJournalEntryForm();
                  setJournalEntryMode("full");
                  setJournalEditingEntry(null);
                  setIsJournalEntryOpen(true);
                }}
              >
                Add entry
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </HeroActionButton>
      </HeroSection>

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Timeline
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button
                variant="flat"
                size="md"
                startContent={<Star className="h-4 w-4" />}
                className="shrink-0 h-11"
              >
                Mood:{" "}
                {journalMoodFilter === "all"
                  ? "All"
                  : moodLabels[Number(journalMoodFilter) - 1]}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Mood filter"
              onAction={(key) => setJournalMoodFilter(String(key))}
            >
              <DropdownItem key="all">All</DropdownItem>
              {moodLabels.map((label, index) => (
                <DropdownItem key={String(index + 1)}>{label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button
                variant="flat"
                size="md"
                startContent={<ArrowUpDown className="h-4 w-4" />}
                className="shrink-0 h-11"
              >
                Date: {journalDateSort === "asc" ? "Ascending" : "Descending"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Date sort"
              onAction={(key) => setJournalDateSort(String(key))}
            >
              <DropdownItem key="desc">Descending</DropdownItem>
              <DropdownItem key="asc">Ascending</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button
                variant="flat"
                size="md"
                startContent={<ListOrdered className="h-4 w-4" />}
                className="shrink-0 h-11"
              >
                Year: {journalYearFilter === "all" ? "All" : journalYearFilter}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Year filter"
              onAction={(key) => setJournalYearFilter(String(key))}
            >
              <DropdownItem key="all">All</DropdownItem>
              {availableYears.map((year) => (
                <DropdownItem key={String(year)}>{year}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button
                variant="flat"
                size="md"
                startContent={<Layers className="h-4 w-4" />}
                className="shrink-0 h-11"
              >
                Month:{" "}
                {journalMonthFilter === "all"
                  ? "All"
                  : MONTH_LABELS[Number(journalMonthFilter) - 1]}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Month filter"
              onAction={(key) => setJournalMonthFilter(String(key))}
            >
              <DropdownItem key="all">All</DropdownItem>
              {availableMonths.map((month) => (
                <DropdownItem key={month.value}>{month.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="space-y-4">
          {isJournalLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={`journal-skeleton-${index}`}
                  className="border-none bg-white/80 shadow-sm dark:bg-neutral-900/60"
                >
                  <CardBody className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex w-full flex-col gap-2">
                        <Skeleton className="h-4 w-3/5 rounded-lg" />
                        <Skeleton className="h-3 w-2/5 rounded-lg" />
                        <Skeleton className="h-3 w-full rounded-lg" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, barIndex) => (
                        <Skeleton
                          key={`journal-skeleton-bar-${index}-${barIndex}`}
                          className="h-1.5 w-6 rounded-full"
                        />
                      ))}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            orderedGroups.map((group, index) => (
              <div key={group.label} className="relative pl-6">
                <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-neutral-900/70 dark:bg-white/80" />
                {index !== orderedGroups.length - 1 ? (
                  <div className="absolute left-[11px] top-4 h-full w-px bg-neutral-200 dark:bg-neutral-800" />
                ) : null}
                <div className="grid gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    {group.label}
                  </p>
                  <div className="grid gap-3">
                    {group.items.map((entry) => {
                      const meta = typeMeta[entry.type] || typeMeta.food;
                      const EntryIcon = meta.icon;
                      const linked = entry.linked || [];
                      const entryDate = parseCheckInDate(entry.date);
                      const entryTimeLabel = Number.isNaN(entryDate.getTime())
                        ? "Time unavailable"
                        : formatRelativeTime(entryDate);
                      const moodIndex = Math.max(
                        0,
                        Math.min(4, (entry.mood || 1) - 1),
                      );
                      return (
                        <Card
                          key={entry.id}
                          className="relative border-none bg-white/80 shadow-sm dark:bg-neutral-900/60"
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600"
                            onClick={() => setSelectedEntry(entry)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedEntry(entry);
                              }
                            }}
                          />
                          {entry.author_telegram_uid === profile?.telegram_uid ? (
                            <div className="absolute right-3 top-3 z-20 pointer-events-auto">
                              <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="flat"
                                    className="bg-white/80 text-neutral-900 shadow-sm backdrop-blur dark:bg-neutral-900/70 dark:text-neutral-100"
                                    onPress={(event) => event.stopPropagation()}
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Journal entry actions">
                                  <DropdownItem
                                    key="edit"
                                    startContent={<Pencil className="h-4 w-4" />}
                                    onPress={() => openJournalEntryEdit(entry)}
                                  >
                                    Edit entry
                                  </DropdownItem>
                                  <DropdownItem
                                    key="delete"
                                    color="danger"
                                    startContent={<Trash2 className="h-4 w-4" />}
                                    onPress={() => openJournalDeleteModal(entry)}
                                  >
                                    Delete entry
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          ) : null}
                          <CardBody className="relative z-0 flex flex-col gap-3 pointer-events-none md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-3">
                              <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm dark:bg-neutral-900/80 dark:text-neutral-100">
                                <EntryIcon className="h-5 w-5" />
                              </span>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                    {entry.title}
                                  </p>
                                  {entry.is_public ? (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                                      Shared
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {entryTimeLabel}
                                </p>
                                <p className="mt-1 text-sm text-neutral-600 line-clamp-2 whitespace-pre-line dark:text-neutral-300">
                                  {entry.body || entry.summary}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                              <span className="text-base">
                                {["😔", "🙂", "😌", "😄", "✨"][moodIndex]}
                              </span>
                              <span className="text-xs">
                                {moodLabels[moodIndex]}
                              </span>
                              <div className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <span
                                    key={`${entry.id}-mood-${index}`}
                                    className={`h-1.5 w-6 rounded-full ${
                                      index < (entry.mood || 0)
                                        ? "bg-neutral-900 dark:bg-white"
                                        : "bg-neutral-200 dark:bg-neutral-800"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </CardBody>
                          {linked.length ? (
                            <CardBody className="border-t border-neutral-200/60 bg-white/60 pt-3 dark:border-neutral-800/60 dark:bg-neutral-950/40">
                              <div className="grid gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                  Linked
                                </p>
                                <div className="grid gap-2 md:grid-cols-2">
                                  {linked.map((item, itemIndex) => (
                                    <div
                                      key={item.id || item.visit_id || itemIndex}
                                      className="rounded-2xl border border-neutral-200/70 bg-white/70 px-3 py-2 text-xs text-neutral-700 shadow-sm dark:border-neutral-800/70 dark:bg-neutral-900/60 dark:text-neutral-200"
                                    >
                                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                        {item.title || "Linked visit"}
                                      </p>
                                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {item.subtitle || "Details pending"}
                                      </p>
                                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {item.meta || "Tap to view"}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardBody>
                          ) : null}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <Pagination
          page={journalPage}
          total={totalJournalPages}
          onChange={setJournalPage}
          className="self-center"
        />
      </section>
      <JournalModals
        selectedEntry={selectedEntry}
        setSelectedEntry={setSelectedEntry}
        modalMotionProps={modalMotionProps}
        typeMeta={typeMeta}
        journalPhotos={journalPhotos}
        moodLabels={moodLabels}
        parseCheckInDate={parseCheckInDate}
        formatRelativeTime={formatRelativeTime}
        resolveAvatarUrl={resolveAvatarUrl}
        resolveHeaderUrl={resolveHeaderUrl}
        profile={profile}
        openJournalEntryEdit={openJournalEntryEdit}
        openJournalDeleteModal={openJournalDeleteModal}
        journalDeleteTarget={journalDeleteTarget}
        setJournalDeleteTarget={setJournalDeleteTarget}
        handleDeleteJournalEntry={handleDeleteJournalEntry}
        isJournalEntryOpen={isJournalEntryOpen}
        setIsJournalEntryOpen={setIsJournalEntryOpen}
        resetJournalEntryForm={resetJournalEntryForm}
        journalEditingEntry={journalEditingEntry}
        journalEntryMode={journalEntryMode}
        journalIconOptions={journalIconOptions}
        journalEntryIcon={journalEntryIcon}
        setJournalEntryIcon={setJournalEntryIcon}
        journalEntryTitle={journalEntryTitle}
        setJournalEntryTitle={setJournalEntryTitle}
        journalEntryVisibility={journalEntryVisibility}
        setJournalEntryVisibility={setJournalEntryVisibility}
        journalEntryDate={journalEntryDate}
        setJournalEntryDate={setJournalEntryDate}
        journalEntryMood={journalEntryMood}
        setJournalEntryMood={setJournalEntryMood}
        journalEntryBody={journalEntryBody}
        setJournalEntryBody={setJournalEntryBody}
        journalEntryLinkQuery={journalEntryLinkQuery}
        setJournalEntryLinkQuery={setJournalEntryLinkQuery}
        isJournalLinkSearching={isJournalLinkSearching}
        journalLinkResults={journalLinkResults}
        journalEntryLinks={journalEntryLinks}
        setJournalEntryLinks={setJournalEntryLinks}
        journalEntryPhotos={journalEntryPhotos}
        setJournalEntryPhotos={setJournalEntryPhotos}
        readFileAsDataUrl={readFileAsDataUrl}
        compressImageDataUrl={compressImageDataUrl}
        addToast={addToast}
        isJournalEntrySaving={isJournalEntrySaving}
        setIsJournalEntrySaving={setIsJournalEntrySaving}
        getLocalTimeZone={getLocalTimeZone}
        today={today}
        createJournalEntry={createJournalEntry}
        updateJournalEntry={updateJournalEntry}
        setJournalPhotos={setJournalPhotos}
        setJournalEntries={setJournalEntries}
      />
    </section>
  );
}
