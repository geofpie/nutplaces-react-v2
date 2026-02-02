import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
  Check,
  MapPinned,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

export default function FoodDetailPage({
  accentColor,
  isDarkMode,
  isScrolled,
  foodVisitRefreshKey,
  foodPlaceDetailRefreshKey,
  openFoodVisitModal,
  openFoodPlaceEdit,
  openFoodVisitEdit,
  openFoodVisitDetail,
  onVisitDeleteRequest,
  renderStarRow,
  renderStarRowCompact,
  resolveHeaderUrl,
  buildAccentLeakGradient,
  buildAccentKpiGradient,
  formatRelativeTime,
  formatCheckInDate,
  formatMonthYear,
  parseCheckInDate,
  FOOD_VISIT_ITEMS_PER_PAGE,
  QuestionMarkIcon,
  setFoodPlaceDeleteTarget,
  fetchFoodPlace,
  fetchFoodVisits,
}) {
  const { placeId } = useParams();
  const detailNavigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visitPage, setVisitPage] = useState(1);
  const [visits, setVisits] = useState([]);
  const [visitTotal, setVisitTotal] = useState(0);
  const [lastVisitAt, setLastVisitAt] = useState(null);
  const [isVisitLoading, setIsVisitLoading] = useState(false);

  useEffect(() => {
    setVisitPage(1);
  }, [placeId, foodVisitRefreshKey]);

  useEffect(() => {
    if (!placeId) {
      return;
    }
    setIsLoading(true);
    fetchFoodPlace(placeId)
      .then((payload) => setPlace(payload))
      .catch(() => setPlace(null))
      .finally(() => setIsLoading(false));
  }, [placeId, foodPlaceDetailRefreshKey, fetchFoodPlace]);

  useEffect(() => {
    if (!placeId) {
      return;
    }
    setIsVisitLoading(true);
    fetchFoodVisits(placeId, {
      page: visitPage,
      pageSize: FOOD_VISIT_ITEMS_PER_PAGE,
    })
      .then((payload) => {
        setVisits(payload.items || []);
        setVisitTotal(payload.total || 0);
        setLastVisitAt(payload.last_visit_at || null);
      })
      .catch(() => {
        setVisits([]);
        setVisitTotal(0);
        setLastVisitAt(null);
      })
      .finally(() => setIsVisitLoading(false));
  }, [placeId, visitPage, foodVisitRefreshKey, fetchFoodVisits]);

  const visitGroups = useMemo(() => {
    if (!visits.length) {
      return [];
    }
    const groups = [];
    visits.forEach((visit) => {
      const parsed = visit.visited_at
        ? parseCheckInDate(visit.visited_at)
        : new Date("");
      const label = Number.isNaN(parsed.getTime())
        ? "Unknown month"
        : formatMonthYear(parsed);
      const last = groups[groups.length - 1];
      if (!last || last.label !== label) {
        groups.push({ label, entries: [visit] });
      } else {
        last.entries.push(visit);
      }
    });
    return groups;
  }, [visits, parseCheckInDate, formatMonthYear]);

  const lastFoodVisitDate = lastVisitAt
    ? formatCheckInDate(lastVisitAt)
    : "No visits yet";
  const totalVisitPages = Math.max(
    1,
    Math.ceil(visitTotal / FOOD_VISIT_ITEMS_PER_PAGE),
  );
  const shouldShowVisitSkeleton = isVisitLoading && visits.length === 0;
  const againIconMap = {
    yes: Check,
    no: X,
  };
  const againClassMap = {
    yes: "bg-emerald-500 text-white",
    maybe: "bg-orange-500 text-white",
    no: "bg-rose-500 text-white",
  };
  const againLabelMap = {
    yes: "Would eat again",
    maybe: "Maybe eat again",
    no: "Would not eat again",
  };
  const placeUpdatedBy = place?.updated_by_name || "Unknown";
  const placeUpdatedAt = place?.updated_at
    ? formatRelativeTime(place.updated_at) ||
      formatCheckInDate(place.updated_at)
    : "";

  return (
    <section className="grid gap-6">
      <div className="relative -mx-4 -mt-6 h-[40vh] min-h-[280px] overflow-hidden md:h-[65vh] md:min-h-[520px]">
        <motion.div
          className="h-full w-full"
          style={{
            backgroundImage: place?.header_url
              ? `url(\"${resolveHeaderUrl(place.header_url)}\")`
              : buildAccentLeakGradient(accentColor, isDarkMode),
            backgroundPosition: place?.header_url ? "center" : "left center",
            backgroundSize: place?.header_url ? "cover" : "auto",
          }}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.div
          className="absolute bottom-6 left-6 z-20"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3 rounded-large border-1 border-white/20 bg-white/70 px-4 py-2 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/60 dark:text-white">
            <div>
              <p className="text-base font-semibold">
                {place?.name || (isLoading ? "Loading place..." : "Food place")}
              </p>
              <p className="text-xs text-neutral-600 dark:text-white/80">
                {place?.location_label || "Location"}
              </p>
              <p className="text-xs text-neutral-600 dark:text-white/80">
                {place?.cuisine || "Cuisine"}
              </p>
              {place?.open === false ? (
                <p className="text-xs font-semibold text-rose-500">
                  Permanently closed
                </p>
              ) : null}
              <div className="mt-1 flex items-center gap-2 text-amber-500 dark:text-amber-400">
                {renderStarRowCompact(place?.avg_rating || 0, "detail")}
                <span className="text-xs text-neutral-600 dark:text-white/80">
                  {place?.avg_rating
                    ? place.avg_rating.toFixed(1)
                    : "No rating"}
                </span>
              </div>
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
                <Utensils className="h-6 w-6" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Food place actions">
              <DropdownItem
                key="add-visit"
                startContent={<Plus className="h-4 w-4" />}
                onPress={() => openFoodVisitModal(place)}
              >
                Add visit
              </DropdownItem>
              <DropdownItem
                key="edit-place"
                startContent={<Pencil className="h-4 w-4" />}
                onPress={() => openFoodPlaceEdit(place)}
              >
                Edit place
              </DropdownItem>
              <DropdownItem
                key="delete-place"
                color="danger"
                startContent={<Trash2 className="h-4 w-4" />}
                onPress={() =>
                  setFoodPlaceDeleteTarget({
                    ...place,
                    visit_count: place?.visit_count ?? 0,
                  })
                }
              >
                Delete place
              </DropdownItem>
              <DropdownItem
                key="open-maps"
                startContent={<MapPinned className="h-4 w-4" />}
                onPress={() => {
                  if (!place) {
                    return;
                  }
                  const query =
                    place.location_label ||
                    `${place.latitude},${place.longitude}`;
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      query,
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
          {
            label: "Visit count",
            value: place?.visit_count ?? visitTotal,
          },
          {
            label: "Last visit",
            value: lastFoodVisitDate,
          },
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
                  {
                    angle: 128,
                    spotA: "12% 18%",
                    spotB: "82% 12%",
                  },
                  {
                    angle: 210,
                    spotA: "20% 30%",
                    spotB: "90% 18%",
                  },
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
      {place?.updated_at || place?.updated_by_name ? (
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          Last edited by {placeUpdatedBy}
          {placeUpdatedAt ? ` • ${placeUpdatedAt}` : ""}
        </div>
      ) : null}
      {place?.comments ? (
        <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-neutral-700 shadow-sm dark:bg-neutral-900/60 dark:text-neutral-200">
          {place.comments}
        </div>
      ) : null}
      {shouldShowVisitSkeleton ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`visit-skeleton-${index}`}
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
          ))}
        </div>
      ) : visitGroups.length ? (
        <div className="grid gap-6">
          {visitGroups.map((group) => (
            <div key={group.label} className="grid gap-3">
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                {group.label}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <AnimatePresence>
                  {group.entries.map((visit, index) => {
                    const ratingValue = visit.rating ?? 0;
                    const dishCount =
                      visit.dish_count ??
                      (visit.dishes ? visit.dishes.length : 0);
                    const visitImage = resolveHeaderUrl(visit.photo_url);
                    const AgainIcon = againIconMap[visit.again] || null;
                    const againClasses = againClassMap[visit.again] || "";
                    const againLabel = againLabelMap[visit.again] || null;
                    return (
                      <motion.div
                        key={visit.id}
                        layoutId={`food-visit-card-${visit.id}`}
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
                          layoutId={`food-visit-bg-${visit.id}`}
                          className="absolute inset-0 rounded-large bg-white/90 shadow-medium dark:bg-neutral-900/70"
                          transition={{ type: "spring", stiffness: 260, damping: 38 }}
                        />
                        <Card
                          isFooterBlurred
                          isPressable
                          radius="lg"
                          className="relative border-none aspect-square overflow-hidden h-full w-full bg-transparent"
                          onPress={() => openFoodVisitDetail(visit, place)}
                        >
                      <motion.div
                        layoutId={`food-visit-hero-${visit.id}`}
                        className="h-full w-full"
                        style={{
                          backgroundImage: visitImage
                            ? `url(\"${visitImage}\")`
                            : buildAccentLeakGradient(accentColor, isDarkMode),
                          backgroundPosition: visitImage
                            ? "center"
                            : "left center",
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
                          <DropdownMenu aria-label="Food visit actions">
                            <DropdownItem
                              key="edit-visit"
                              startContent={<Pencil className="h-4 w-4" />}
                              onPress={() => openFoodVisitEdit(visit, place)}
                            >
                              Edit visit
                            </DropdownItem>
                            <DropdownItem
                              key="delete-visit"
                              color="danger"
                              startContent={<Trash2 className="h-4 w-4" />}
                              onPress={() => onVisitDeleteRequest(visit)}
                            >
                              Delete visit
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                      <CardFooter className="border-1 border-white/20 bg-white/70 py-2 absolute bottom-1 w-[calc(100%_-_8px)] rounded-large shadow-small ml-1 z-10 text-neutral-900 backdrop-blur dark:bg-neutral-900/70 dark:text-white">
                        <div className="flex w-full items-center justify-between gap-3 text-left">
                          <div>
                            <p className="text-[10px] uppercase font-semibold tracking-wide text-neutral-600 dark:text-white/80">
                              {visit.visited_at
                                ? formatCheckInDate(visit.visited_at)
                                : "Unknown date"}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-neutral-900 dark:text-white/90">
                              {renderStarRow(ratingValue, visit.id)}
                              <span className="text-xs font-semibold">
                                {ratingValue.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-white/70">
                              {dishCount} {dishCount === 1 ? "dish" : "dishes"}
                            </p>
                          </div>
                          {AgainIcon ? (
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full ${againClasses}`}
                              aria-label={againLabel}
                              title={againLabel}
                            >
                              <AgainIcon className="h-4 w-4" />
                            </span>
                          ) : visit.again === "maybe" ? (
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full ${againClasses}`}
                              aria-label={againLabel}
                              title={againLabel}
                            >
                              <QuestionMarkIcon className="h-4 w-4" />
                            </span>
                          ) : null}
                        </div>
                      </CardFooter>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-neutral-700 shadow-sm dark:bg-neutral-900/60 dark:text-neutral-200">
          No visits yet.
        </div>
      )}
      <Pagination
        page={visitPage}
        total={totalVisitPages}
        onChange={setVisitPage}
        className="self-center"
      />
    </section>
  );
}
