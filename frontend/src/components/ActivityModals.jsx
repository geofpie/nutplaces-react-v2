import {
  Avatar,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DatePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image as HeroImage,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
  Switch,
  Textarea,
} from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { getLocalTimeZone, today } from "@internationalized/date";
import { motion } from "framer-motion";
import {
  Loader2,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { buildAccentLeakGradient, buildAccentKpiGradient } from "../utils/gradients.js";
import ImageCropperModal from "./ImageCropperModal.jsx";

function ActivityModal({
  isOpen,
  onOpenChange,
  modalMotionProps,
  activityEditing,
  activityImagePreview,
  isActivityCropSaving,
  accentColor,
  isDarkMode,
  activityName,
  activityAddress,
  activityType,
  activityImageInputRef,
  handleActivityImageChange,
  setActivityImagePreview,
  setActivityImageData,
  setActivityImageChanged,
  setActivityType,
  setActivityBucketFormCategory,
  setActivityDifficulty,
  setActivityCategory,
  activityNameExists,
  setActivityName,
  setActivityNameExists,
  isDuplicateNameInList,
  activities,
  activityLocationQuery,
  setActivityLocationQuery,
  fetchActivityLocationSearch,
  isActivitySearchingLocation,
  activityLocationResults,
  activitySelectedLocation,
  isActivityLocationCollapsed,
  setActivityAddress,
  setActivitySelectedLocation,
  setIsActivityLocationCollapsed,
  activityCategory,
  activityDifficulty,
  activityBucketFormCategory,
  activityDescription,
  setActivityDescription,
  handleActivitySave,
  isActivitySaving,
  ACTIVITY_EXERCISE_CATEGORIES,
  ACTIVITY_DIFFICULTY_OPTIONS,
  ACTIVITY_BUCKET_CATEGORIES,
}) {
  return (
    <Modal
  hideCloseButton
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      size="lg"
      motionProps={modalMotionProps}
    >
      <ModalContent className="mx-4 my-6 max-h-[calc(100vh-3rem)] overflow-hidden">
        {(onClose) => (
          <>
            <ModalBody className="gap-4 overflow-y-auto p-0">
              <div className="relative">
                <p className="absolute left-6 top-4 z-20 text-lg font-semibold text-white drop-shadow">
                  {activityEditing ? "Edit activity" : "Add activity"}
                </p>
                <div className="relative overflow-hidden rounded-large rounded-b-none">
                  {activityImagePreview ? (
                    <HeroImage
                      alt="Activity preview"
                      className="w-full object-cover aspect-[3/2] rounded-b-none"
                      src={activityImagePreview}
                      width={600}
                    />
                  ) : (
                    <div
                      className="w-full aspect-[3/2]"
                      style={{
                        backgroundImage: buildAccentLeakGradient(
                          accentColor,
                          isDarkMode,
                        ),
                      }}
                    />
                  )}
                  {isActivityCropSaving ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  ) : null}
                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="rounded-large border-1 border-white/20 bg-white/75 px-3 py-2 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/70 dark:text-white">
                      <p className="text-sm font-semibold">
                        {activityName || "Activity name"}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-white/70">
                        {activityAddress || "Location"}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-white/70">
                        {activityType === "exercise"
                          ? "Exercise"
                          : "Bucket list"}
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 z-20">
                    <Dropdown placement="top-end">
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="solid">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Activity image actions">
                        <DropdownItem
                          key="upload-activity"
                          startContent={<Upload className="h-4 w-4" />}
                          onPress={() => activityImageInputRef.current?.click()}
                        >
                          Upload photo
                        </DropdownItem>
                        <DropdownItem
                          key="delete-activity-image"
                          color="danger"
                          startContent={<Trash2 className="h-4 w-4" />}
                          isDisabled={!activityImagePreview}
                          onPress={() => {
                            setActivityImagePreview("");
                            setActivityImageData("");
                            setActivityImageChanged(true);
                          }}
                        >
                          Delete photo
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <input
                    ref={activityImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleActivityImageChange}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 px-6 pb-6">
                <div className="grid gap-2">
                  <p className="text-sm font-semibold">Activity type</p>
                  <ButtonGroup radius="full" size="sm" variant="bordered">
                    {[
                      { label: "Exercise", value: "exercise" },
                      { label: "Bucket list", value: "bucket" },
                    ].map((option) => {
                      const isSelected = activityType === option.value;
                      return (
                        <Button
                          key={option.value}
                          variant={isSelected ? "solid" : "flat"}
                          color={isSelected ? "primary" : "default"}
                          onPress={() => {
                            setActivityType(option.value);
                            if (option.value === "bucket") {
                              setActivityBucketFormCategory(
                                ACTIVITY_BUCKET_CATEGORIES[0].value,
                              );
                              setActivityDifficulty("easy");
                            } else {
                              setActivityCategory("hike");
                            }
                          }}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                </div>
                <Input
                  label="Name"
                  placeholder="Enter activity name"
                  value={activityName}
                  onValueChange={(value) => {
                    setActivityName(value);
                    setActivityNameExists(
                      isDuplicateNameInList(
                        value,
                        activities,
                        activityEditing?.id,
                      ),
                    );
                  }}
                  isInvalid={activityNameExists}
                  errorMessage="Activity already exists"
                />
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      label="Address search"
                      placeholder="Search for a place"
                      className="flex-1"
                      size="lg"
                      value={activityLocationQuery}
                      onChange={(event) =>
                        setActivityLocationQuery(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          fetchActivityLocationSearch(activityLocationQuery);
                        }
                      }}
                    />
                    <Button
                      isIconOnly
                      variant="flat"
                      size="lg"
                      aria-label="Search location"
                      onPress={() =>
                        fetchActivityLocationSearch(activityLocationQuery)
                      }
                      isLoading={isActivitySearchingLocation}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <div
                    className={`grid gap-2 transition-[max-height,opacity] duration-300 ease-out ${
                      isActivitySearchingLocation ||
                      activityLocationResults.length
                        ? "max-h-[520px] opacity-100 overflow-visible"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    {isActivitySearchingLocation
                      ? Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={`activity-skeleton-${index}`}
                            className="flex w-full max-w-[300px] items-center gap-3"
                          >
                            <Skeleton className="flex h-12 w-12 rounded-full" />
                            <div className="flex w-full flex-col gap-2">
                              <Skeleton className="h-3 w-3/5 rounded-lg" />
                              <Skeleton className="h-3 w-4/5 rounded-lg" />
                            </div>
                          </div>
                        ))
                      : (isActivityLocationCollapsed && activitySelectedLocation
                          ? [activitySelectedLocation]
                          : activityLocationResults
                        ).map((result) => (
                          <Card
                            key={result.id}
                            className={`overflow-hidden border ${
                              activityAddress === result.formatted
                                ? "border-neutral-900/50 dark:border-white/60"
                                : "border-transparent"
                            } bg-white/80 dark:bg-neutral-900/70`}
                            shadow="sm"
                            isPressable
                            onPress={() => {
                              setActivityAddress(result.formatted);
                              setActivityLocationQuery(result.name);
                              setActivitySelectedLocation(result);
                              setIsActivityLocationCollapsed(true);
                            }}
                          >
                            <CardBody className="gap-1">
                              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {result.name}
                              </p>
                              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                                {result.formatted}
                              </p>
                            </CardBody>
                          </Card>
                        ))}
                    {isActivityLocationCollapsed &&
                    activityLocationResults.length > 1 ? (
                      <Button
                        variant="light"
                        size="sm"
                        onPress={() => setIsActivityLocationCollapsed(false)}
                      >
                        View more
                      </Button>
                    ) : null}
                  </div>
                </div>
                {activityType === "exercise" ? (
                  <>
                    <div className="grid gap-2">
                      <p className="text-sm font-semibold">Category</p>
                      <Dropdown placement="bottom-start">
                        <DropdownTrigger>
                          <Button variant="flat">
                            {ACTIVITY_EXERCISE_CATEGORIES.find(
                              (entry) => entry.value === activityCategory,
                            )?.label || "Select category"}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Exercise category"
                          onAction={(key) => setActivityCategory(String(key))}
                        >
                          {ACTIVITY_EXERCISE_CATEGORIES.map((entry) => (
                            <DropdownItem key={entry.value}>
                              {entry.label}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    <div className="grid gap-2">
                      <p className="text-sm font-semibold">Difficulty</p>
                      <Dropdown placement="bottom-start">
                        <DropdownTrigger>
                          <Button variant="flat">
                            {ACTIVITY_DIFFICULTY_OPTIONS.find(
                              (entry) => entry.value === activityDifficulty,
                            )?.label || "Select difficulty"}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Exercise difficulty"
                          onAction={(key) => setActivityDifficulty(String(key))}
                        >
                          {ACTIVITY_DIFFICULTY_OPTIONS.map((entry) => (
                            <DropdownItem key={entry.value}>
                              {entry.label}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-2">
                    <p className="text-sm font-semibold">Category</p>
                    <Dropdown placement="bottom-start">
                      <DropdownTrigger>
                        <Button variant="flat">
                          {ACTIVITY_BUCKET_CATEGORIES.find(
                            (entry) => entry.value === activityBucketFormCategory,
                          )?.label || "Select category"}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Bucket list category"
                        onAction={(key) =>
                          setActivityBucketFormCategory(String(key))
                        }
                      >
                        {ACTIVITY_BUCKET_CATEGORIES.map((entry) => (
                          <DropdownItem key={entry.value}>
                            {entry.label}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                )}
                <Textarea
                  label="Description"
                  placeholder="Add notes about this activity"
                  value={activityDescription}
                  onValueChange={setActivityDescription}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleActivitySave}
                isLoading={isActivitySaving}
                isDisabled={isActivitySaving}
              >
                {activityEditing ? "Update activity" : "Save activity"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function ActivityVisitModal({
  isOpen,
  onOpenChange,
  modalMotionProps,
  activityVisitEditing,
  activityVisitPhotoPreview,
  isActivityVisitCropSaving,
  accentColor,
  isDarkMode,
  activityVisitTitle,
  setActivityVisitTitle,
  activityVisitActivity,
  activityVisitInputRef,
  handleActivityVisitPhotoChange,
  setActivityVisitPhotoPreview,
  setActivityVisitPhotoData,
  setActivityVisitPhotoChanged,
  activityVisitDate,
  setActivityVisitDate,
  activityVisitDistance,
  setActivityVisitDistance,
  activityVisitRating,
  setActivityVisitRating,
  activityVisitDescription,
  setActivityVisitDescription,
  handleActivityVisitSave,
  isActivityVisitSaving,
  ACTIVITY_EXERCISE_CATEGORIES,
  ACTIVITY_BUCKET_CATEGORIES,
}) {
  const isDistanceVisit =
    activityVisitActivity?.activity_type === "exercise" &&
    ["hike", "cycle"].includes(activityVisitActivity?.category);
  const activityVisitCategoryLabel =
    activityVisitActivity?.activity_type === "exercise"
      ? ACTIVITY_EXERCISE_CATEGORIES.find(
          (entry) => entry.value === activityVisitActivity?.category,
        )?.label
      : ACTIVITY_BUCKET_CATEGORIES.find(
          (entry) => entry.value === activityVisitActivity?.category,
        )?.label;

  return (
    <Modal
  hideCloseButton
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      size="lg"
      motionProps={modalMotionProps}
    >
      <ModalContent className="mx-4 my-6 max-h-[calc(100vh-3rem)] overflow-hidden">
        {(onClose) => (
          <>
            <ModalBody className="gap-4 overflow-y-auto p-0">
              <div className="relative">
                <p className="absolute left-6 top-4 z-20 text-lg font-semibold text-white drop-shadow">
                  {activityVisitEditing ? "Edit visit" : "Add activity visit"}
                </p>
                <div className="relative overflow-hidden rounded-large rounded-b-none">
                  {activityVisitPhotoPreview ? (
                    <HeroImage
                      alt="Activity visit preview"
                      className="w-full object-cover aspect-[3/2] rounded-b-none"
                      src={activityVisitPhotoPreview}
                      width={600}
                    />
                  ) : (
                    <div
                      className="w-full aspect-[3/2]"
                      style={{
                        backgroundImage: buildAccentLeakGradient(
                          accentColor,
                          isDarkMode,
                        ),
                      }}
                    />
                  )}
                  {isActivityVisitCropSaving ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  ) : null}
                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="rounded-large border-1 border-white/20 bg-white/75 px-3 py-2 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/70 dark:text-white">
                      <p className="text-sm font-semibold">
                        {activityVisitTitle || "Visit title"}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-white/70">
                        {activityVisitActivity?.name || "Activity"}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-white/70">
                        {activityVisitActivity?.address || "Location"}
                      </p>
                      {activityVisitCategoryLabel ? (
                        <p className="text-xs text-neutral-600 dark:text-white/70">
                          {activityVisitCategoryLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 z-20">
                    <Dropdown placement="top-end">
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="solid">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Activity visit photo actions">
                        <DropdownItem
                          key="upload-activity-visit-photo"
                          startContent={<Upload className="h-4 w-4" />}
                          onPress={() =>
                            activityVisitInputRef.current?.click()
                          }
                        >
                          Upload photo
                        </DropdownItem>
                        <DropdownItem
                          key="delete-activity-visit-photo"
                          color="danger"
                          startContent={<Trash2 className="h-4 w-4" />}
                          isDisabled={!activityVisitPhotoPreview}
                          onPress={() => {
                            setActivityVisitPhotoPreview("");
                            setActivityVisitPhotoData(null);
                            setActivityVisitPhotoChanged(true);
                          }}
                        >
                          Delete photo
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <input
                    ref={activityVisitInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleActivityVisitPhotoChange}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 px-6 pb-6">
                <div className="grid gap-2">
                  <I18nProvider locale="en-GB">
                    <DatePicker
                      label="Date"
                      className="w-full"
                      value={activityVisitDate}
                      onChange={setActivityVisitDate}
                      showMonthAndYearPickers
                      formatOptions={{
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }}
                    />
                  </I18nProvider>
                  <ButtonGroup
                    fullWidth
                    className="px-3 pb-2 pt-3 bg-content1 [&>button]:text-default-500 [&>button]:border-default-200/60"
                    radius="full"
                    size="sm"
                    variant="bordered"
                  >
                    <Button
                      onPress={() =>
                        setActivityVisitDate(today(getLocalTimeZone()))
                      }
                    >
                      Today
                    </Button>
                  </ButtonGroup>
                </div>
                <Input
                  label="Visit title"
                  placeholder="Add a short title"
                  value={activityVisitTitle}
                  onValueChange={setActivityVisitTitle}
                />
                {isDistanceVisit ? (
                  <div className="grid gap-2">
                    <p className="text-sm font-semibold">Distance (km)</p>
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        variant="flat"
                        onPress={() => {
                          const current = Number.parseFloat(
                            activityVisitDistance,
                          );
                          const next = Number.isFinite(current)
                            ? Math.max(0, current - 0.5)
                            : 0;
                          setActivityVisitDistance(
                            next ? next.toFixed(1) : "",
                          );
                        }}
                        aria-label="Decrease distance"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="e.g. 7.5"
                        value={activityVisitDistance}
                        onValueChange={setActivityVisitDistance}
                        className="flex-1"
                        type="number"
                        min="0"
                        step="0.5"
                      />
                      <Button
                        isIconOnly
                        variant="flat"
                        onPress={() => {
                          const current = Number.parseFloat(
                            activityVisitDistance,
                          );
                          const next = Number.isFinite(current)
                            ? current + 0.5
                            : 0.5;
                          setActivityVisitDistance(next.toFixed(1));
                        }}
                        aria-label="Increase distance"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}
                <div className="grid gap-2">
                  <p className="text-sm font-semibold">Rating</p>
                  <ButtonGroup radius="full" size="sm" variant="bordered">
                    {[
                      {
                        label: (
                          <span className="flex items-center gap-2">
                            <ThumbsDown className="h-4 w-4" />
                            Thumbs down
                          </span>
                        ),
                        value: "down",
                      },
                      {
                        label: (
                          <span className="flex items-center gap-2">
                            <Minus className="h-4 w-4" />
                            N/A
                          </span>
                        ),
                        value: "na",
                      },
                      {
                        label: (
                          <span className="flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4" />
                            Thumbs up
                          </span>
                        ),
                        value: "up",
                      },
                    ].map((option) => {
                      const isSelected = activityVisitRating === option.value;
                      return (
                        <Button
                          key={option.value}
                          variant={isSelected ? "solid" : "flat"}
                          color={isSelected ? "primary" : "default"}
                          onPress={() => setActivityVisitRating(option.value)}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                </div>
                <Textarea
                  label="Comments"
                  placeholder="Add a note about this visit"
                  value={activityVisitDescription}
                  onValueChange={setActivityVisitDescription}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleActivityVisitSave}
                isLoading={isActivityVisitSaving}
                isDisabled={isActivityVisitSaving}
              >
                {activityVisitEditing ? "Update visit" : "Save visit"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function ActivityVisitDetailModal({
  activityVisitDetail,
  setActivityVisitDetail,
  modalMotionProps,
  resolveHeaderUrl,
  resolveAvatarUrl,
  accentColor,
  isDarkMode,
  formatCheckInDate,
  formatRelativeTime,
  openActivityVisitEdit,
  setActivityVisitDeleteTarget,
  activityVisitComments,
  isActivityVisitCommentsLoading,
  profile,
  setActivityVisitCommentDeleteTarget,
  handleActivityVisitCommentAdd,
  activityVisitCommentInputKey,
  activityVisitCommentDraftRef,
  isActivityVisitCommentSaving,
}) {
  return (
    <Modal
      hideCloseButton
      isOpen={Boolean(activityVisitDetail)}
      onOpenChange={(open) => {
        if (!open) {
          setActivityVisitDetail(null);
        }
      }}
      placement="center"
      size="lg"
      motionProps={{
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { type: "spring", stiffness: 260, damping: 38 },
      }}
      classNames={{
        backdrop: "bg-black/50",
        base: "bg-transparent",
      }}
    >
      <ModalContent className="mx-4 my-6 max-h-[80vh] overflow-hidden flex flex-col">
        {(onClose) => {
          const visit = activityVisitDetail;
          if (!visit) {
            return null;
          }
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
          const comments = activityVisitComments[visit.id] || [];
          const activityVisitUpdatedBy = visit.updated_by_name || "Unknown";
          const activityVisitUpdatedAt = visit.updated_at
            ? formatRelativeTime(visit.updated_at) ||
              formatCheckInDate(visit.updated_at)
            : "";
          return (
            <motion.div
              layoutId={`activity-visit-card-${visit.id}`}
              className="relative flex h-full w-full flex-1 flex-col min-h-0"
              transition={{ type: "spring", stiffness: 260, damping: 38 }}
            >
              <motion.div
                layoutId={`activity-visit-bg-${visit.id}`}
                className="absolute inset-0 z-0 rounded-3xl bg-white shadow-medium dark:bg-neutral-900"
                transition={{ type: "spring", stiffness: 260, damping: 38 }}
              />
              <div className="relative z-10">
                <motion.div
                  layoutId={`activity-visit-hero-${visit.id}`}
                  className="w-full aspect-[4/3]"
                  style={{
                    backgroundImage: visitImage
                      ? `url("${visitImage}")`
                      : buildAccentLeakGradient(accentColor, isDarkMode),
                    backgroundPosition: visitImage ? "center" : "left center",
                    backgroundSize: visitImage ? "cover" : "auto",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 38 }}
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="rounded-large border-1 border-white/20 bg-white/80 px-4 py-3 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-100">
                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {visit.activity_title || "Visit title"}
                    </div>
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-300">
                      {visit.activity_name || "Activity"}
                    </div>
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-300">
                      {visit.activity_address || "Location"}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                      <span>{visitDateLabel}</span>
                    </div>
                  </div>
                </div>
                <Button
                  isIconOnly
                  variant="flat"
                  className="absolute right-4 top-4 bg-white/80 text-neutral-900 dark:bg-neutral-900/70 dark:text-neutral-100"
                  onPress={onClose}
                  aria-label="Close visit"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      variant="flat"
                      className="absolute right-16 top-4 bg-white/80 text-neutral-900 dark:bg-neutral-900/70 dark:text-neutral-100"
                      aria-label="Visit actions"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Visit actions">
                    <DropdownItem
                      key="edit-visit"
                      startContent={<Pencil className="h-4 w-4" />}
                      onPress={() => {
                        openActivityVisitEdit(visit);
                        onClose();
                      }}
                    >
                      Edit visit
                    </DropdownItem>
                    <DropdownItem
                      key="delete-visit"
                      color="danger"
                      startContent={<Trash2 className="h-4 w-4" />}
                      onPress={() => {
                        setActivityVisitDeleteTarget(visit);
                        onClose();
                      }}
                    >
                      Delete visit
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <ModalBody className="relative z-10 flex-1 min-h-0 gap-4 px-6 pb-10 pt-6 overflow-y-auto">
                {visit.updated_at || visit.updated_by_name ? (
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Last edited by {activityVisitUpdatedBy}
                    {activityVisitUpdatedAt
                      ? ` • ${activityVisitUpdatedAt}`
                      : ""}
                  </div>
                ) : null}
                {visit.description ? (
                  <div className="rounded-2xl bg-white/80 p-4 text-sm text-neutral-700 shadow-sm dark:bg-neutral-900/60 dark:text-neutral-200">
                    {visit.description}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-neutral-600 shadow-sm dark:bg-neutral-900/60 dark:text-neutral-200">
                    No notes for this visit.
                  </div>
                )}
                <div
                  className={`grid gap-3 ${
                    typeof visit.distance_km === "number"
                      ? "grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {typeof visit.distance_km === "number" ? (
                    <Card
                      isBlurred
                      shadow="sm"
                      className="border-none bg-white/70 dark:bg-neutral-900/60"
                      style={{
                        background: buildAccentKpiGradient(
                          accentColor,
                          isDarkMode,
                          {
                            angle: 128,
                            spotA: "12% 18%",
                            spotB: "82% 12%",
                          },
                        ),
                      }}
                    >
                      <CardBody className="gap-1 text-center">
                        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                          Distance
                        </p>
                        <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                          {typeof visit.distance_km === "number"
                            ? `${visit.distance_km.toFixed(1)}km`
                            : "N/A"}
                        </p>
                      </CardBody>
                    </Card>
                  ) : null}
                  <Card
                    isBlurred
                    shadow="sm"
                    className="border-none bg-white/70 dark:bg-neutral-900/60"
                    style={{
                      background: buildAccentKpiGradient(
                        accentColor,
                        isDarkMode,
                        {
                          angle: 210,
                          spotA: "20% 30%",
                          spotB: "90% 18%",
                        },
                      ),
                    }}
                  >
                    <CardBody className="gap-1 text-center">
                      <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        Rating
                      </p>
                      <div className="flex items-center justify-center gap-2 text-neutral-900 dark:text-neutral-100">
                        <RatingIcon className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                          {ratingLabel}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </div>
                <div className="grid gap-3">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Comments
                  </p>
                  <div className="grid gap-2">
                    {isActivityVisitCommentsLoading ? (
                      <div className="flex w-full max-w-[300px] items-center gap-3">
                        <Skeleton className="flex h-12 w-12 rounded-full" />
                        <div className="flex w-full flex-col gap-2">
                          <Skeleton className="h-3 w-3/5 rounded-lg" />
                          <Skeleton className="h-3 w-4/5 rounded-lg" />
                        </div>
                      </div>
                    ) : comments.length ? (
                      comments.map((comment) => (
                        <Card
                          key={comment.id}
                          className="border-none bg-neutral-50/90 shadow-sm dark:bg-neutral-900/50"
                        >
                          <CardHeader className="flex items-start justify-between gap-3 pb-1">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={resolveAvatarUrl(comment.user_avatar_url)}
                                name={comment.user_name || "User"}
                                size="sm"
                              />
                              <div className="flex flex-col">
                                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                  {comment.user_name || "User"}
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {formatRelativeTime(comment.created_at)}
                                </p>
                              </div>
                            </div>
                            {comment.user_telegram_uid &&
                            profile?.telegram_uid ===
                              comment.user_telegram_uid ? (
                              <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Comment actions">
                                  <DropdownItem
                                    key="delete"
                                    color="danger"
                                    startContent={<Trash2 className="h-4 w-4" />}
                                    onPress={() =>
                                      setActivityVisitCommentDeleteTarget(
                                        comment,
                                      )
                                    }
                                  >
                                    Delete comment
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            ) : null}
                          </CardHeader>
                          <CardBody className="pt-1">
                            <p className="text-sm text-neutral-700 dark:text-neutral-200">
                              {comment.body}
                            </p>
                          </CardBody>
                        </Card>
                      ))
                    ) : (
                      <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-neutral-600 shadow-sm dark:bg-neutral-900/60 dark:text-neutral-200">
                        No comments yet.
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Textarea
                      label="Add a comment"
                      placeholder="Share a thought about this visit"
                      key={`${visit.id}-${activityVisitCommentInputKey}`}
                      onValueChange={(value) => {
                        activityVisitCommentDraftRef.current[visit.id] = value;
                      }}
                    />
                    <Button
                      color="primary"
                      onPress={() =>
                        handleActivityVisitCommentAdd(visit.id, visit.activity_id)
                      }
                      isLoading={isActivityVisitCommentSaving}
                      isDisabled={isActivityVisitCommentSaving}
                    >
                      Post comment
                    </Button>
                  </div>
                </div>
              </ModalBody>
            </motion.div>
          );
        }}
      </ModalContent>
    </Modal>
  );
}

export default function ActivityModals({
  // Activity place modal
  isActivityModalOpen,
  setIsActivityModalOpen,
  modalMotionProps,
  activityEditing,
  setActivityEditing,
  activityImagePreview,
  isActivityCropSaving,
  accentColor,
  isDarkMode,
  activityName,
  activityAddress,
  activityType,
  activityImageInputRef,
  handleActivityImageChange,
  setActivityImagePreview,
  setActivityImageData,
  setActivityImageChanged,
  setActivityType,
  setActivityBucketFormCategory,
  setActivityDifficulty,
  setActivityCategory,
  activityNameExists,
  setActivityName,
  setActivityNameExists,
  isDuplicateNameInList,
  activities,
  activityLocationQuery,
  setActivityLocationQuery,
  fetchActivityLocationSearch,
  isActivitySearchingLocation,
  activityLocationResults,
  activitySelectedLocation,
  isActivityLocationCollapsed,
  setActivityAddress,
  setActivitySelectedLocation,
  setIsActivityLocationCollapsed,
  activityCategory,
  activityDifficulty,
  activityBucketFormCategory,
  activityDescription,
  setActivityDescription,
  handleActivitySave,
  isActivitySaving,
  ACTIVITY_EXERCISE_CATEGORIES,
  ACTIVITY_DIFFICULTY_OPTIONS,
  ACTIVITY_BUCKET_CATEGORIES,
  // Activity visit modal
  isActivityVisitOpen,
  setIsActivityVisitOpen,
  activityVisitEditing,
  activityVisitPhotoPreview,
  isActivityVisitCropSaving,
  activityVisitTitle,
  setActivityVisitTitle,
  activityVisitActivity,
  activityVisitInputRef,
  handleActivityVisitPhotoChange,
  setActivityVisitPhotoPreview,
  setActivityVisitPhotoData,
  setActivityVisitPhotoChanged,
  activityVisitDate,
  setActivityVisitDate,
  activityVisitDistance,
  setActivityVisitDistance,
  activityVisitRating,
  setActivityVisitRating,
  activityVisitDescription,
  setActivityVisitDescription,
  handleActivityVisitSave,
  isActivityVisitSaving,
  // Activity visit select modal
  isActivityVisitSelectOpen,
  setIsActivityVisitSelectOpen,
  activityVisitSelected,
  setActivityVisitSelected,
  activityVisitSearchQuery,
  setActivityVisitSearchQuery,
  activityVisitSearchResults,
  setActivityVisitSearchResults,
  handleActivityVisitSearch,
  isActivityVisitSearching,
  openActivityVisitModal,
  buildAccentLeakGradient,
  resolveHeaderUrl,
  // Decide for me modal
  isActivityDecideOpen,
  setIsActivityDecideOpen,
  activityDecideResult,
  setActivityDecideResult,
  activityDecideRadius,
  setActivityDecideRadius,
  activityDecidePendingResult,
  setActivityDecidePendingResult,
  activityDecidePendingRadius,
  setActivityDecidePendingRadius,
  activityDecideResponseReady,
  setActivityDecideResponseReady,
  activityDecideVideoDone,
  setActivityDecideVideoDone,
  isActivityDecideRolling,
  setIsActivityDecideRolling,
  isActivityDecideRevealing,
  setIsActivityDecideRevealing,
  activityDecideVideoKey,
  activityDecideVideoRef,
  helpDecideVideoUrl,
  handleActivityDecideRoll,
  activityDecideLocationEnabled,
  handleActivityDecideLocationToggle,
  activityDecidePreference,
  setActivityDecidePreference,
  activityDecideCategorySelection,
  setActivityDecideCategorySelection,
  navigate,
  // Activity visit detail modal
  activityVisitDetail,
  setActivityVisitDetail,
  resolveAvatarUrl,
  formatCheckInDate,
  formatRelativeTime,
  openActivityVisitEdit,
  setActivityVisitDeleteTarget,
  activityVisitComments,
  isActivityVisitCommentsLoading,
  profile,
  setActivityVisitCommentDeleteTarget,
  handleActivityVisitCommentAdd,
  activityVisitCommentInputKey,
  activityVisitCommentDraftRef,
  isActivityVisitCommentSaving,
  // Activity delete modals
  activityVisitCommentDeleteTarget,
  confirmDeleteActivityVisitComment,
  isDeletingActivityVisitComment,
  // Activity crop modals
  isActivityCropOpen,
  setIsActivityCropOpen,
  activityCropImageSrc,
  activityCrop,
  setActivityCrop,
  activityZoom,
  setActivityZoom,
  setActivityCroppedAreaPixels,
  handleActivityCropConfirm,
  isActivityVisitCropOpen,
  setIsActivityVisitCropOpen,
  activityVisitCropImageSrc,
  activityVisitCrop,
  setActivityVisitCrop,
  activityVisitZoom,
  setActivityVisitZoom,
  setActivityVisitCroppedAreaPixels,
  handleActivityVisitCropConfirm,
}) {
  return (
    <>
      <ActivityModal
        isOpen={isActivityModalOpen}
        onOpenChange={(open) => {
          setIsActivityModalOpen(open);
          if (!open) {
            setActivityEditing(null);
          }
        }}
        modalMotionProps={modalMotionProps}
        activityEditing={activityEditing}
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
      />
      <ActivityVisitModal
        isOpen={isActivityVisitOpen}
        onOpenChange={setIsActivityVisitOpen}
        modalMotionProps={modalMotionProps}
        activityVisitEditing={activityVisitEditing}
        activityVisitPhotoPreview={activityVisitPhotoPreview}
        isActivityVisitCropSaving={isActivityVisitCropSaving}
        accentColor={accentColor}
        isDarkMode={isDarkMode}
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
        ACTIVITY_EXERCISE_CATEGORIES={ACTIVITY_EXERCISE_CATEGORIES}
        ACTIVITY_BUCKET_CATEGORIES={ACTIVITY_BUCKET_CATEGORIES}
      />
      <Modal
  hideCloseButton
        isOpen={isActivityVisitSelectOpen}
        onOpenChange={(open) => {
          setIsActivityVisitSelectOpen(open);
          if (!open) {
            setActivityVisitSelected(null);
            setActivityVisitSearchQuery("");
            setActivityVisitSearchResults([]);
            setIsActivityVisitSearching(false);
          }
        }}
        placement="center"
        size="lg"
        motionProps={modalMotionProps}
      >
        <ModalContent className="mx-4 my-6 max-h-[calc(100vh-3rem)] overflow-hidden">
          {(onClose) => (
            <>
              <ModalHeader>Select an activity</ModalHeader>
              <ModalBody className="gap-4 overflow-y-auto">
                {!activityVisitSelected ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Input
                        label="Search activities"
                        placeholder="Search for an activity"
                        className="flex-1"
                        size="lg"
                        value={activityVisitSearchQuery}
                        onChange={(event) =>
                          setActivityVisitSearchQuery(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleActivityVisitSearch();
                          }
                        }}
                        startContent={
                          <Search className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                        }
                      />
                      <Button
                        isIconOnly
                        variant="flat"
                        size="lg"
                        aria-label="Search activities"
                        onPress={handleActivityVisitSearch}
                        isLoading={isActivityVisitSearching}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      {isActivityVisitSearching ? (
                        Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={`activity-visit-skeleton-${index}`}
                            className="flex w-full max-w-[300px] items-center gap-3"
                          >
                            <Skeleton className="flex h-12 w-12 rounded-full" />
                            <div className="flex w-full flex-col gap-2">
                              <Skeleton className="h-3 w-3/5 rounded-lg" />
                              <Skeleton className="h-3 w-4/5 rounded-lg" />
                            </div>
                          </div>
                        ))
                      ) : activityVisitSearchResults.length ? (
                        activityVisitSearchResults.map((activity) => (
                          <Card
                            key={activity.id}
                            className="overflow-hidden bg-white/80 dark:bg-neutral-900/70"
                            shadow="sm"
                            isPressable
                            onPress={() => setActivityVisitSelected(activity)}
                          >
                            <CardBody className="gap-1">
                              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {activity.name}
                              </p>
                              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                                {activity.address || "Location"}
                              </p>
                            </CardBody>
                          </Card>
                        ))
                      ) : (
                        <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-neutral-600 shadow-sm dark:bg-neutral-900/60 dark:text-neutral-200">
                          Search for an activity to add a visit.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <Card
                    isFooterBlurred
                    radius="lg"
                    className="border-none overflow-hidden"
                  >
                    <div
                      className="h-44 w-full"
                      style={{
                        backgroundImage: activityVisitSelected.image_url
                          ? `url("${resolveHeaderUrl(
                              activityVisitSelected.image_url,
                            )}")`
                          : buildAccentLeakGradient(accentColor, isDarkMode),
                        backgroundSize: activityVisitSelected.image_url
                          ? "cover"
                          : "auto",
                        backgroundPosition: activityVisitSelected.image_url
                          ? "center"
                          : "left center",
                      }}
                    />
                    <CardFooter className="border-1 border-white/20 bg-white/70 py-2 absolute bottom-1 w-[calc(100%_-_8px)] rounded-large shadow-small ml-1 z-10 text-neutral-900 backdrop-blur dark:bg-neutral-900/70 dark:text-white">
                      <div className="text-left">
                        <p className="text-[10px] uppercase font-semibold tracking-wide text-neutral-600 dark:text-white/80">
                          Selected activity
                        </p>
                        <p className="text-sm font-semibold">
                          {activityVisitSelected.name}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-white/70">
                          {activityVisitSelected.address || "Location"}
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                )}
              </ModalBody>
              <ModalFooter>
                {activityVisitSelected ? (
                  <Button
                    variant="light"
                    onPress={() => setActivityVisitSelected(null)}
                  >
                    Choose another
                  </Button>
                ) : (
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                )}
                <Button
                  color="primary"
                  isDisabled={!activityVisitSelected}
                  onPress={() => {
                    if (!activityVisitSelected) {
                      return;
                    }
                    openActivityVisitModal(activityVisitSelected);
                    setIsActivityVisitSelectOpen(false);
                  }}
                >
                  Add visit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
  hideCloseButton
        isOpen={isActivityDecideOpen}
        onOpenChange={(open) => {
          setIsActivityDecideOpen(open);
          if (!open) {
            setActivityDecideResult(null);
            setActivityDecideRadius(null);
            setActivityDecidePendingResult(null);
            setActivityDecidePendingRadius(null);
            setActivityDecideResponseReady(false);
            setActivityDecideVideoDone(false);
            setIsActivityDecideRolling(false);
            setIsActivityDecideRevealing(false);
          }
        }}
        placement="center"
        size="lg"
        motionProps={modalMotionProps}
      >
        <ModalContent className="mx-4 my-6">
          {(onClose) => {
            const activityCategories =
              activityDecidePreference === "exercise"
                ? ACTIVITY_EXERCISE_CATEGORIES
                : activityDecidePreference === "bucket"
                  ? ACTIVITY_BUCKET_CATEGORIES
                  : [
                      ...ACTIVITY_EXERCISE_CATEGORIES,
                      ...ACTIVITY_BUCKET_CATEGORIES,
                    ];
            const getCategoryLabel = (activity) => {
              const pool =
                activity?.activity_type === "bucket"
                  ? ACTIVITY_BUCKET_CATEGORIES
                  : ACTIVITY_EXERCISE_CATEGORIES;
              return (
                pool.find((entry) => entry.value === activity?.category)
                  ?.label ||
                (activity?.activity_type === "bucket"
                  ? "Bucket list"
                  : "Exercise")
              );
            };
            const resultPath = activityDecideResult
              ? `/activities/${
                  activityDecideResult.activity_type === "bucket"
                    ? "bucketlist"
                    : "exercise"
                }/${activityDecideResult.id}`
              : null;
            return (
              <>
                <ModalHeader>Decide for me</ModalHeader>
                <ModalBody className="gap-5">
                  <Switch
                    isSelected={activityDecideLocationEnabled}
                    onValueChange={handleActivityDecideLocationToggle}
                  >
                    Location access
                  </Switch>
                  <div className="grid gap-2">
                    <p className="text-sm font-semibold">Activity preference</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "All", value: "all" },
                        { label: "Exercise", value: "exercise" },
                        { label: "Bucket list", value: "bucket" },
                      ].map((option) => {
                        const isActive =
                          activityDecidePreference === option.value;
                        return (
                          <Button
                            key={option.value}
                            size="sm"
                            variant={isActive ? "solid" : "flat"}
                            color={isActive ? "primary" : "default"}
                            onPress={() => {
                              setActivityDecidePreference(option.value);
                              setActivityDecideCategorySelection(
                                new Set(["all"]),
                              );
                            }}
                          >
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <p className="text-sm font-semibold">Category preference</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={
                          activityDecideCategorySelection.has("all")
                            ? "solid"
                            : "flat"
                        }
                        color={
                          activityDecideCategorySelection.has("all")
                            ? "primary"
                            : "default"
                        }
                        onPress={() =>
                          setActivityDecideCategorySelection(new Set(["all"]))
                        }
                      >
                        All
                      </Button>
                    </div>
                    {activityDecidePreference === "all" ? (
                      <div className="grid gap-3">
                        <div className="grid gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                            Exercise
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {ACTIVITY_EXERCISE_CATEGORIES.map((category) => {
                              const isActive =
                                activityDecideCategorySelection.has(
                                  category.value,
                                ) &&
                                !activityDecideCategorySelection.has("all");
                              return (
                                <Button
                                  key={category.value}
                                  size="sm"
                                  variant={isActive ? "solid" : "flat"}
                                  color={isActive ? "primary" : "default"}
                                  onPress={() => {
                                    setActivityDecideCategorySelection(
                                      (prev) => {
                                        const next = new Set(prev);
                                        next.delete("all");
                                        if (next.has(category.value)) {
                                          next.delete(category.value);
                                        } else {
                                          next.add(category.value);
                                        }
                                        return next.size
                                          ? next
                                          : new Set(["all"]);
                                      },
                                    );
                                  }}
                                >
                                  {category.label}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                            Bucket list
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {ACTIVITY_BUCKET_CATEGORIES.map((category) => {
                              const isActive =
                                activityDecideCategorySelection.has(
                                  category.value,
                                ) &&
                                !activityDecideCategorySelection.has("all");
                              return (
                                <Button
                                  key={category.value}
                                  size="sm"
                                  variant={isActive ? "solid" : "flat"}
                                  color={isActive ? "primary" : "default"}
                                  onPress={() => {
                                    setActivityDecideCategorySelection(
                                      (prev) => {
                                        const next = new Set(prev);
                                        next.delete("all");
                                        if (next.has(category.value)) {
                                          next.delete(category.value);
                                        } else {
                                          next.add(category.value);
                                        }
                                        return next.size
                                          ? next
                                          : new Set(["all"]);
                                      },
                                    );
                                  }}
                                >
                                  {category.label}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {activityCategories.map((category) => {
                          const isActive =
                            activityDecideCategorySelection.has(
                              category.value,
                            ) && !activityDecideCategorySelection.has("all");
                          return (
                            <Button
                              key={category.value}
                              size="sm"
                              variant={isActive ? "solid" : "flat"}
                              color={isActive ? "primary" : "default"}
                              onPress={() => {
                                setActivityDecideCategorySelection((prev) => {
                                  const next = new Set(prev);
                                  next.delete("all");
                                  if (next.has(category.value)) {
                                    next.delete(category.value);
                                  } else {
                                    next.add(category.value);
                                  }
                                  return next.size ? next : new Set(["all"]);
                                });
                              }}
                            >
                              {category.label}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {isActivityDecideRevealing ? (
                    <div className="overflow-hidden rounded-2xl bg-black/90 shadow-sm">
                      <video
                        key={activityDecideVideoKey}
                        ref={activityDecideVideoRef}
                        className="h-56 w-full object-cover"
                        playsInline
                        preload="auto"
                        onEnded={() => setActivityDecideVideoDone(true)}
                        onError={() => setActivityDecideVideoDone(true)}
                      >
                        <source src={helpDecideVideoUrl} type="video/mp4" />
                      </video>
                    </div>
                  ) : activityDecideResult ? (
                    <Card
                      isFooterBlurred
                      radius="lg"
                      className="border-none overflow-hidden"
                      isPressable={Boolean(resultPath)}
                      onPress={() => {
                        if (resultPath) {
                          navigate(resultPath);
                        }
                      }}
                    >
                      <div
                        className="h-48 w-full"
                        style={{
                          backgroundImage: activityDecideResult.image_url
                            ? `url("${resolveHeaderUrl(
                                activityDecideResult.image_url,
                              )}")`
                            : buildAccentLeakGradient(accentColor, isDarkMode),
                          backgroundSize: activityDecideResult.image_url
                            ? "cover"
                            : "auto",
                          backgroundPosition: activityDecideResult.image_url
                            ? "center"
                            : "left center",
                        }}
                      />
                      <CardFooter className="border-1 border-white/20 bg-white/70 py-2 absolute bottom-1 w-[calc(100%_-_8px)] rounded-large shadow-small ml-1 z-10 text-neutral-900 backdrop-blur dark:bg-neutral-900/70 dark:text-white">
                        <div className="text-left">
                          <p className="text-[10px] uppercase font-semibold tracking-wide text-neutral-600 dark:text-white/80">
                            Recommended
                            {activityDecideRadius
                              ? ` • within ${activityDecideRadius}km`
                              : ""}
                          </p>
                          <p className="text-sm font-semibold">
                            {activityDecideResult.name}
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-white/70">
                            {activityDecideResult.address || "Location"}
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-white/70">
                            {getCategoryLabel(activityDecideResult)}
                          </p>
                        </div>
                      </CardFooter>
                    </Card>
                  ) : (
                    <div className="rounded-2xl bg-white/80 p-4 text-sm text-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200">
                      Roll to get a recommendation tailored to your preferences.
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleActivityDecideRoll}
                    isLoading={isActivityDecideRolling}
                  >
                    Roll recommendation
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
      <ActivityVisitDetailModal
        activityVisitDetail={activityVisitDetail}
        setActivityVisitDetail={setActivityVisitDetail}
        modalMotionProps={modalMotionProps}
        resolveHeaderUrl={resolveHeaderUrl}
        resolveAvatarUrl={resolveAvatarUrl}
        accentColor={accentColor}
        isDarkMode={isDarkMode}
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
      />
      <Modal
  hideCloseButton
        isOpen={Boolean(activityVisitCommentDeleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setActivityVisitCommentDeleteTarget(null);
          }
        }}
        placement="center"
        size="sm"
        motionProps={modalMotionProps}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete comment?</ModalHeader>
              <ModalBody>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  This will permanently remove the comment.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={confirmDeleteActivityVisitComment}
                  isLoading={isDeletingActivityVisitComment}
                  isDisabled={isDeletingActivityVisitComment}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <ImageCropperModal
        isOpen={isActivityCropOpen}
        onOpenChange={setIsActivityCropOpen}
        motionProps={modalMotionProps}
        title="Crop activity header"
        imageSrc={activityCropImageSrc}
        crop={activityCrop}
        setCrop={setActivityCrop}
        zoom={activityZoom}
        setZoom={setActivityZoom}
        aspect={3 / 2}
        cropShape="rect"
        onCropComplete={(_, pixels) => setActivityCroppedAreaPixels(pixels)}
        onConfirm={handleActivityCropConfirm}
        confirmLabel="Use header"
        isSaving={isActivityCropSaving}
      />
      <ImageCropperModal
        isOpen={isActivityVisitCropOpen}
        onOpenChange={setIsActivityVisitCropOpen}
        motionProps={modalMotionProps}
        title="Crop photo"
        imageSrc={activityVisitCropImageSrc}
        crop={activityVisitCrop}
        setCrop={setActivityVisitCrop}
        zoom={activityVisitZoom}
        setZoom={setActivityVisitZoom}
        aspect={3 / 2}
        cropShape="rect"
        onCropComplete={(_, pixels) => setActivityVisitCroppedAreaPixels(pixels)}
        onConfirm={handleActivityVisitCropConfirm}
        confirmLabel="Use photo"
        isSaving={isActivityVisitCropSaving}
      />
    </>
  );
}
