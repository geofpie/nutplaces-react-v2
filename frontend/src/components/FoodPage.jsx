import { useRef } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image as HeroImage,
  Input,
  Pagination,
  Skeleton,
} from "@heroui/react";
import {
  ArrowUpDown,
  Dices,
  Filter,
  Layers,
  MapPinned,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Utensils,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "./HeroSection.jsx";
import HeroInfoPill from "./HeroInfoPill.jsx";
import HeroActionButton from "./HeroActionButton.jsx";
import StatCard from "./StatCard.jsx";

export default function FoodPage({
  featuredFoodHeroUrl,
  featuredFood,
  resolveHeaderUrl,
  buildAccentLeakGradient,
  accentColor,
  isDarkMode,
  openFoodPlaceModal,
  setIsFoodVisitSelectOpen,
  setIsHelpDecideOpen,
  foodStats,
  navigate,
  foodSearchQuery,
  setFoodSearchQuery,
  foodSearchError,
  setFoodSearchError,
  handleFoodSearch,
  foodFilterStatus,
  setFoodFilterStatus,
  foodCategoryFilter,
  setFoodCategoryFilter,
  FOOD_CUISINE_OPTIONS,
  foodSortName,
  setFoodSortName,
  foodSortRating,
  setFoodSortRating,
  isFoodLoading,
  foodPlaces,
  renderStarRowCompact,
  openFoodPlaceEdit,
  openFoodVisitModal,
  setFoodPlaceDeleteTarget,
  foodPage,
  foodTotal,
  FOOD_ITEMS_PER_PAGE,
  setFoodPage,
}) {
  const foodGridRef = useRef(null);

  const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };
  const shouldAnimateFoodGrid = Boolean(foodPlaces.length);
  return (
    <section className="grid gap-6">
      <HeroSection
        heightClass="h-[40vh] min-h-[280px] md:h-[65vh] md:min-h-[520px]"
        backgroundStyle={{
          backgroundImage: featuredFoodHeroUrl
            ? `url(\"${resolveHeaderUrl(featuredFoodHeroUrl)}\")`
            : buildAccentLeakGradient(accentColor, isDarkMode),
          backgroundPosition: featuredFoodHeroUrl ? "center" : "left center",
          backgroundSize: featuredFoodHeroUrl ? "cover" : "auto",
        }}
      >
        <HeroInfoPill>
          <div className="flex items-center gap-3 rounded-large border-1 border-white/20 bg-white/70 px-4 py-2 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:text-white/80">
                Featured place
              </p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {featuredFood?.name || "No places yet"}
              </p>
            </div>
          </div>
        </HeroInfoPill>
        <HeroActionButton>
          <Dropdown placement="top-end">
            <DropdownTrigger>
              <Button
                isIconOnly
                className="h-16 w-16 rounded-full bg-white/70 text-neutral-900 shadow-xl backdrop-blur dark:bg-neutral-900/60 dark:text-neutral-100"
              >
                <Utensils className="h-6 w-6" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Food actions">
              <DropdownItem
                key="add-place"
                startContent={<MapPinned className="h-4 w-4" />}
                onPress={openFoodPlaceModal}
              >
                Add food place
              </DropdownItem>
              <DropdownItem
                key="add-visit"
                startContent={<Utensils className="h-4 w-4" />}
                onPress={() => setIsFoodVisitSelectOpen(true)}
              >
                Add food visit
              </DropdownItem>
              <DropdownItem
                key="help-decide"
                startContent={<Dices className="h-4 w-4" />}
                onPress={() => setIsHelpDecideOpen(true)}
              >
                Help me decide
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </HeroActionButton>
      </HeroSection>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total places", value: foodStats.total },
          { label: "Places visited", value: foodStats.visited },
          { label: "Visits this year", value: foodStats.year },
        ].map((item, index) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            accentColor={accentColor}
            isDarkMode={isDarkMode}
            gradientConfig={[
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
              {
                angle: 320,
                spotA: "18% 12%",
                spotB: "78% 24%",
              },
            ][index % 3]}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "All-time top", entry: foodStats.top_all_time },
          { label: "This year top", entry: foodStats.top_year },
        ].map((item) => (
          <Card
            key={item.label}
            isFooterBlurred
            radius="lg"
            className="border-none aspect-square overflow-hidden"
            isPressable={Boolean(item.entry?.id)}
            onPress={() => {
              if (item.entry?.id) {
                navigate(`/food/place/${item.entry.id}`);
              }
            }}
          >
            <div
              className="h-full w-full"
              style={{
                backgroundImage: item.entry?.header_url
                  ? `url(\"${resolveHeaderUrl(item.entry.header_url)}\")`
                  : buildAccentLeakGradient(accentColor, isDarkMode),
                backgroundSize: item.entry?.header_url ? "cover" : "auto",
                backgroundPosition: item.entry?.header_url
                  ? "center"
                  : "left center",
              }}
            />
            <CardFooter className="border-1 border-white/20 bg-white/70 py-2 absolute bottom-1 w-[calc(100%_-_8px)] rounded-large shadow-small ml-1 z-10 text-neutral-900 backdrop-blur dark:bg-neutral-900/70 dark:text-white">
              <div className="text-left">
                <p className="text-[10px] uppercase font-semibold tracking-wide text-neutral-600 dark:text-white/80">
                  {item.label}
                </p>
                <p className="text-sm font-semibold">
                  {item.entry?.name || "No visits yet"}
                </p>
                <p className="text-xs text-neutral-600 dark:text-white/70">
                  {item.entry
                    ? `${item.entry.count} visits`
                    : "Add your first visit"}
                </p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search food places"
              className="w-full"
              size="lg"
              value={foodSearchQuery}
              onValueChange={(value) => {
                setFoodSearchQuery(value);
                if (foodSearchError) {
                  setFoodSearchError(false);
                }
              }}
              isInvalid={foodSearchError}
              startContent={
                <Search className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleFoodSearch();
                }
              }}
            />
            {foodSearchError ? (
              <div className="pointer-events-none absolute -top-9 left-2 z-10 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                Please enter a search query.
              </div>
            ) : null}
          </div>
          <Button
            isIconOnly
            size="lg"
            onPress={handleFoodSearch}
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
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Food actions">
              <DropdownItem
                key="add-place"
                startContent={<MapPinned className="h-4 w-4" />}
                onPress={openFoodPlaceModal}
              >
                Add food place
              </DropdownItem>
              <DropdownItem
                key="add-visit"
                startContent={<Utensils className="h-4 w-4" />}
                onPress={() => setIsFoodVisitSelectOpen(true)}
              >
                Add food visit
              </DropdownItem>
              <DropdownItem
                key="help-decide"
                startContent={<Dices className="h-4 w-4" />}
                onPress={() => setIsHelpDecideOpen(true)}
              >
                Help me decide
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button
                variant="flat"
                className="shrink-0"
                startContent={<Filter className="h-4 w-4" />}
              >
                Status:{" "}
                {foodFilterStatus === "all"
                  ? "All"
                  : foodFilterStatus === "visited"
                    ? "Visited"
                    : "Not visited"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filter status"
              onAction={(key) => setFoodFilterStatus(String(key))}
            >
              <DropdownItem key="all">All</DropdownItem>
              <DropdownItem key="visited">Visited</DropdownItem>
              <DropdownItem key="not_visited">Not visited</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button
                variant="flat"
                className="shrink-0"
                startContent={<Layers className="h-4 w-4" />}
              >
                Category:{" "}
                {foodCategoryFilter === "all" ? "All" : foodCategoryFilter}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filter category"
              onAction={(key) => setFoodCategoryFilter(String(key))}
            >
              <DropdownItem key="all">All</DropdownItem>
              {Object.keys(FOOD_CUISINE_OPTIONS).map((category) => (
                <DropdownItem key={category}>{category}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button
                variant="flat"
                className="shrink-0"
                startContent={<ArrowUpDown className="h-4 w-4" />}
              >
                Sort: {foodSortName === "az" ? "A-Z" : "Z-A"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Sort name"
              onAction={(key) => setFoodSortName(String(key))}
            >
              <DropdownItem key="az">A-Z</DropdownItem>
              <DropdownItem key="za">Z-A</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <Button
                variant="flat"
                className="shrink-0"
                startContent={<Star className="h-4 w-4" />}
              >
                Rating:{" "}
                {foodSortRating === "na"
                  ? "N/A"
                  : foodSortRating === "low"
                    ? "Low to high"
                    : "High to low"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Sort rating"
              onAction={(key) => setFoodSortRating(String(key))}
            >
              <DropdownItem key="na">N/A</DropdownItem>
              <DropdownItem key="low">Low to high</DropdownItem>
              <DropdownItem key="high">High to low</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      {isFoodLoading && !foodPlaces.length ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`food-skeleton-${index}`}
              radius="lg"
              className="border-none overflow-hidden"
            >
              <Skeleton className="h-44 w-full" />
            </Card>
          ))}
        </div>
      ) : foodPlaces.length ? (
        <motion.div
          ref={foodGridRef}
          className="grid grid-cols-2 gap-3 items-stretch"
        >
          <AnimatePresence>
            {foodPlaces.map((place, index) => (
              <motion.div
                key={place.id}
                className="h-full w-full"
                initial="hidden"
                animate={shouldAnimateFoodGrid ? "show" : "hidden"}
                variants={itemVariants}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                  delay: Math.min(index * 0.06, 0.4),
                }}
                exit="exit"
              >
                <Card
                  isPressable
                  radius="lg"
                  className="border-none overflow-hidden h-full w-full"
                  onPress={() => navigate(`/food/place/${place.id}`)}
                >
              <CardBody className="relative overflow-visible p-0">
                {place.header_url ? (
                  <HeroImage
                    alt={place.name}
                    className="w-full object-cover h-[160px] rounded-b-none relative z-0"
                    src={resolveHeaderUrl(place.header_url)}
                  />
                ) : (
                  <div
                    className="h-[160px] w-full relative z-0"
                    style={{
                      backgroundImage: buildAccentLeakGradient(
                        accentColor,
                        isDarkMode,
                      ),
                      backgroundPosition: "left center",
                    }}
                  />
                )}
                <div className="absolute right-2 top-2 z-10">
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <div
                        role="button"
                        tabIndex={0}
                        className="flex h-8 w-8 items-center justify-center rounded-medium bg-white/70 text-neutral-900 shadow-sm backdrop-blur transition data-[hover=true]:bg-white/80 dark:bg-neutral-900/70 dark:text-neutral-100"
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
                    <DropdownMenu aria-label="Food place actions">
                      <DropdownItem
                        key="edit-place"
                        startContent={<Pencil className="h-4 w-4" />}
                        onPress={() => openFoodPlaceEdit(place)}
                      >
                        Edit place
                      </DropdownItem>
                      <DropdownItem
                        key="add-visit"
                        startContent={<Plus className="h-4 w-4" />}
                        onPress={() => openFoodVisitModal(place)}
                      >
                        Add visit
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
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </CardBody>
              <CardFooter className="items-start justify-start bg-white text-left text-neutral-900 dark:bg-neutral-900 dark:text-white">
                <div className="flex w-full items-start justify-between gap-3">
                  <div className="flex w-full flex-col items-start gap-1 text-xs text-neutral-600 dark:text-white/70">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {place.name}
                    </p>
                    <p className="w-full truncate">{place.location_label}</p>
                    <p className="truncate">{place.cuisine || "Cuisine"}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        {renderStarRowCompact(
                          place.avg_rating || 0,
                          `${place.id}-list`,
                        )}
                      </div>
                      <span className="text-xs text-neutral-700 dark:text-white/70">
                        {(place.avg_rating ?? 0).toFixed(1)}
                      </span>
                    </div>
                    <div className="pt-2 text-xs text-neutral-600 dark:text-white/70">
                      {place.visit_count ?? 0} visits
                    </div>
                  </div>
                </div>
              </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="rounded-2xl bg-white/80 p-4 text-sm text-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200">
          No food places yet. Add your first spot to get started.
        </div>
      )}
      <Pagination
        page={foodPage}
        total={Math.max(1, Math.ceil(foodTotal / FOOD_ITEMS_PER_PAGE))}
        onChange={setFoodPage}
        className="self-center"
      />
    </section>
  );
}
