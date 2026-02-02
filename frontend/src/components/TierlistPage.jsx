import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Input,
  Pagination,
  PaginationItemType,
  Skeleton,
  usePagination,
} from "@heroui/react";
import {
  ArrowUpDown,
  Clock,
  ListOrdered,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import HeroSection from "./HeroSection.jsx";
import HeroInfoPill from "./HeroInfoPill.jsx";
import HeroActionButton from "./HeroActionButton.jsx";

export default function TierlistPage({
  accentColor,
  isDarkMode,
  buildAccentLeakGradient,
  resolveHeaderUrl,
  formatCheckInDate,
  pickRandomItems,
  openTierlistModal,
  openTierlistEdit,
  setTierlistDeleteTarget,
  setSelectedTierlist,
  tierlists,
  isTierlistsLoading,
  tierlistPage,
  setTierlistPage,
  TIERLIST_ITEMS_PER_PAGE,
}) {
  const [tierlistQuery, setTierlistQuery] = useState("");
  const [tierlistSortName, setTierlistSortName] = useState("az");
  const [tierlistSortDate, setTierlistSortDate] = useState("na");
  const featuredTierlists = useMemo(
    () => pickRandomItems(tierlists, 3),
    [tierlists, pickRandomItems],
  );
  const heroSlides = featuredTierlists.length
    ? featuredTierlists
    : tierlists.slice(0, 3);
  const isLooping = heroSlides.length > 2;
  const isHeroScrollable = heroSlides.length > 1;
  const tierlistHeroRef = useRef(null);
  const [tierlistHeroIndex, setTierlistHeroIndex] = useState(1);
  const [tierlistHeroActive, setTierlistHeroActive] = useState(false);
  const [tierlistHeroPaused, setTierlistHeroPaused] = useState(false);
  const tierlistHeroPauseRef = useRef(null);
  const tierlistHeroSnapRef = useRef(null);
  const tierlistHeroAutoRef = useRef(false);
  const tierlistHeroRafRef = useRef(null);
  const loopSlides = useMemo(() => {
    if (!heroSlides.length) {
      return [];
    }
    if (!isLooping) {
      return heroSlides;
    }
    const first = heroSlides[0];
    const last = heroSlides[heroSlides.length - 1];
    return [last, ...heroSlides, first];
  }, [heroSlides, isLooping]);
  const loopCount = heroSlides.length;
  const dotIndex = loopCount
    ? isLooping
      ? (tierlistHeroIndex - 1 + loopCount) % loopCount
      : tierlistHeroIndex
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
    if (tierlistHeroPaused) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setTierlistHeroIndex((prev) => {
        if (isLooping) {
          return prev >= loopSlides.length - 1 ? 1 : prev + 1;
        }
        return prev >= loopSlides.length - 1 ? 0 : prev + 1;
      });
    }, 6000);
    return () => window.clearInterval(interval);
  }, [loopSlides.length, tierlistHeroPaused, isLooping, isHeroScrollable]);

  useEffect(() => {
    const container = tierlistHeroRef.current;
    if (!container || !loopSlides.length || !isHeroScrollable) {
      return;
    }
    const width = container.clientWidth;
    tierlistHeroAutoRef.current = true;
    container.scrollTo({
      left: width * tierlistHeroIndex,
      behavior: "smooth",
    });
    const timeout = window.setTimeout(() => {
      tierlistHeroAutoRef.current = false;
    }, 420);
    return () => window.clearTimeout(timeout);
  }, [loopSlides.length, tierlistHeroIndex, isHeroScrollable]);

  useEffect(() => {
    const container = tierlistHeroRef.current;
    if (!container || !loopSlides.length) {
      return;
    }
    const width = container.clientWidth;
    if (isLooping) {
      container.scrollTo({ left: width, behavior: "auto" });
      setTierlistHeroIndex(1);
    } else if (isHeroScrollable) {
      container.scrollTo({ left: 0, behavior: "auto" });
      setTierlistHeroIndex(0);
    } else {
      container.scrollTo({ left: 0, behavior: "auto" });
      setTierlistHeroIndex(0);
    }
  }, [loopSlides.length, isLooping, isHeroScrollable]);

  useEffect(() => {
    if (!loopCount) {
      return;
    }
    setPage(dotIndex + 1);
  }, [dotIndex, loopCount, setPage]);

  const filteredTierlists = useMemo(() => {
    const query = tierlistQuery.trim().toLowerCase();
    const compareName = (a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    const nameDirection = tierlistSortName === "az" ? 1 : -1;
    const compareDate = (a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
        return 0;
      }
      if (tierlistSortDate === "latest") {
        return bTime - aTime;
      }
      if (tierlistSortDate === "earliest") {
        return aTime - bTime;
      }
      return 0;
    };
    return tierlists
      .filter((entry) =>
        query ? entry.title.toLowerCase().includes(query) : true,
      )
      .sort((a, b) => {
        const dateSort = compareDate(a, b);
        if (dateSort !== 0) {
          return dateSort;
        }
        return compareName(a, b) * nameDirection;
      });
  }, [tierlistQuery, tierlistSortName, tierlistSortDate, tierlists]);

  useEffect(() => {
    if (tierlistPage !== 1) {
      setTierlistPage(1);
    }
  }, [tierlistQuery, tierlistSortName, tierlistSortDate, tierlistPage, setTierlistPage]);

  const totalTierlistPages = Math.max(
    1,
    Math.ceil(filteredTierlists.length / TIERLIST_ITEMS_PER_PAGE),
  );
  const pagedTierlists = filteredTierlists.slice(
    (tierlistPage - 1) * TIERLIST_ITEMS_PER_PAGE,
    tierlistPage * TIERLIST_ITEMS_PER_PAGE,
  );

  return (
    <section className="grid gap-6">
      <HeroSection
        heightClass="h-[40vh] min-h-[280px] md:h-[65vh] md:min-h-[520px]"
        backgroundNode={
          <div
            ref={tierlistHeroRef}
            className={`group flex h-full w-full snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              isHeroScrollable ? "overflow-x-auto" : "overflow-hidden"
            }`}
            onMouseEnter={() => setTierlistHeroActive(true)}
            onMouseLeave={() => setTierlistHeroActive(false)}
            onTouchStart={() => setTierlistHeroActive(true)}
            onTouchEnd={() => {
              window.setTimeout(() => setTierlistHeroActive(false), 1200);
            }}
            onScroll={
              isHeroScrollable
                ? (event) => {
                    if (tierlistHeroRafRef.current) {
                      window.cancelAnimationFrame(tierlistHeroRafRef.current);
                    }
                    setTierlistHeroPaused(true);
                    if (tierlistHeroPauseRef.current) {
                      window.clearTimeout(tierlistHeroPauseRef.current);
                    }
                    tierlistHeroPauseRef.current = window.setTimeout(() => {
                      setTierlistHeroPaused(false);
                    }, 1200);
                    const container = event.currentTarget;
                    const width = container.clientWidth || 1;
                    if (tierlistHeroAutoRef.current) {
                      return;
                    }
                    tierlistHeroRafRef.current = window.requestAnimationFrame(
                      () => {
                        const index = Math.round(container.scrollLeft / width);
                        if (index !== tierlistHeroIndex) {
                          setTierlistHeroIndex(index);
                        }
                      },
                    );
                    if (tierlistHeroSnapRef.current) {
                      window.clearTimeout(tierlistHeroSnapRef.current);
                    }
                    tierlistHeroSnapRef.current = window.setTimeout(() => {
                      if (tierlistHeroAutoRef.current) {
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
                            setTierlistHeroIndex(loopCount);
                          }, 250);
                        } else if (snapIndex === lastIndex) {
                          setTimeout(() => {
                            container.scrollTo({
                              left: width,
                              behavior: "auto",
                            });
                            setTierlistHeroIndex(1);
                          }, 250);
                        } else {
                          setTierlistHeroIndex(snapIndex);
                        }
                      } else {
                        setTierlistHeroIndex(snapIndex);
                      }
                    }, 180);
                  }
                : undefined
            }
          >
            {loopSlides.length ? (
              loopSlides.map((entry, index) => {
                const isClone =
                  isLooping &&
                  (index === 0 || index === loopSlides.length - 1);
                return (
                <div
                  key={`${entry.id}-${index}`}
                  className="relative h-full min-w-full snap-start"
                >
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage: entry.header_url
                        ? `url("${resolveHeaderUrl(entry.header_url)}")`
                        : buildAccentLeakGradient(accentColor, isDarkMode),
                      backgroundPosition: entry.header_url
                        ? "center"
                        : "left center",
                      backgroundSize: entry.header_url ? "cover" : "auto",
                    }}
                  />
                  <HeroInfoPill
                    isActive={index === tierlistHeroIndex}
                    disableAnimation={isClone}
                  >
                    <div className="rounded-large border-1 border-white/20 bg-white/70 px-4 py-2 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/60 dark:text-white">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:text-white/80">
                        Featured tierlist
                      </p>
                      <p className="text-sm font-semibold">{entry.title}</p>
                      <p className="text-xs text-neutral-600 dark:text-white/70">
                        {entry.description || "Curated picks"}
                      </p>
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
                <HeroInfoPill isActive>
                  <div className="rounded-large border-1 border-white/20 bg-white/70 px-4 py-2 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/60 dark:text-white">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:text-white/80">
                      Featured tierlist
                    </p>
                    <p className="text-sm font-semibold">No tierlists yet</p>
                    <p className="text-xs text-neutral-600 dark:text-white/70">
                      Add your first tierlist to get started
                    </p>
                  </div>
                </HeroInfoPill>
              </div>
            )}
          </div>
        }
      >
        {heroSlides.length > 1 ? (
          <div
            className={`absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-2 py-1 backdrop-blur transition-opacity ${
              tierlistHeroActive
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            }`}
          >
            {range.map((page) => {
              if (page === PaginationItemType.DOTS) {
                return (
                  <span
                    key={`tierlist-hero-dots-${page}`}
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
                  key={`tierlist-dot-${pageNumber}`}
                  type="button"
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    isActive ? "bg-white" : "bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Show ${pageNumber}`}
                  onClick={() => {
                    setPage(pageNumber);
                    setTierlistHeroIndex(isLooping ? pageNumber : pageNumber - 1);
                  }}
                />
              );
            })}
          </div>
        ) : null}
        <HeroActionButton>
          <Dropdown placement="top-end">
            <DropdownTrigger>
              <Button
                isIconOnly
                className="h-16 w-16 rounded-full bg-white/70 text-neutral-900 shadow-xl backdrop-blur dark:bg-neutral-900/60 dark:text-neutral-100"
                aria-label="Tierlist actions"
              >
                <ListOrdered className="h-6 w-6" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Tierlist actions">
              <DropdownItem
                key="add-tierlist"
                startContent={<Plus className="h-4 w-4" />}
                onPress={openTierlistModal}
              >
                Add tierlist
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </HeroActionButton>
      </HeroSection>
      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search tierlists"
              className="w-full"
              size="lg"
              value={tierlistQuery}
              onValueChange={setTierlistQuery}
              startContent={
                <Search className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              }
            />
          </div>
          <Button
            isIconOnly
            size="lg"
            className="h-12 w-12 rounded-full bg-white/80 text-neutral-900 shadow-xl backdrop-blur dark:bg-neutral-900/70 dark:text-neutral-100"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                isIconOnly
                size="lg"
                className="h-12 w-12 rounded-full bg-white/80 text-neutral-900 shadow-xl backdrop-blur dark:bg-neutral-900/70 dark:text-neutral-100"
                aria-label="Tierlist actions"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Tierlist actions">
              <DropdownItem
                key="add-tierlist"
                startContent={<ListOrdered className="h-4 w-4" />}
                onPress={openTierlistModal}
              >
                Add tierlist
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button variant="flat" size="md" className="shrink-0 h-11">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort: {tierlistSortName === "az" ? "A-Z" : "Z-A"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Tierlist sort"
              onAction={(key) => setTierlistSortName(String(key))}
            >
              <DropdownItem key="az">A-Z</DropdownItem>
              <DropdownItem key="za">Z-A</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button variant="flat" size="md" className="shrink-0 h-11">
                <Clock className="mr-2 h-4 w-4" />
                Created:{" "}
                {tierlistSortDate === "na"
                  ? "N/A"
                  : tierlistSortDate === "latest"
                    ? "Latest"
                    : "Earliest"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Created date"
              onAction={(key) => setTierlistSortDate(String(key))}
            >
              <DropdownItem key="na">N/A</DropdownItem>
              <DropdownItem key="latest">Latest</DropdownItem>
              <DropdownItem key="earliest">Earliest</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <div className="grid gap-3">
        {isTierlistsLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={`tierlist-skeleton-${index}`}
                isFooterBlurred
                className="w-full h-[260px] overflow-hidden"
              >
                <Skeleton className="h-full w-full rounded-none" />
              </Card>
            ))
          : pagedTierlists.map((entry) => (
              <Card
                key={entry.id}
                isFooterBlurred
                isPressable
                className="w-full h-[260px] overflow-hidden"
                onPress={() => setSelectedTierlist(entry)}
              >
                <CardHeader className="absolute z-30 top-3 flex-col items-start">
                  <h4 className="text-white font-semibold text-xl">
                    {entry.title}
                  </h4>
                  <p className="text-xs text-white/70">
                    {entry.description || "Curated picks"}
                  </p>
                </CardHeader>
                <div className="absolute inset-x-0 top-0 z-20 h-36 bg-gradient-to-b from-black/55 via-black/20 to-transparent" />
                {entry.header_url ? (
                  <Image
                    removeWrapper
                    alt={entry.title}
                    className="z-0 w-full h-full object-cover"
                    src={resolveHeaderUrl(entry.header_url)}
                  />
                ) : (
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
                )}
                <CardFooter className="absolute bottom-0 z-20 w-full border-t-1 border-white/20 bg-black/40 backdrop-blur">
                  <div className="flex w-full items-start justify-between text-xs text-white/80">
                    <div className="space-y-1 text-left">
                      <p>{formatCheckInDate(entry.created_at)}</p>
                      <p>
                        Created by {entry.created_by_name || "Unknown"} • Last
                        edited by {entry.updated_by_name || "Unknown"}
                      </p>
                    </div>
                  </div>
                </CardFooter>
                <div className="absolute bottom-3 right-3 z-30">
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <div
                        role="button"
                        tabIndex={0}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white shadow-sm backdrop-blur transition hover:bg-black/50"
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
                    <DropdownMenu aria-label="Tierlist actions">
                      <DropdownItem
                        key="edit-tierlist"
                        startContent={<Pencil className="h-4 w-4" />}
                        onPress={() => openTierlistEdit(entry)}
                      >
                        Edit tierlist
                      </DropdownItem>
                      <DropdownItem
                        key="delete-tierlist"
                        color="danger"
                        startContent={<Trash2 className="h-4 w-4" />}
                        onPress={() => setTierlistDeleteTarget(entry)}
                      >
                        Delete tierlist
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </Card>
            ))}
        {!filteredTierlists.length && !isTierlistsLoading ? (
          <div className="rounded-2xl bg-white/80 p-4 text-sm text-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200">
            No tierlists yet. Create one to get started.
          </div>
        ) : null}
      </div>
      <Pagination
        page={tierlistPage}
        total={totalTierlistPages}
        onChange={setTierlistPage}
        className="self-center"
      />
    </section>
  );
}
