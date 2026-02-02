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
  Tab,
  Tabs,
} from "@heroui/react";
import {
  ArrowUpDown,
  Dices,
  Dumbbell,
  Filter,
  Footprints,
  Layers,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import HeroActionButton from "./HeroActionButton.jsx";
import HeroInfoPill from "./HeroInfoPill.jsx";
import HeroSection from "./HeroSection.jsx";
import StatCard from "./StatCard.jsx";
import { buildAccentLeakGradient } from "../utils/gradients.js";

export default function ActivityPage({
  latestActivityHeroUrl,
  accentColor,
  isDarkMode,
  latestDoneActivity,
  formatCheckInDate,
  openActivityModal,
  openActivityVisitSelect,
  setIsActivityDecideOpen,
  activityKpis,
  activityTopAllTime,
  activityTopYear,
  navigate,
  resolveHeaderUrl,
  activityTab,
  setActivityTab,
  activitySearchQuery,
  setActivitySearchQuery,
  activityExerciseStatus,
  setActivityExerciseStatus,
  activityExerciseCategory,
  setActivityExerciseCategory,
  activityExerciseSort,
  setActivityExerciseSort,
  activityExerciseDifficulty,
  setActivityExerciseDifficulty,
  activityBucketStatus,
  setActivityBucketStatus,
  activityBucketCategory,
  setActivityBucketCategory,
  activityBucketSort,
  setActivityBucketSort,
  ACTIVITY_EXERCISE_CATEGORIES,
  ACTIVITY_DIFFICULTY_OPTIONS,
  ACTIVITY_BUCKET_CATEGORIES,
  isActivitiesLoading,
  pagedExerciseActivities,
  pagedBucketActivities,
  openActivityVisitModal,
  fetchActivityVisitCount,
  setActivityDeleteHasVisits,
  setActivityDeleteConfirmName,
  setActivityDeleteTarget,
  activityPage,
  activityTotalPages,
  setActivityPage,
  filteredExerciseActivities,
  filteredBucketActivities,
}) {
  return (
    <section className="grid gap-6">
      <HeroSection
        heightClass="h-[40vh] min-h-[280px] md:h-[65vh] md:min-h-[520px]"
        backgroundStyle={{
          backgroundImage: latestActivityHeroUrl
            ? `url("${latestActivityHeroUrl}")`
            : buildAccentLeakGradient(accentColor, isDarkMode),
          backgroundPosition: latestActivityHeroUrl ? "center" : "left center",
          backgroundSize: latestActivityHeroUrl ? "cover" : "auto",
        }}
      >
        <HeroInfoPill>
          <div className="rounded-large border-1 border-white/20 bg-white/70 px-4 py-2 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/60 dark:text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:text-white/80">
              Latest activity
            </p>
            <p className="text-sm font-semibold">
              {latestDoneActivity?.name || "No completed activity"}
            </p>
            <p className="text-xs text-neutral-600 dark:text-white/70">
              {latestDoneActivity?.done_at
                ? formatCheckInDate(latestDoneActivity.done_at)
                : "Log an activity to get started"}
            </p>
          </div>
        </HeroInfoPill>
        <HeroActionButton>
          <Dropdown placement="top-end">
            <DropdownTrigger>
              <Button
                isIconOnly
                className="h-16 w-16 rounded-full bg-white/70 text-neutral-900 shadow-xl backdrop-blur dark:bg-neutral-900/60 dark:text-neutral-100"
                aria-label="Activity actions"
              >
                <Footprints className="h-6 w-6" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Activity actions">
              <DropdownItem
                key="add-activity"
                startContent={<Footprints className="h-4 w-4" />}
                onPress={() => openActivityModal()}
              >
                Add activity
              </DropdownItem>
              <DropdownItem
                key="add-activity-visit"
                startContent={<Plus className="h-4 w-4" />}
                onPress={openActivityVisitSelect}
              >
                Add activity visit
              </DropdownItem>
              <DropdownItem
                key="decide-activity"
                startContent={<Dices className="h-4 w-4" />}
                onPress={() => setIsActivityDecideOpen(true)}
              >
                Decide for me
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </HeroActionButton>
      </HeroSection>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Activities", value: activityKpis.total },
          { label: "Done all time", value: activityKpis.doneAll },
          { label: "Done this year", value: activityKpis.doneYear },
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
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Top all time", entry: activityTopAllTime },
          { label: "Top this year", entry: activityTopYear },
        ].map((item) => {
          const Icon =
            item.entry?.activity_type === "bucket" ? ListChecks : Dumbbell;
          const entryImage = item.entry?.image_url || "";
          const entryPath = item.entry
            ? `/activities/${
                item.entry.activity_type === "bucket"
                  ? "bucketlist"
                  : "exercise"
              }/${item.entry.id}`
            : null;
          return (
            <Card
              key={item.label}
              isFooterBlurred
              radius="lg"
              className="border-none aspect-square overflow-hidden"
              isPressable={Boolean(entryPath)}
              onPress={() => {
                if (entryPath) {
                  navigate(entryPath);
                }
              }}
            >
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: entryImage
                    ? `url("${resolveHeaderUrl(entryImage)}")`
                    : buildAccentLeakGradient(accentColor, isDarkMode),
                  backgroundPosition: entryImage ? "center" : "left center",
                  backgroundSize: entryImage ? "cover" : "auto",
                }}
              />
              <CardFooter className="border-1 border-white/20 bg-white/70 py-2 absolute bottom-1 w-[calc(100%_-_8px)] rounded-large shadow-small ml-1 z-10 text-neutral-900 backdrop-blur dark:bg-neutral-900/70 dark:text-white">
                <div className="grid gap-2 text-left text-xs">
                  <p className="text-[10px] uppercase font-semibold tracking-wide text-neutral-600 dark:text-white/80">
                    {item.label}
                  </p>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-neutral-500 dark:text-white/80" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold line-clamp-2">
                        {item.entry?.name || "No activity yet"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <Tabs
        aria-label="Activity tabs"
        selectedKey={activityTab}
        onSelectionChange={(key) => {
          if (typeof key === "string") {
            setActivityTab(key);
          }
        }}
        className="w-full"
        variant="light"
        classNames={{
          tabList:
            "w-full gap-2 rounded-full p-1 bg-white/70 dark:bg-neutral-900/60",
          tab: "flex-1 h-auto rounded-full py-2.5",
          tabContent: "flex items-center gap-2 text-sm font-semibold",
          cursor: "rounded-full",
        }}
      >
        <Tab
          key="exercise"
          title={
            <span className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Exercise
            </span>
          }
        />
        <Tab
          key="bucket"
          title={
            <span className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Bucket list
            </span>
          }
        />
      </Tabs>
      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={`Search ${
                activityTab === "exercise" ? "exercise" : "bucket list"
              }`}
              className="w-full"
              size="lg"
              value={activitySearchQuery}
              onValueChange={setActivitySearchQuery}
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
                aria-label="Activity actions"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Activity actions">
              <DropdownItem
                key="add-activity"
                startContent={<Footprints className="h-4 w-4" />}
                onPress={() => openActivityModal()}
              >
                Add activity
              </DropdownItem>
              <DropdownItem
                key="add-activity-visit"
                startContent={<Plus className="h-4 w-4" />}
                onPress={openActivityVisitSelect}
              >
                Add activity visit
              </DropdownItem>
              <DropdownItem
                key="decide-activity"
                startContent={<Dices className="h-4 w-4" />}
                onPress={() => setIsActivityDecideOpen(true)}
              >
                Decide for me
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activityTab === "exercise" ? (
            <>
              <Dropdown placement="bottom-start">
                <DropdownTrigger>
                  <Button variant="flat" className="shrink-0 h-10">
                    <Filter className="mr-2 h-4 w-4" />
                    Status:{" "}
                    {activityExerciseStatus === "all"
                      ? "All"
                      : activityExerciseStatus === "done"
                        ? "Done"
                        : "Not done"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Exercise status"
                  onAction={(key) => setActivityExerciseStatus(String(key))}
                >
                  <DropdownItem key="all">All</DropdownItem>
                  <DropdownItem key="done">Done</DropdownItem>
                  <DropdownItem key="not_done">Not done</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Dropdown placement="bottom-start">
                <DropdownTrigger>
                  <Button variant="flat" className="shrink-0 h-10">
                    <Layers className="mr-2 h-4 w-4" />
                    Category:{" "}
                    {activityExerciseCategory === "all"
                      ? "All"
                      : ACTIVITY_EXERCISE_CATEGORIES.find(
                          (entry) => entry.value === activityExerciseCategory,
                        )?.label || "All"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Exercise category"
                  onAction={(key) => setActivityExerciseCategory(String(key))}
                >
                  <DropdownItem key="all">All</DropdownItem>
                  {ACTIVITY_EXERCISE_CATEGORIES.map((entry) => (
                    <DropdownItem key={entry.value}>{entry.label}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Dropdown placement="bottom-start">
                <DropdownTrigger>
                  <Button variant="flat" className="shrink-0 h-10">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort: {activityExerciseSort === "az" ? "A-Z" : "Z-A"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Exercise sort"
                  onAction={(key) => setActivityExerciseSort(String(key))}
                >
                  <DropdownItem key="az">A-Z</DropdownItem>
                  <DropdownItem key="za">Z-A</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Dropdown placement="bottom-start">
                <DropdownTrigger>
                  <Button variant="flat" className="shrink-0 h-10">
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Difficulty:{" "}
                    {activityExerciseDifficulty === "all"
                      ? "All"
                      : ACTIVITY_DIFFICULTY_OPTIONS.find(
                          (entry) =>
                            entry.value === activityExerciseDifficulty,
                        )?.label || "All"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Exercise difficulty"
                  onAction={(key) => setActivityExerciseDifficulty(String(key))}
                >
                  <DropdownItem key="all">All</DropdownItem>
                  {ACTIVITY_DIFFICULTY_OPTIONS.map((entry) => (
                    <DropdownItem key={entry.value}>{entry.label}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </>
          ) : (
            <>
              <Dropdown placement="bottom-start">
                <DropdownTrigger>
                  <Button variant="flat" className="shrink-0 h-10">
                    <Filter className="mr-2 h-4 w-4" />
                    Status:{" "}
                    {activityBucketStatus === "all"
                      ? "All"
                      : activityBucketStatus === "done"
                        ? "Done"
                        : "Not done"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Bucket status"
                  onAction={(key) => setActivityBucketStatus(String(key))}
                >
                  <DropdownItem key="all">All</DropdownItem>
                  <DropdownItem key="done">Done</DropdownItem>
                  <DropdownItem key="not_done">Not done</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Dropdown placement="bottom-start">
                <DropdownTrigger>
                  <Button variant="flat" className="shrink-0 h-10">
                    <Layers className="mr-2 h-4 w-4" />
                    Category:{" "}
                    {activityBucketCategory === "all"
                      ? "All"
                      : ACTIVITY_BUCKET_CATEGORIES.find(
                          (entry) => entry.value === activityBucketCategory,
                        )?.label || "All"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Bucket category"
                  onAction={(key) => setActivityBucketCategory(String(key))}
                >
                  <DropdownItem key="all">All</DropdownItem>
                  {ACTIVITY_BUCKET_CATEGORIES.map((entry) => (
                    <DropdownItem key={entry.value}>{entry.label}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Dropdown placement="bottom-start">
                <DropdownTrigger>
                  <Button variant="flat" className="shrink-0 h-10">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort: {activityBucketSort === "az" ? "A-Z" : "Z-A"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Bucket sort"
                  onAction={(key) => setActivityBucketSort(String(key))}
                >
                  <DropdownItem key="az">A-Z</DropdownItem>
                  <DropdownItem key="za">Z-A</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {isActivitiesLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={`activity-skeleton-${index}`}
                radius="lg"
                className="border-none overflow-hidden"
              >
                <Skeleton className="h-44 w-full" />
              </Card>
            ))
          : (
              <AnimatePresence>
                {(activityTab === "exercise"
                  ? pagedExerciseActivities
                  : pagedBucketActivities
                ).map((item, index) => {
                  const categoryLabel =
                    ACTIVITY_EXERCISE_CATEGORIES.find(
                      (entry) => entry.value === item.category,
                    )?.label || "Exercise";
              const bucketCategoryLabel =
                ACTIVITY_BUCKET_CATEGORIES.find(
                  (entry) => entry.value === item.category,
                )?.label || "Bucket list";
              const difficultyLabel =
                ACTIVITY_DIFFICULTY_OPTIONS.find(
                  (entry) => entry.value === item.difficulty,
                )?.label || null;
              const activityImage = item.image_url
                ? resolveHeaderUrl(item.image_url)
                : null;
              return (
                <motion.div
                  key={item.id}
                  className="h-full w-full"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{
                    duration: 0.35,
                    ease: "easeOut",
                    delay: Math.min(index * 0.06, 0.4),
                  }}
                >
                  <Card
                    isPressable
                    radius="lg"
                    className="border-none overflow-hidden h-full w-full"
                    onPress={() =>
                      navigate(
                        `/activities/${
                          item.activity_type === "bucket"
                            ? "bucketlist"
                            : "exercise"
                        }/${item.id}`,
                      )
                    }
                  >
                  <CardBody className="relative overflow-visible p-0">
                    {activityImage ? (
                      <HeroImage
                        alt={item.name}
                        className="w-full object-cover h-[160px] rounded-b-none relative z-0"
                        src={activityImage}
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
                        <DropdownMenu aria-label="Activity actions">
                          <DropdownItem
                            key="edit-activity"
                            startContent={<Pencil className="h-4 w-4" />}
                            onPress={() => openActivityModal(item)}
                          >
                            Edit activity
                          </DropdownItem>
                          <DropdownItem
                            key="add-activity-visit"
                            startContent={<Plus className="h-4 w-4" />}
                            onPress={() => openActivityVisitModal(item)}
                          >
                            Add visit
                          </DropdownItem>
                          <DropdownItem
                            key="delete-activity"
                            color="danger"
                            startContent={<Trash2 className="h-4 w-4" />}
                            onPress={async () => {
                              try {
                                const total = await fetchActivityVisitCount(
                                  item.id,
                                );
                                setActivityDeleteHasVisits(total > 0);
                              } catch (error) {
                                setActivityDeleteHasVisits(false);
                              }
                              setActivityDeleteConfirmName("");
                              setActivityDeleteTarget(item);
                            }}
                          >
                            Delete activity
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </CardBody>
                  <CardFooter className="bg-white text-left text-neutral-900 dark:bg-neutral-900 dark:text-white">
                    <div className="flex w-full flex-col items-start gap-1 text-xs text-neutral-600 dark:text-white/70">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="w-full truncate">{item.address}</p>
                      {item.activity_type === "exercise" ? (
                        <p className="truncate">
                          {categoryLabel}
                          {difficultyLabel ? ` • ${difficultyLabel}` : ""}
                        </p>
                      ) : (
                        <p className="truncate">{bucketCategoryLabel}</p>
                      )}
                      <div className="pt-2 text-xs text-neutral-600 dark:text-white/70">
                        {item.done_at ? (
                          <div>
                            <p className="text-[10px] uppercase font-semibold tracking-wide text-neutral-500 dark:text-white/60">
                              Latest visit
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-white/70">
                              {formatCheckInDate(item.done_at) || "Unknown date"}
                            </p>
                          </div>
                        ) : (
                          "No visits yet"
                        )}
                      </div>
                    </div>
                  </CardFooter>
                  </Card>
                </motion.div>
              );
                })}
              </AnimatePresence>
            )}
        {!isActivitiesLoading &&
        activityTab === "exercise" &&
        filteredExerciseActivities.length === 0 ? (
          <div className="col-span-2 rounded-2xl bg-white/80 p-4 text-sm text-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200">
            No exercise activities match your filters.
          </div>
        ) : null}
        {!isActivitiesLoading &&
        activityTab === "bucket" &&
        filteredBucketActivities.length === 0 ? (
          <div className="col-span-2 rounded-2xl bg-white/80 p-4 text-sm text-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200">
            No bucket list items match your filters.
          </div>
        ) : null}
      </div>
      <Pagination
        page={activityPage}
        total={activityTotalPages}
        onChange={setActivityPage}
        className="self-center"
      />
    </section>
  );
}
