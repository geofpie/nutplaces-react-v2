import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Skeleton,
  Tooltip,
  usePagination,
  PaginationItemType,
} from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "./HeroSection.jsx";
import HeroInfoPill from "./HeroInfoPill.jsx";
import StatCard from "./StatCard.jsx";

export default function HomePage({
  accentColor,
  isDarkMode,
  buildAccentLeakGradient,
  buildAccentKpiGradient,
  foodStats,
  activityStats,
  checkInStats,
  formatCheckInDate,
  resolveHeaderUrl,
  cuisineHighlights,
  timelineEntries,
  isTimelineLoading,
  heroSlides,
  isHeroLoading,
}) {
  const cuisineCloudRef = useRef(null);
  const [isCuisineCloudVisible, setIsCuisineCloudVisible] = useState(false);
  const [activeCuisineWord, setActiveCuisineWord] = useState(null);
  const [hoveredCuisineWord, setHoveredCuisineWord] = useState(null);
  const timelineRef = useRef(null);
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);
  const [heroIndex, setHeroIndex] = useState(1);
  const [heroActive, setHeroActive] = useState(false);
  const [heroPaused, setHeroPaused] = useState(false);
  const heroRef = useRef(null);
  const heroPauseRef = useRef(null);
  const heroSnapRef = useRef(null);
  const heroAutoRef = useRef(false);
  const heroRafRef = useRef(null);

  const heroItems = heroSlides?.length ? heroSlides : [];
  const isLooping = heroItems.length > 2;
  const isHeroScrollable = heroItems.length > 1;
  const loopSlides = useMemo(() => {
    if (!heroItems.length) {
      return [];
    }
    if (!isLooping) {
      return heroItems;
    }
    const first = heroItems[0];
    const last = heroItems[heroItems.length - 1];
    return [last, ...heroItems, first];
  }, [heroItems, isLooping]);
  const loopCount = heroItems.length;
  const dotIndex = loopCount
    ? isLooping
      ? (heroIndex - 1 + loopCount) % loopCount
      : heroIndex
    : 0;
  const { activePage, range, setPage } = usePagination({
    total: loopCount || 1,
    showControls: false,
    siblings: 10,
    boundaries: 10,
  });

  useEffect(() => {
    if (!loopSlides.length || !isHeroScrollable) {
      return undefined;
    }
    if (heroPaused) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setHeroIndex((prev) => {
        if (isLooping) {
          return prev >= loopSlides.length - 1 ? 1 : prev + 1;
        }
        return prev >= loopSlides.length - 1 ? 0 : prev + 1;
      });
    }, 6000);
    return () => window.clearInterval(interval);
  }, [loopSlides.length, heroPaused, isLooping, isHeroScrollable]);

  useEffect(() => {
    const container = heroRef.current;
    if (!container || !loopSlides.length || !isHeroScrollable) {
      return;
    }
    const width = container.clientWidth;
    heroAutoRef.current = true;
    container.scrollTo({
      left: width * heroIndex,
      behavior: "smooth",
    });
    const timeout = window.setTimeout(() => {
      heroAutoRef.current = false;
    }, 420);
    return () => window.clearTimeout(timeout);
  }, [loopSlides.length, heroIndex, isHeroScrollable]);

  useEffect(() => {
    const container = heroRef.current;
    if (!container || !loopSlides.length) {
      return;
    }
    const width = container.clientWidth;
    if (isLooping) {
      container.scrollTo({ left: width, behavior: "auto" });
      setHeroIndex(1);
    } else {
      container.scrollTo({ left: 0, behavior: "auto" });
      setHeroIndex(0);
    }
  }, [loopSlides.length, isLooping]);

  useEffect(() => {
    if (!loopCount) {
      return;
    }
    setPage(dotIndex + 1);
  }, [dotIndex, loopCount, setPage]);

  useEffect(() => {
    if (!cuisineHighlights.length) {
      setIsCuisineCloudVisible(false);
      setActiveCuisineWord(null);
      return;
    }
    setIsCuisineCloudVisible(false);
    setActiveCuisineWord(null);
    const node = cuisineCloudRef.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsCuisineCloudVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [cuisineHighlights.length]);

  useEffect(() => {
    if (!activeCuisineWord && !hoveredCuisineWord) {
      return undefined;
    }
    const handleOutside = (event) => {
      const node = cuisineCloudRef.current;
      if (!node || node.contains(event.target)) {
        return;
      }
      setActiveCuisineWord(null);
      setHoveredCuisineWord(null);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [activeCuisineWord, hoveredCuisineWord]);

  useEffect(() => {
    const node = timelineRef.current;
    if (!node) {
      return undefined;
    }
    setIsTimelineVisible(false);
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsTimelineVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsTimelineVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <section className="grid gap-6">
      <HeroSection
        heightClass="h-[40vh] min-h-[280px] md:h-[55vh] md:min-h-[460px]"
        backgroundNode={
          <div
            ref={heroRef}
            className={`group flex h-full w-full snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              isHeroScrollable ? "overflow-x-auto" : "overflow-hidden"
            }`}
            onMouseEnter={() => setHeroActive(true)}
            onMouseLeave={() => setHeroActive(false)}
            onTouchStart={() => setHeroActive(true)}
            onTouchEnd={() => {
              window.setTimeout(() => setHeroActive(false), 1200);
            }}
            onScroll={
              isHeroScrollable
                ? (event) => {
                    if (heroRafRef.current) {
                      window.cancelAnimationFrame(heroRafRef.current);
                    }
                    setHeroPaused(true);
                    if (heroPauseRef.current) {
                      window.clearTimeout(heroPauseRef.current);
                    }
                    heroPauseRef.current = window.setTimeout(() => {
                      setHeroPaused(false);
                    }, 1200);
                    const container = event.currentTarget;
                    const width = container.clientWidth || 1;
                    if (heroAutoRef.current) {
                      return;
                    }
                    heroRafRef.current = window.requestAnimationFrame(() => {
                      const index = Math.round(container.scrollLeft / width);
                      if (index !== heroIndex) {
                        setHeroIndex(index);
                      }
                    });
                    if (heroSnapRef.current) {
                      window.clearTimeout(heroSnapRef.current);
                    }
                    heroSnapRef.current = window.setTimeout(() => {
                      if (heroAutoRef.current) {
                        return;
                      }
                      const snapIndex = Math.round(container.scrollLeft / width);
                      const lastIndex = loopSlides.length - 1;
                      container.scrollTo({
                        left: width * snapIndex,
                        behavior: "smooth",
                      });
                      if (isLooping) {
                        if (snapIndex === 0) {
                          setTimeout(() => {
                            container.scrollTo({
                              left: width * loopCount,
                              behavior: "auto",
                            });
                            setHeroIndex(loopCount);
                          }, 250);
                        } else if (snapIndex === lastIndex) {
                          setTimeout(() => {
                            container.scrollTo({
                              left: width,
                              behavior: "auto",
                            });
                            setHeroIndex(1);
                          }, 250);
                        } else {
                          setHeroIndex(snapIndex);
                        }
                      } else {
                        setHeroIndex(snapIndex);
                      }
                    }, 180);
                  }
                : undefined
            }
          >
            {isHeroLoading ? (
              <div className="relative h-full min-w-full snap-start">
                <Skeleton className="h-full w-full" />
              </div>
            ) : loopSlides.length ? (
              loopSlides.map((slide, index) => {
                const isClone =
                  isLooping &&
                  (index === 0 || index === loopSlides.length - 1);
                return (
                <div
                  key={`${slide.id}-${index}`}
                  className="relative h-full min-w-full snap-start"
                >
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage: slide.imageUrl
                        ? `url("${slide.imageUrl}")`
                        : buildAccentLeakGradient(accentColor, isDarkMode),
                      backgroundPosition: slide.imageUrl ? "center" : "left center",
                      backgroundSize: slide.imageUrl ? "cover" : "auto",
                    }}
                  />
                  <HeroInfoPill
                    className="text-white"
                    isActive={index === heroIndex}
                    disableAnimation={isClone}
                  >
                    <div className="rounded-large border-1 border-white/20 bg-white/70 px-4 py-2 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/60 dark:text-white">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:text-white/80">
                        {slide.label}
                      </p>
                      <p className="text-sm font-semibold">{slide.title}</p>
                      {slide.subtitle ? (
                        <p className="text-xs text-neutral-600 dark:text-white/70">
                          {slide.subtitle}
                        </p>
                      ) : null}
                    </div>
                  </HeroInfoPill>
                </div>
                );
              })
            ) : (
              <div className="relative h-full min-w-full snap-start">
                <div
                  className="h-full w-full"
                  style={{
                    backgroundImage: buildAccentLeakGradient(
                      accentColor,
                      isDarkMode,
                    ),
                    backgroundPosition: "left center",
                  }}
                />
                <HeroInfoPill className="text-white" isActive>
                  <div className="rounded-large border-1 border-white/20 bg-white/70 px-4 py-2 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/60 dark:text-white">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:text-white/80">
                      Home
                    </p>
                    <p className="text-sm font-semibold">No highlights yet</p>
                    <p className="text-xs text-neutral-600 dark:text-white/70">
                      Add a visit to see it here
                    </p>
                  </div>
                </HeroInfoPill>
              </div>
            )}
          </div>
        }
      >
        {heroItems.length > 1 ? (
          <div
            className={`absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-2 py-1 backdrop-blur transition-opacity ${
              heroActive
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            }`}
          >
            {range.map((page) => {
              if (page === PaginationItemType.DOTS) {
                return (
                  <span
                    key={`home-hero-dots-${page}`}
                    className="h-1.5 w-1.5 rounded-full bg-white/20"
                  />
                );
              }
              if (
                page === PaginationItemType.NEXT ||
                page === PaginationItemType.PREV
              ) {
                return null;
              }
              const pageNumber = Number(page);
              const isActive = activePage === pageNumber;
              return (
                <button
                  key={`home-hero-dot-${pageNumber}`}
                  type="button"
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    isActive ? "bg-white" : "bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${pageNumber}`}
                  onClick={() => {
                    setPage(pageNumber);
                    setHeroIndex(isLooping ? pageNumber : pageNumber - 1);
                  }}
                />
              );
            })}
          </div>
        ) : null}
      </HeroSection>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Food spots", value: foodStats.total },
          { label: "Activities done", value: activityStats.done_all },
          { label: "Check ins this month", value: checkInStats.month },
        ].map((item, index) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            accentColor={accentColor}
            isDarkMode={isDarkMode}
            gradientConfig={[
              { angle: 128, spotA: "12% 18%", spotB: "82% 12%" },
              { angle: 210, spotA: "20% 30%", spotB: "90% 18%" },
              { angle: 320, spotA: "18% 12%", spotB: "78% 24%" },
            ][index % 3]}
          />
        ))}
      </div>
      <div className="grid gap-3" ref={timelineRef}>
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Latest visits
          </h2>
        </div>
        <div className="space-y-4 min-h-[320px]">
          {isTimelineLoading ||
          (!isTimelineVisible && timelineEntries?.length)
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={`timeline-skeleton-${index}`} className="relative pl-6">
                  <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-neutral-900/20 dark:bg-white/20" />
                  <div className="absolute left-[11px] top-4 h-full w-px bg-neutral-200 dark:bg-neutral-800" />
                  <Card className="bg-white/80 shadow-none dark:bg-neutral-900/60">
                    <CardBody className="py-3 space-y-2">
                      <Skeleton className="h-3 w-24 rounded-md" />
                      <Skeleton className="h-4 w-40 rounded-md" />
                      <Skeleton className="h-3 w-32 rounded-md" />
                    </CardBody>
                  </Card>
                </div>
              ))
            : timelineEntries?.length
              ? (
                  <AnimatePresence>
                    {timelineEntries.map((entry, index, entries) => (
                      <motion.div
                        key={entry.id}
                        className="relative pl-6"
                        initial={{ opacity: 0, x: -12 }}
                        animate={
                          isTimelineVisible
                            ? { opacity: 1, x: 0 }
                            : { opacity: 0, x: -12 }
                        }
                        transition={{
                          duration: 0.45,
                          ease: "easeOut",
                          delay: index * 0.12,
                        }}
                      >
                        <motion.div
                          className="absolute left-2 top-2 h-2 w-2 rounded-full bg-neutral-900/70 dark:bg-white/80"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={
                            isTimelineVisible
                              ? { scale: 1, opacity: 1 }
                              : { scale: 0.6, opacity: 0 }
                          }
                          transition={{
                            duration: 0.35,
                            ease: "easeOut",
                            delay: index * 0.12 + 0.04,
                          }}
                        />
                        {index !== entries.length - 1 ? (
                          <motion.div
                            className="absolute left-[11px] top-4 h-full w-px bg-neutral-200 dark:bg-neutral-800 origin-top"
                            initial={{ scaleY: 0 }}
                            animate={
                              isTimelineVisible ? { scaleY: 1 } : { scaleY: 0 }
                            }
                            transition={{
                              duration: 0.45,
                              ease: "easeOut",
                              delay: index * 0.12 + 0.12,
                            }}
                          />
                        ) : null}
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={
                            isTimelineVisible
                              ? { opacity: 1, x: 0 }
                              : { opacity: 0, x: -8 }
                          }
                          transition={{
                            duration: 0.45,
                            ease: "easeOut",
                            delay: index * 0.12,
                          }}
                        >
                          <Card className="relative overflow-hidden bg-white/85 shadow-none dark:bg-neutral-900/70">
                            {entry.imageUrl ? (
                              <div
                                className="pointer-events-none absolute inset-0 opacity-60 blur-2xl"
                                style={{
                                  backgroundImage: `url("${entry.imageUrl}")`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              />
                            ) : null}
                            <CardBody className="relative p-0">
                              <div className="flex min-h-[88px] items-stretch">
                                <div className="flex-1 p-3">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                    {entry.label}
                                  </p>
                                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                    {entry.title}
                                  </p>
                                  {entry.detail ? (
                                    <p className="text-xs text-neutral-600 dark:text-neutral-300">
                                      {entry.detail}
                                    </p>
                                  ) : null}
                                </div>
                                {entry.imageUrl ? (
                                  <div className="relative w-[32%] min-w-[96px]">
                                    <div className="absolute inset-0 bg-black/10" />
                                    <img
                                      alt={entry.title}
                                      src={entry.imageUrl}
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : null}
                              </div>
                            </CardBody>
                          </Card>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )
              : (
                  <Card className="bg-white/80 shadow-none dark:bg-neutral-900/60">
                    <CardBody className="py-3 text-sm text-neutral-600 dark:text-neutral-300">
                      No visits yet.
                    </CardBody>
                  </Card>
                )}
        </div>
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Highlights
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Most popular food place",
              value: foodStats.top_year?.name || "—",
              image: foodStats.top_year?.header_url
                ? resolveHeaderUrl(foodStats.top_year.header_url)
                : "",
              meta: foodStats.top_year?.latest_visit_at
                ? `Last visit ${formatCheckInDate(foodStats.top_year.latest_visit_at)}`
                : "",
              type: "media",
            },
            {
              label: "Most popular activity",
              value: activityStats.top_all_time?.name || "—",
              image: activityStats.top_all_time?.image_url
                ? resolveHeaderUrl(activityStats.top_all_time.image_url)
                : "",
              type: "media",
            },
            {
              label: "Worst rated food place",
              value: foodStats.worst_rated?.name || "—",
              image: foodStats.worst_rated?.header_url
                ? resolveHeaderUrl(foodStats.worst_rated.header_url)
                : "",
              meta: foodStats.worst_rated?.latest_visit_at
                ? `Last visit ${formatCheckInDate(foodStats.worst_rated.latest_visit_at)}`
                : "",
              type: "media",
            },
            {
              label: "Most controversial",
              value: foodStats.most_controversial?.name || "—",
              image: foodStats.most_controversial?.header_url
                ? resolveHeaderUrl(foodStats.most_controversial.header_url)
                : "",
              meta: foodStats.most_controversial?.latest_visit_at
                ? `Last visit ${formatCheckInDate(
                    foodStats.most_controversial.latest_visit_at,
                  )}`
                : "",
              type: "media",
            },
            {
              label: "Most popular cuisine",
              value: cuisineHighlights.length ? cuisineHighlights : null,
              type: "cuisine",
              fullWidth: true,
            },
          ].map((item, index) => {
            const gradientConfig = [
              { angle: 128, spotA: "12% 18%", spotB: "82% 12%" },
              { angle: 210, spotA: "20% 30%", spotB: "90% 18%" },
              { angle: 320, spotA: "18% 12%", spotB: "78% 24%" },
              { angle: 160, spotA: "18% 22%", spotB: "80% 18%" },
            ][index % 4];

            if (!item.type) {
              return (
                <StatCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  accentColor={accentColor}
                  isDarkMode={isDarkMode}
                  gradientConfig={gradientConfig}
                />
              );
            }

            return (
              <Card
                key={item.label}
                isBlurred
                shadow="sm"
                className={`border-none bg-white/70 dark:bg-neutral-900/60 ${
                  item.fullWidth ? "col-span-2" : ""
                } ${item.type === "media" ? "aspect-square overflow-hidden" : ""}`}
                style={{
                  background: buildAccentKpiGradient(
                    accentColor,
                    isDarkMode,
                    gradientConfig,
                  ),
                }}
              >
                {item.type === "media" ? (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: item.image
                          ? `url("${item.image}")`
                          : buildAccentLeakGradient(
                              accentColor,
                              isDarkMode,
                            ),
                        backgroundSize: item.image ? "cover" : "auto",
                        backgroundPosition: item.image ? "center" : "left center",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
                    <CardFooter className="border-1 border-white/20 bg-neutral-900/70 py-2 absolute bottom-1 w-[calc(100%_-_8px)] rounded-large shadow-small ml-1 z-10 text-white backdrop-blur">
                      <div className="text-left">
                        <p className="text-[10px] uppercase tracking-wide text-white/70">
                          {item.label}
                        </p>
                        <p className="text-base font-semibold text-white line-clamp-2">
                          {item.value}
                        </p>
                        {item.meta ? (
                          <p className="text-[11px] text-white/70">
                            {item.meta}
                          </p>
                        ) : null}
                      </div>
                    </CardFooter>
                  </>
                ) : (
                  <CardBody className="gap-2">
                    {item.type !== "cuisine" ? (
                      <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        {item.label}
                      </p>
                    ) : null}
                    {item.type === "cuisine" ? (
                      item.value ? (
                        <div className="grid gap-3">
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              Popular cuisines
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Based on visit counts
                            </p>
                          </div>
                          <div
                            className="cuisine-cloud-grid text-neutral-800 dark:text-neutral-100"
                            ref={cuisineCloudRef}
                            role="button"
                            tabIndex={0}
                            onClick={() => setActiveCuisineWord(null)}
                          >
                            {item.value.map((entry, cloudIndex) => {
                              const max = item.value[0]?.count || 1;
                              const weight = entry.count / max;
                              const sizeClass =
                                weight > 0.85
                                  ? "cuisine-cloud-word--xl"
                                  : weight > 0.7
                                    ? "cuisine-cloud-word--lg"
                                    : weight > 0.5
                                      ? "cuisine-cloud-word--md"
                                      : "cuisine-cloud-word--sm";
                              const transforms = [
                                { r: -3, x: -2, y: 1 },
                                { r: 2, x: 1, y: -1 },
                                { r: -2, x: 0, y: 2 },
                                { r: 3, x: 2, y: 0 },
                                { r: -4, x: -1, y: -2 },
                                { r: 1, x: 2, y: -1 },
                                { r: -1, x: -2, y: 1 },
                                { r: 4, x: 1, y: 2 },
                                { r: -2, x: 2, y: -2 },
                                { r: 2, x: -2, y: 0 },
                              ];
                              const transform =
                                transforms[cloudIndex % transforms.length];
                              const slot =
                                [
                                  { col: 1, row: 2, span: 3 },
                                  { col: 4, row: 1, span: 2 },
                                  { col: 1, row: 4, span: 2 },
                                  { col: 5, row: 3, span: 2 },
                                  { col: 3, row: 3, span: 1 },
                                  { col: 7, row: 3, span: 2 },
                                  { col: 3, row: 5, span: 1 },
                                  { col: 7, row: 1, span: 1 },
                                  { col: 1, row: 1, span: 2 },
                                  { col: 7, row: 5, span: 1 },
                                ][cloudIndex] || { col: 4, row: 4, span: 2 };
                              return (
                                <div
                                  key={entry.label}
                                  className="cuisine-cloud-slot"
                                  style={{
                                    gridColumn: `${slot.col} / span ${slot.span}`,
                                    gridRow: `${slot.row} / span 1`,
                                  }}
                                >
                                  <Tooltip
                                    content={`${entry.count} visits`}
                                    offset={10}
                                    showArrow
                                    isOpen={
                                      activeCuisineWord === entry.label ||
                                      hoveredCuisineWord === entry.label
                                    }
                                  >
                                    <span
                                      className={`cuisine-cloud-word ${sizeClass} ${
                                        isCuisineCloudVisible
                                          ? "cuisine-cloud-word--visible"
                                          : ""
                                      } ${
                                        activeCuisineWord === entry.label
                                          ? "cuisine-cloud-word--reveal"
                                          : ""
                                      }`}
                                      style={{
                                        animationDelay: `${cloudIndex * 80}ms`,
                                        transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.r}deg)`,
                                      }}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setActiveCuisineWord((prev) =>
                                          prev === entry.label
                                            ? null
                                            : entry.label,
                                        );
                                      }}
                                      onMouseEnter={() =>
                                        setHoveredCuisineWord(entry.label)
                                      }
                                      onMouseLeave={() =>
                                        setHoveredCuisineWord((prev) =>
                                          prev === entry.label ? null : prev,
                                        )
                                      }
                                      onKeyDown={(event) => {
                                        if (
                                          event.key === "Enter" ||
                                          event.key === " "
                                        ) {
                                          event.preventDefault();
                                          setActiveCuisineWord((prev) =>
                                            prev === entry.label
                                              ? null
                                              : entry.label,
                                          );
                                        }
                                      }}
                                      role="button"
                                      tabIndex={0}
                                    >
                                      {entry.label}
                                    </span>
                                  </Tooltip>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                          —
                        </p>
                      )
                    ) : (
                      <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                        {item.value}
                      </p>
                    )}
                  </CardBody>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
