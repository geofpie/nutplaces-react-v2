import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Skeleton,
} from "@heroui/react";
import {
  ArrowLeft,
  Footprints,
  MapPinned,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  fetchActivity,
  fetchActivityVisitCount,
  fetchActivityVisits,
} from "../api.js";
import {
  buildAccentKpiGradient,
  buildAccentLeakGradient,
} from "../utils/gradients.js";

export default function ActivityDetailPage({
  accentColor,
  isDarkMode,
  isScrolled,
  activityRefreshKey,
  openActivityModal,
  openActivityVisitModal,
  openActivityVisitEdit,
  openActivityVisitDetail,
  onActivityVisitDeleteRequest,
  setActivityDeleteTarget,
  setActivityDeleteConfirmName,
  setActivityDeleteHasVisits,
  resolveHeaderUrl,
  formatCheckInDate,
  formatRelativeTime,
  ACTIVITY_EXERCISE_CATEGORIES,
  ACTIVITY_BUCKET_CATEGORIES,
  ACTIVITY_DIFFICULTY_OPTIONS,
  ACTIVITY_VISIT_ITEMS_PER_PAGE,
}) {
  const { activityId } = useParams();
  const detailNavigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visitPage, setVisitPage] = useState(1);
  const [visits, setVisits] = useState([]);
  const [visitTotal, setVisitTotal] = useState(0);
  const [isVisitsLoading, setIsVisitsLoading] = useState(false);

  useEffect(() => {
    if (!activityId) {
      return;
    }
    setIsLoading(true);
    fetchActivity(activityId)
      .then((payload) => setActivity(payload))
      .catch(() => setActivity(null))
      .finally(() => setIsLoading(false));
  }, [activityId, activityRefreshKey]);

  useEffect(() => {
    setVisitPage(1);
  }, [activityId, activityRefreshKey]);

  useEffect(() => {
    if (!activityId) {
      return;
    }
    setIsVisitsLoading(true);
    fetchActivityVisits(activityId, {
      page: visitPage,
      page_size: ACTIVITY_VISIT_ITEMS_PER_PAGE,
    })
      .then((payload) => {
        setVisits(payload.items || []);
        setVisitTotal(payload.total || 0);
      })
      .catch(() => {
        setVisits([]);
        setVisitTotal(0);
      })
      .finally(() => setIsVisitsLoading(false));
  }, [activityId, activityRefreshKey, visitPage, ACTIVITY_VISIT_ITEMS_PER_PAGE]);

  const categoryLabel =
    ACTIVITY_EXERCISE_CATEGORIES.find(
      (entry) => entry.value === activity?.category,
    )?.label || null;
  const difficultyLabel =
    ACTIVITY_DIFFICULTY_OPTIONS.find(
      (entry) => entry.value === activity?.difficulty,
    )?.label || null;
  const activityImage = activity?.image_url
    ? resolveHeaderUrl(activity.image_url)
    : null;
  const statusLabel = activity?.done_at ? "Done" : "Not done";
  const lastDoneLabel = activity?.done_at
    ? formatCheckInDate(activity.done_at)
    : "Not yet";
  const totalVisitPages = Math.max(
    1,
    Math.ceil(visitTotal / ACTIVITY_VISIT_ITEMS_PER_PAGE),
  );
  const activityUpdatedBy = activity?.updated_by_name || "Unknown";
  const activityUpdatedAt = activity?.updated_at
    ? formatRelativeTime(activity.updated_at) ||
      formatCheckInDate(activity.updated_at)
    : "";

  return (
    <section className="grid gap-6">
      <div className="relative -mx-4 -mt-6 h-[40vh] min-h-[280px] overflow-hidden md:h-[65vh] md:min-h-[520px]">
        <motion.div
          className="h-full w-full"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            backgroundImage: activityImage
              ? `url("${activityImage}")`
              : buildAccentLeakGradient(accentColor, isDarkMode),
            backgroundPosition: activityImage ? "center" : "left center",
            backgroundSize: activityImage ? "cover" : "auto",
          }}
        />
        <motion.div
          className="absolute bottom-6 left-6 z-20"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          <div className="flex items-center gap-3 rounded-large border-1 border-white/20 bg-white/70 px-4 py-2 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/60 dark:text-white">
            <div>
              <p className="text-base font-semibold">
                {activity?.name ||
                  (isLoading ? "Loading activity..." : "Activity")}
              </p>
              <p className="text-xs text-neutral-600 dark:text-white/80">
                {activity?.address || "Location"}
              </p>
              <p className="text-xs text-neutral-600 dark:text-white/80">
                {activity?.activity_type === "exercise"
                  ? [categoryLabel, difficultyLabel].filter(Boolean).join(" • ") ||
                    "Exercise"
                  : ACTIVITY_BUCKET_CATEGORIES.find(
                      (entry) => entry.value === activity?.category,
                    )?.label || "Bucket list"}
              </p>
            </div>
          </div>
        </motion.div>
        <div
          className={`absolute left-6 z-20 transition-all ${
            isScrolled
              ? "pointer-events-none top-6 opacity-0"
              : "top-16 opacity-100"
          }`}
        >
          <Button
            isIconOnly
            className="h-11 w-11 rounded-full bg-white/70 text-neutral-900 shadow-lg backdrop-blur dark:bg-neutral-900/60 dark:text-neutral-100"
            onPress={() => detailNavigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute bottom-6 right-6 z-20">
          <Dropdown placement="top-end">
            <DropdownTrigger>
              <Button
                isIconOnly
                className="h-16 w-16 rounded-full bg-white/70 text-neutral-900 shadow-xl backdrop-blur dark:bg-neutral-900/60 dark:text-neutral-100"
              >
                <Footprints className="h-6 w-6" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Activity actions">
              <DropdownItem
                key="add-activity-visit"
                startContent={<Plus className="h-4 w-4" />}
                onPress={() => openActivityVisitModal(activity)}
              >
                Add visit
              </DropdownItem>
              <DropdownItem
                key="edit-activity"
                startContent={<Pencil className="h-4 w-4" />}
                onPress={() => openActivityModal(activity)}
              >
                Edit activity
              </DropdownItem>
              <DropdownItem
                key="delete-activity"
                color="danger"
                startContent={<Trash2 className="h-4 w-4" />}
                onPress={async () => {
                  if (!activity) {
                    return;
                  }
                  try {
                    const total = await fetchActivityVisitCount(activity.id);
                    setActivityDeleteHasVisits(total > 0);
                  } catch (error) {
                    setActivityDeleteHasVisits(false);
                  }
                  setActivityDeleteConfirmName("");
                  setActivityDeleteTarget(activity);
                }}
              >
                Delete activity
              </DropdownItem>
              <DropdownItem
                key="open-maps"
                startContent={<MapPinned className="h-4 w-4" />}
                onPress={() => {
                  if (!activity?.address) {
                    return;
                  }
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      activity.address,
                    )}`,
                    "_blank",
                  );
                }}
              >
                Open in maps
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3">
        {[
          { label: "Status", value: statusLabel },
          { label: "Last done", value: lastDoneLabel },
        ].map((item, index) => (
          <Card
            key={item.label}
            isBlurred
            shadow="sm"
            className="border-none bg-white/70 dark:bg-neutral-900/60"
            style={{
              background: buildAccentKpiGradient(
                accentColor,
                isDarkMode,
                [
                  { angle: 128, spotA: "12% 18%", spotB: "82% 12%" },
                  { angle: 210, spotA: "20% 30%", spotB: "90% 18%" },
                ][index % 2],
              ),
            }}
          >
            <CardBody className="gap-1 text-center">
              <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {item.label}
              </p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                {item.value}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
      {activity?.updated_at || activity?.updated_by_name ? (
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          Last edited by {activityUpdatedBy}
          {activityUpdatedAt ? ` • ${activityUpdatedAt}` : ""}
        </div>
      ) : null}
      {activity?.description ? (
        <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-neutral-700 shadow-sm dark:bg-neutral-900/60 dark:text-neutral-200">
          {activity.description}
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        {isVisitsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`activity-visit-skeleton-${index}`}
              radius="lg"
              className="border-none aspect-square p-4"
            >
              <Skeleton className="rounded-lg">
                <div className="h-full rounded-lg bg-default-300" />
              </Skeleton>
              <div className="mt-4 space-y-3">
                <Skeleton className="w-3/5 rounded-lg">
                  <div className="h-3 w-3/5 rounded-lg bg-default-200" />
                </Skeleton>
                <Skeleton className="w-4/5 rounded-lg">
                  <div className="h-3 w-4/5 rounded-lg bg-default-200" />
                </Skeleton>
              </div>
            </Card>
          ))
        ) : visits.length ? (
          <AnimatePresence>
            {visits.map((visit, index) => {
            const visitImage = resolveHeaderUrl(visit.photo_url) || null;
            const ratingLabel =
              visit.rating === "up"
                ? "Thumbs up"
                : visit.rating === "down"
                  ? "Thumbs down"
                  : "N/A";
            const RatingIcon =
              visit.rating === "up"
                ? ThumbsUp
                : visit.rating === "down"
                  ? ThumbsDown
                  : Minus;
            const visitDateLabel = visit.visited_at
              ? formatCheckInDate(visit.visited_at)
              : "Unknown date";
            return (
              <motion.div
                key={visit.id}
                layoutId={`activity-visit-card-${visit.id}`}
                className="relative h-full w-full"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                  delay: Math.min(index * 0.06, 0.4),
                }}
              >
                <motion.div
                  layoutId={`activity-visit-bg-${visit.id}`}
                  className="absolute inset-0 rounded-large bg-white/90 shadow-medium dark:bg-neutral-900/70"
                  transition={{ type: "spring", stiffness: 260, damping: 38 }}
                />
                <Card
                  isFooterBlurred
                  radius="lg"
                  className="relative border-none aspect-square overflow-hidden h-full w-full bg-transparent"
                  isPressable
                  onPress={() =>
                    openActivityVisitDetail({
                      ...visit,
                      activity_name: activity?.name,
                      activity_address: activity?.address,
                      activity_type: activity?.activity_type,
                      activity_category: activity?.category,
                    })
                  }
                >
                <motion.div
                  layoutId={`activity-visit-hero-${visit.id}`}
                  className="h-full w-full"
                  style={{
                    backgroundImage: visitImage
                      ? `url("${visitImage}")`
                      : buildAccentLeakGradient(accentColor, isDarkMode),
                    backgroundPosition: visitImage ? "center" : "left center",
                    backgroundSize: visitImage ? "cover" : "auto",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 38 }}
                />
                <div className="absolute right-2 top-2 z-10">
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <div
                        role="button"
                        tabIndex={0}
                        className="flex h-8 w-8 items-center justify-center rounded-medium bg-white/80 text-neutral-900 shadow-sm backdrop-blur transition data-[hover=true]:bg-white/90 dark:bg-neutral-900/70 dark:text-neutral-100"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                          }
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </div>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Activity visit actions">
                      <DropdownItem
                        key="edit-visit"
                        startContent={<Pencil className="h-4 w-4" />}
                        onPress={() => openActivityVisitEdit(visit, activity)}
                      >
                        Edit visit
                      </DropdownItem>
                      <DropdownItem
                        key="delete-visit"
                        color="danger"
                        startContent={<Trash2 className="h-4 w-4" />}
                        onPress={() => onActivityVisitDeleteRequest?.(visit)}
                      >
                        Delete visit
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <CardFooter className="border-1 border-white/20 bg-white/70 py-2 absolute bottom-1 w-[calc(100%_-_8px)] rounded-large shadow-small ml-1 z-10 items-start text-neutral-900 backdrop-blur dark:bg-neutral-900/70 dark:text-white">
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-semibold tracking-wide text-neutral-600 dark:text-white/80">
                      {visitDateLabel}
                    </p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {visit.activity_title || "Visit title"}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-neutral-900 dark:text-white/90">
                      <RatingIcon className="h-4 w-4" />
                      <span className="text-xs font-normal">
                        {ratingLabel}
                        {typeof visit.distance_km === "number"
                          ? ` • ${visit.distance_km.toFixed(1)}km`
                          : ""}
                      </span>
                    </div>
                  </div>
                </CardFooter>
                </Card>
              </motion.div>
            );
          })}
          </AnimatePresence>
        ) : (
          <div className="col-span-2 rounded-2xl bg-white/80 p-4 text-sm text-neutral-700 shadow-sm dark:bg-neutral-900/60 dark:text-neutral-200">
            No visits yet.
          </div>
        )}
      </div>
      <Pagination
        page={visitPage}
        total={totalVisitPages}
        onChange={setVisitPage}
        className="self-center"
      />
    </section>
  );
}
