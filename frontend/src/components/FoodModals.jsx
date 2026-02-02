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
  Slider,
  Switch,
  Textarea,
} from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { getLocalTimeZone, today } from "@internationalized/date";
import {
  Check,
  Loader2,
  LocateFixed,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import ImageCropperModal from "./ImageCropperModal.jsx";

function FoodPlaceModal({
  isOpen,
  onOpenChange,
  modalMotionProps,
  foodEditingPlace,
  foodHeaderPreview,
  isFoodHeaderCropSaving,
  accentColor,
  isDarkMode,
  foodName,
  foodSelectedLocation,
  foodCuisineSubcategory,
  foodCuisineCategory,
  foodOpen,
  setFoodHeaderPreview,
  setFoodHeaderData,
  setFoodHeaderChanged,
  foodHeaderInputRef,
  handleFoodHeaderChange,
  foodNameExists,
  setFoodName,
  setFoodNameExists,
  isDuplicateNameInList,
  foodPlaces,
  foodLocationQuery,
  setFoodLocationQuery,
  fetchFoodLocationSearch,
  isFoodSearching,
  foodLocationResults,
  isFoodLocationCollapsed,
  setIsFoodLocationCollapsed,
  setFoodSelectedLocation,
  handleFoodLocate,
  isFoodLocating,
  setFoodCuisineCategory,
  setFoodCuisineSubcategory,
  foodCuisineOptions,
  foodComments,
  setFoodComments,
  setFoodOpen,
  handleFoodPlaceSave,
  isFoodSaving,
  buildAccentLeakGradient,
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
                  {foodEditingPlace ? "Edit place" : "Add food place"}
                </p>
                <div className="relative overflow-hidden rounded-large rounded-b-none">
                  {foodHeaderPreview ? (
                    <HeroImage
                      alt="Food header preview"
                      className="w-full object-cover aspect-[3/2] rounded-b-none"
                      src={foodHeaderPreview}
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
                  {isFoodHeaderCropSaving ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  ) : null}
                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="rounded-large border-1 border-white/20 bg-white/75 px-3 py-2 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/70 dark:text-white">
                      <p className="text-sm font-semibold">
                        {foodName || "Place name"}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-white/70">
                        {foodSelectedLocation?.formatted || "Location"}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-white/70">
                        {foodCuisineSubcategory ||
                          foodCuisineCategory ||
                          "Cuisine"}
                      </p>
                      {!foodOpen ? (
                        <p className="text-xs font-semibold text-rose-500">
                          Permanently closed
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
                      <DropdownMenu aria-label="Food header actions">
                        <DropdownItem
                          key="upload-header"
                          startContent={<Upload className="h-4 w-4" />}
                          onPress={() => foodHeaderInputRef.current?.click()}
                        >
                          Upload photo
                        </DropdownItem>
                        <DropdownItem
                          key="delete-header"
                          color="danger"
                          startContent={<Trash2 className="h-4 w-4" />}
                          isDisabled={!foodHeaderPreview}
                          onPress={() => {
                            setFoodHeaderPreview("");
                            setFoodHeaderData("");
                            setFoodHeaderChanged(true);
                          }}
                        >
                          Delete photo
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <input
                    ref={foodHeaderInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFoodHeaderChange}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 px-6 pb-6">
                <Input
                  label="Place name"
                  placeholder="Enter a place name"
                  value={foodName}
                  onValueChange={(value) => {
                    setFoodName(value);
                    setFoodNameExists(
                      isDuplicateNameInList(
                        value,
                        foodPlaces,
                        foodEditingPlace?.id,
                      ),
                    );
                  }}
                  isInvalid={foodNameExists}
                  errorMessage="Place already exists"
                />
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      label="Location search"
                      placeholder="Search for a place"
                      className="flex-1"
                      size="lg"
                      value={foodLocationQuery}
                      onChange={(event) =>
                        setFoodLocationQuery(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          fetchFoodLocationSearch(foodLocationQuery);
                        }
                      }}
                    />
                    <Button
                      isIconOnly
                      variant="flat"
                      size="lg"
                      aria-label="Search location"
                      onPress={() => fetchFoodLocationSearch(foodLocationQuery)}
                      isLoading={isFoodSearching}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      isIconOnly
                      variant="flat"
                      size="lg"
                      aria-label="Locate me"
                      onPress={handleFoodLocate}
                      isLoading={isFoodLocating}
                    >
                      <LocateFixed className="h-4 w-4" />
                    </Button>
                  </div>
                  <div
                    className={`grid gap-2 transition-[max-height,opacity] duration-300 ease-out ${
                      isFoodSearching || foodLocationResults.length
                        ? "max-h-[520px] opacity-100 overflow-visible"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    {isFoodSearching
                      ? Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={`food-skeleton-${index}`}
                            className="flex w-full max-w-[300px] items-center gap-3"
                          >
                            <Skeleton className="flex h-12 w-12 rounded-full" />
                            <div className="flex w-full flex-col gap-2">
                              <Skeleton className="h-3 w-3/5 rounded-lg" />
                              <Skeleton className="h-3 w-4/5 rounded-lg" />
                            </div>
                          </div>
                        ))
                      : (isFoodLocationCollapsed && foodSelectedLocation
                          ? [foodSelectedLocation]
                          : foodLocationResults
                        ).map((result) => (
                          <Card
                            key={result.id}
                            className={`overflow-hidden border ${
                              foodSelectedLocation?.id === result.id
                                ? "border-neutral-900/50 dark:border-white/60"
                                : "border-transparent"
                            } bg-white/80 dark:bg-neutral-900/70`}
                            shadow="sm"
                            isPressable
                            onPress={() => {
                              setFoodSelectedLocation(result);
                              setIsFoodLocationCollapsed(true);
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
                    {isFoodLocationCollapsed &&
                    foodLocationResults.length > 1 ? (
                      <Button
                        variant="light"
                        size="sm"
                        onPress={() => setIsFoodLocationCollapsed(false)}
                      >
                        View more
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm font-semibold">Cuisine</p>
                  <div className="flex flex-wrap gap-2">
                    <Dropdown placement="bottom-start">
                      <DropdownTrigger>
                        <Button variant="flat">
                          {foodCuisineCategory || "Select category"}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Cuisine category"
                        onAction={(key) => {
                          setFoodCuisineCategory(String(key));
                          setFoodCuisineSubcategory("");
                        }}
                      >
                        {Object.keys(foodCuisineOptions).map((category) => (
                          <DropdownItem key={category}>{category}</DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                    <Dropdown
                      placement="bottom-start"
                      isDisabled={!foodCuisineCategory}
                    >
                      <DropdownTrigger>
                        <Button
                          variant="flat"
                          isDisabled={!foodCuisineCategory}
                        >
                          {foodCuisineSubcategory || "Select subcategory"}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Cuisine subcategory"
                        onAction={(key) =>
                          setFoodCuisineSubcategory(String(key))
                        }
                      >
                        {(foodCuisineOptions[foodCuisineCategory] || []).map(
                          (subcategory) => (
                            <DropdownItem key={subcategory}>
                              {subcategory}
                            </DropdownItem>
                          ),
                        )}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  {foodCuisineCategory ? (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {foodCuisineSubcategory
                        ? `${foodCuisineCategory} • ${foodCuisineSubcategory}`
                        : foodCuisineCategory}
                    </p>
                  ) : null}
                </div>
                <Textarea
                  label="Comments"
                  placeholder="Add a note about this place"
                  value={foodComments}
                  onValueChange={setFoodComments}
                />
                <Switch
                  isSelected={!foodOpen}
                  onValueChange={(value) => setFoodOpen(!value)}
                >
                  Permanently closed
                </Switch>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleFoodPlaceSave}
                isLoading={isFoodSaving}
              >
                {foodEditingPlace ? "Update place" : "Save place"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function FoodVisitModal({
  isOpen,
  onOpenChange,
  modalMotionProps,
  foodEditingVisit,
  foodVisitPhotoPreview,
  isFoodVisitCropSaving,
  accentColor,
  isDarkMode,
  foodVisitPlace,
  foodVisitInputRef,
  handleFoodVisitPhotoChange,
  setFoodVisitPhotoPreview,
  setFoodVisitPhotoData,
  setFoodVisitPhotoChanged,
  foodVisitDate,
  setFoodVisitDate,
  foodVisitDishes,
  setFoodVisitDishes,
  handleFoodVisitDishNameChange,
  handleFoodVisitDishDelete,
  handleFoodVisitDishRatingChange,
  renderStarRow,
  foodVisitOverallRating,
  setFoodVisitOverallRating,
  foodVisitAgain,
  setFoodVisitAgain,
  foodVisitDescription,
  setFoodVisitDescription,
  handleFoodVisitSave,
  isFoodVisitSaving,
  buildAccentLeakGradient,
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
                  {foodEditingVisit ? "Edit visit" : "Add visit"}
                </p>
                <div className="relative overflow-hidden rounded-large rounded-b-none">
                  {foodVisitPhotoPreview ? (
                    <HeroImage
                      alt="Food visit preview"
                      className="w-full object-cover aspect-[4/3] rounded-b-none"
                      src={foodVisitPhotoPreview}
                      width={600}
                    />
                  ) : (
                    <div
                      className="w-full aspect-[4/3]"
                      style={{
                        backgroundImage: buildAccentLeakGradient(
                          accentColor,
                          isDarkMode,
                        ),
                      }}
                    />
                  )}
                  {isFoodVisitCropSaving ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  ) : null}
                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="rounded-large border-1 border-white/20 bg-white/75 px-3 py-2 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/70 dark:text-white">
                      <p className="text-sm font-semibold">
                        {foodVisitPlace?.name || "Food place"}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-white/70">
                        {foodVisitPlace?.location_label || "Location"}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-white/70">
                        {foodVisitPlace?.cuisine || "Cuisine"}
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
                      <DropdownMenu aria-label="Food visit photo actions">
                        <DropdownItem
                          key="upload-visit-photo"
                          startContent={<Upload className="h-4 w-4" />}
                          onPress={() => foodVisitInputRef.current?.click()}
                        >
                          Upload photo
                        </DropdownItem>
                        <DropdownItem
                          key="delete-visit-photo"
                          color="danger"
                          startContent={<Trash2 className="h-4 w-4" />}
                          isDisabled={!foodVisitPhotoPreview}
                          onPress={() => {
                            setFoodVisitPhotoPreview("");
                            setFoodVisitPhotoData(null);
                            setFoodVisitPhotoChanged(true);
                          }}
                        >
                          Delete photo
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <input
                    ref={foodVisitInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFoodVisitPhotoChange}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 px-6 pb-6">
                <div className="grid gap-2">
                  <I18nProvider locale="en-GB">
                    <DatePicker
                      label="Date"
                      className="w-full"
                      value={foodVisitDate}
                      onChange={setFoodVisitDate}
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
                        setFoodVisitDate(today(getLocalTimeZone()))
                      }
                    >
                      Today
                    </Button>
                  </ButtonGroup>
                </div>
                <div className="grid gap-3">
                  <p className="text-sm font-semibold">Dishes</p>
                  {foodVisitDishes.map((dish, index) => (
                    <div
                      key={dish.id}
                      className={`grid gap-3 rounded-2xl bg-white/80 p-3 dark:bg-neutral-900/60 ${
                        dish.isNew ? "dish-enter" : ""
                      }`}
                      onAnimationEnd={() => {
                        if (!dish.isNew) {
                          return;
                        }
                        setFoodVisitDishes((prev) =>
                          prev.map((entry) =>
                            entry.id === dish.id
                              ? { ...entry, isNew: false }
                              : entry,
                          ),
                        );
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <Input
                          label={`Dish ${index + 1}`}
                          placeholder="e.g. Signature noodles"
                          size="lg"
                          classNames={{ base: "flex-1" }}
                          value={dish.name}
                          onValueChange={(value) =>
                            handleFoodVisitDishNameChange(dish.id, value)
                          }
                        />
                        {dish.name.trim() ? (
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="mt-6"
                            onPress={() => handleFoodVisitDishDelete(dish.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                          <span>Rating</span>
                          <div className="flex items-center gap-2">
                            {renderStarRow(dish.rating, `dish-${dish.id}`)}
                            <span>{dish.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <Slider
                          minValue={0}
                          maxValue={5}
                          step={0.5}
                          value={dish.rating}
                          onChange={(value) =>
                            handleFoodVisitDishRatingChange(
                              dish.id,
                              Number(value),
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2">
                  <p className="text-sm font-semibold">Overall rating</p>
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <span>Auto from dishes, drag to override</span>
                    <div className="flex items-center gap-2">
                      {renderStarRow(foodVisitOverallRating, "overall")}
                      <span>{foodVisitOverallRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <Slider
                    minValue={0}
                    maxValue={5}
                    step={0.5}
                    value={foodVisitOverallRating}
                    onChange={(value) =>
                      setFoodVisitOverallRating(Number(value))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <p className="text-sm font-semibold">
                    Would you eat here again?
                  </p>
                  <ButtonGroup
                    fullWidth
                    radius="full"
                    size="sm"
                    variant="bordered"
                    className="bg-content1/40 [&>button]:border-default-200/60"
                  >
                    {[
                      { label: "Yes", value: "yes" },
                      { label: "Maybe", value: "maybe" },
                      { label: "No", value: "no" },
                    ].map((option) => {
                      const isSelected = foodVisitAgain === option.value;
                      const toneClasses =
                        option.value === "yes"
                          ? {
                              active: "bg-emerald-500 text-white",
                              idle:
                                "bg-emerald-500/30 text-white border-emerald-400/50",
                            }
                          : option.value === "no"
                            ? {
                                active: "bg-rose-500 text-white",
                                idle:
                                  "bg-rose-500/30 text-white border-rose-400/50",
                              }
                            : {
                                active: "bg-orange-500 text-white",
                                idle:
                                  "bg-orange-500/30 text-white border-orange-400/50",
                              };
                      return (
                        <Button
                          key={option.value}
                          onPress={() => setFoodVisitAgain(option.value)}
                          variant={isSelected ? "solid" : "flat"}
                          color="default"
                          className={
                            isSelected ? toneClasses.active : toneClasses.idle
                          }
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                </div>
                <Textarea
                  label="Description"
                  placeholder="Share notes about this visit"
                  value={foodVisitDescription}
                  onValueChange={setFoodVisitDescription}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleFoodVisitSave}
                isLoading={isFoodVisitSaving}
                isDisabled={isFoodVisitSaving}
              >
                {foodEditingVisit ? "Update visit" : "Save visit"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default function FoodModals({
  // Food place modal
  isFoodPlaceOpen,
  setIsFoodPlaceOpen,
  modalMotionProps,
  foodEditingPlace,
  setFoodEditingPlace,
  foodHeaderPreview,
  isFoodHeaderCropSaving,
  accentColor,
  isDarkMode,
  foodName,
  foodSelectedLocation,
  foodCuisineSubcategory,
  foodCuisineCategory,
  foodOpen,
  setFoodHeaderPreview,
  setFoodHeaderData,
  setFoodHeaderChanged,
  foodHeaderInputRef,
  handleFoodHeaderChange,
  foodNameExists,
  setFoodName,
  setFoodNameExists,
  isDuplicateNameInList,
  foodPlaces,
  foodLocationQuery,
  setFoodLocationQuery,
  fetchFoodLocationSearch,
  isFoodSearching,
  foodLocationResults,
  isFoodLocationCollapsed,
  setIsFoodLocationCollapsed,
  setFoodSelectedLocation,
  handleFoodLocate,
  isFoodLocating,
  setFoodCuisineCategory,
  setFoodCuisineSubcategory,
  foodCuisineOptions,
  foodComments,
  setFoodComments,
  setFoodOpen,
  handleFoodPlaceSave,
  isFoodSaving,
  // Food visit select modal
  isFoodVisitSelectOpen,
  setIsFoodVisitSelectOpen,
  foodVisitPlaceSelected,
  setFoodVisitPlaceSelected,
  foodVisitPlaceSearchQuery,
  setFoodVisitPlaceSearchQuery,
  foodVisitPlaceSearchResults,
  setFoodVisitPlaceSearchResults,
  handleFoodVisitPlaceSearch,
  isFoodVisitPlaceSearching,
  openFoodVisitModal,
  buildAccentLeakGradient,
  resolveHeaderUrl,
  // Help decide modal
  isHelpDecideOpen,
  setIsHelpDecideOpen,
  helpDecideResult,
  setHelpDecideResult,
  helpDecideRadius,
  setHelpDecideRadius,
  helpDecidePendingResult,
  setHelpDecidePendingResult,
  helpDecidePendingRadius,
  setHelpDecidePendingRadius,
  helpDecideResponseReady,
  setHelpDecideResponseReady,
  helpDecideVideoDone,
  setHelpDecideVideoDone,
  isHelpDecideRolling,
  setIsHelpDecideRolling,
  isHelpDecideRevealing,
  setIsHelpDecideRevealing,
  helpDecideVideoKey,
  helpDecideVideoRef,
  helpDecideVideoUrl,
  handleHelpDecideRoll,
  helpDecideLocationEnabled,
  handleHelpDecideLocationToggle,
  helpDecideCuisineSelection,
  setHelpDecideCuisineSelection,
  navigate,
  // Food visit modal
  isFoodVisitOpen,
  setIsFoodVisitOpen,
  foodEditingVisit,
  foodVisitPhotoPreview,
  isFoodVisitCropSaving,
  foodVisitPlace,
  foodVisitInputRef,
  handleFoodVisitPhotoChange,
  setFoodVisitPhotoPreview,
  setFoodVisitPhotoData,
  setFoodVisitPhotoChanged,
  foodVisitDate,
  setFoodVisitDate,
  foodVisitDishes,
  setFoodVisitDishes,
  handleFoodVisitDishNameChange,
  handleFoodVisitDishDelete,
  handleFoodVisitDishRatingChange,
  renderStarRow,
  foodVisitOverallRating,
  setFoodVisitOverallRating,
  foodVisitAgain,
  setFoodVisitAgain,
  foodVisitDescription,
  setFoodVisitDescription,
  handleFoodVisitSave,
  isFoodVisitSaving,
  // Food visit detail modal
  foodVisitDetail,
  setFoodVisitDetail,
  resolveAvatarUrl,
  formatCheckInDate,
  formatRelativeTime,
  openFoodVisitEdit,
  foodVisitComments,
  isFoodVisitCommentsLoading,
  profile,
  setFoodVisitCommentDeleteTarget,
  handleFoodVisitCommentAdd,
  foodVisitCommentInputKey,
  foodVisitCommentDraftRef,
  isFoodVisitCommentSaving,
  QuestionMarkIcon,
  // Food comment delete modal
  foodVisitCommentDeleteTarget,
  confirmDeleteFoodVisitComment,
  isDeletingFoodVisitComment,
  // Food crop modals
  isFoodHeaderCropOpen,
  setIsFoodHeaderCropOpen,
  foodHeaderCropImageSrc,
  foodHeaderCrop,
  setFoodHeaderCrop,
  foodHeaderZoom,
  setFoodHeaderZoom,
  setFoodHeaderCroppedAreaPixels,
  handleFoodHeaderCropConfirm,
  isFoodVisitCropOpen,
  setIsFoodVisitCropOpen,
  foodVisitCropImageSrc,
  foodVisitCrop,
  setFoodVisitCrop,
  foodVisitZoom,
  setFoodVisitZoom,
  setFoodVisitCroppedAreaPixels,
  handleFoodVisitCropConfirm,
}) {
  return (
    <>
      <FoodPlaceModal
        isOpen={isFoodPlaceOpen}
        onOpenChange={(open) => {
          setIsFoodPlaceOpen(open);
          if (!open) {
            setFoodEditingPlace(null);
          }
        }}
        modalMotionProps={modalMotionProps}
        foodEditingPlace={foodEditingPlace}
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
        foodCuisineOptions={foodCuisineOptions}
        foodComments={foodComments}
        setFoodComments={setFoodComments}
        setFoodOpen={setFoodOpen}
        handleFoodPlaceSave={handleFoodPlaceSave}
        isFoodSaving={isFoodSaving}
        buildAccentLeakGradient={buildAccentLeakGradient}
      />
      <Modal
  hideCloseButton
        isOpen={isFoodVisitSelectOpen}
        onOpenChange={(open) => {
          setIsFoodVisitSelectOpen(open);
          if (!open) {
            setFoodVisitPlaceSelected(null);
            setFoodVisitPlaceSearchQuery("");
            setFoodVisitPlaceSearchResults([]);
          }
        }}
        placement="center"
        size="lg"
        motionProps={modalMotionProps}
      >
        <ModalContent className="mx-4 my-6">
          {(onClose) => (
            <>
              <ModalHeader>Add food visit</ModalHeader>
              <ModalBody className="gap-4">
                {!foodVisitPlaceSelected ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Input
                        label="Search food places"
                        placeholder="Search for a place"
                        className="flex-1"
                        size="lg"
                        value={foodVisitPlaceSearchQuery}
                        onValueChange={(value) => {
                          setFoodVisitPlaceSearchQuery(value);
                          if (!value.trim()) {
                            setFoodVisitPlaceSearchResults([]);
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleFoodVisitPlaceSearch(
                              event.currentTarget.value,
                            );
                          }
                        }}
                      />
                      <Button
                        isIconOnly
                        variant="flat"
                        size="lg"
                        aria-label="Search food places"
                        onPress={() =>
                          handleFoodVisitPlaceSearch(foodVisitPlaceSearchQuery)
                        }
                        isLoading={isFoodVisitPlaceSearching}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      {isFoodVisitPlaceSearching ? (
                        Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={`visit-place-skeleton-${index}`}
                            className="flex w-full max-w-[300px] items-center gap-3"
                          >
                            <Skeleton className="flex h-12 w-12 rounded-full" />
                            <div className="flex w-full flex-col gap-2">
                              <Skeleton className="h-3 w-3/5 rounded-lg" />
                              <Skeleton className="h-3 w-4/5 rounded-lg" />
                            </div>
                          </div>
                        ))
                      ) : foodVisitPlaceSearchResults.length ? (
                        foodVisitPlaceSearchResults.map((place) => (
                          <Card
                            key={place.id}
                            className="overflow-hidden bg-white/80 dark:bg-neutral-900/70"
                            shadow="sm"
                            isPressable
                            onPress={() => setFoodVisitPlaceSelected(place)}
                          >
                            <CardBody className="gap-1">
                              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {place.name}
                              </p>
                              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                                {place.location_label}
                              </p>
                              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                                {place.cuisine || "Cuisine"}
                              </p>
                            </CardBody>
                          </Card>
                        ))
                      ) : (
                        <div className="rounded-2xl bg-white/80 p-4 text-sm text-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200">
                          Search for a food place to add a visit.
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
                        backgroundImage: foodVisitPlaceSelected.header_url
                          ? `url("${resolveHeaderUrl(
                              foodVisitPlaceSelected.header_url,
                            )}")`
                          : buildAccentLeakGradient(accentColor, isDarkMode),
                        backgroundSize: foodVisitPlaceSelected.header_url
                          ? "cover"
                          : "auto",
                        backgroundPosition: foodVisitPlaceSelected.header_url
                          ? "center"
                          : "left center",
                      }}
                    />
                    <CardFooter className="border-1 border-white/20 bg-white/70 py-2 absolute bottom-1 w-[calc(100%_-_8px)] rounded-large shadow-small ml-1 z-10 text-neutral-900 backdrop-blur dark:bg-neutral-900/70 dark:text-white">
                      <div className="text-left">
                        <p className="text-[10px] uppercase font-semibold tracking-wide text-neutral-600 dark:text-white/80">
                          Selected place
                        </p>
                        <p className="text-sm font-semibold">
                          {foodVisitPlaceSelected.name}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-white/70">
                          {foodVisitPlaceSelected.location_label}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-white/70">
                          {foodVisitPlaceSelected.cuisine || "Cuisine"}
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                )}
              </ModalBody>
              <ModalFooter>
                {foodVisitPlaceSelected ? (
                  <Button
                    variant="light"
                    onPress={() => setFoodVisitPlaceSelected(null)}
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
                  isDisabled={!foodVisitPlaceSelected}
                  onPress={() => {
                    if (!foodVisitPlaceSelected) {
                      return;
                    }
                    openFoodVisitModal(foodVisitPlaceSelected);
                    setIsFoodVisitSelectOpen(false);
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
        isOpen={isHelpDecideOpen}
        onOpenChange={(open) => {
          setIsHelpDecideOpen(open);
          if (!open) {
            setHelpDecideResult(null);
            setHelpDecideRadius(null);
            setHelpDecidePendingResult(null);
            setHelpDecidePendingRadius(null);
            setHelpDecideResponseReady(false);
            setHelpDecideVideoDone(false);
            setIsHelpDecideRolling(false);
            setIsHelpDecideRevealing(false);
          }
        }}
        placement="center"
        size="lg"
        motionProps={modalMotionProps}
      >
        <ModalContent className="mx-4 my-6">
          {(onClose) => (
            <>
              <ModalHeader>Help me decide</ModalHeader>
              <ModalBody className="gap-5">
                <Switch
                  isSelected={helpDecideLocationEnabled}
                  onValueChange={handleHelpDecideLocationToggle}
                >
                  Location access
                </Switch>
                <div className="grid gap-2">
                  <p className="text-sm font-semibold">Cuisine preference</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={
                        helpDecideCuisineSelection.has("all") ? "solid" : "flat"
                      }
                      color={
                        helpDecideCuisineSelection.has("all")
                          ? "primary"
                          : "default"
                      }
                      onPress={() =>
                        setHelpDecideCuisineSelection(new Set(["all"]))
                      }
                    >
                      All
                    </Button>
                    {Object.keys(foodCuisineOptions).map((category) => {
                      const isActive =
                        helpDecideCuisineSelection.has(category) &&
                        !helpDecideCuisineSelection.has("all");
                      return (
                        <Button
                          key={category}
                          size="sm"
                          variant={isActive ? "solid" : "flat"}
                          color={isActive ? "primary" : "default"}
                          onPress={() => {
                            setHelpDecideCuisineSelection((prev) => {
                              const next = new Set(prev);
                              next.delete("all");
                              if (next.has(category)) {
                                next.delete(category);
                              } else {
                                next.add(category);
                              }
                              return next.size ? next : new Set(["all"]);
                            });
                          }}
                        >
                          {category}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                {isHelpDecideRevealing ? (
                  <div className="overflow-hidden rounded-2xl bg-black/90 shadow-sm">
                    <video
                      key={helpDecideVideoKey}
                      ref={helpDecideVideoRef}
                      className="h-56 w-full object-cover"
                      playsInline
                      preload="auto"
                      onEnded={() => setHelpDecideVideoDone(true)}
                      onError={() => setHelpDecideVideoDone(true)}
                    >
                      <source src={helpDecideVideoUrl} type="video/mp4" />
                    </video>
                  </div>
                ) : helpDecideResult ? (
                  <Card
                    isFooterBlurred
                    radius="lg"
                    className="border-none overflow-hidden"
                    isPressable
                    onPress={() =>
                      navigate(`/food/place/${helpDecideResult.id}`)
                    }
                  >
                    <div
                      className="h-48 w-full"
                      style={{
                        backgroundImage: helpDecideResult.header_url
                          ? `url("${resolveHeaderUrl(
                              helpDecideResult.header_url,
                            )}")`
                          : buildAccentLeakGradient(accentColor, isDarkMode),
                        backgroundSize: helpDecideResult.header_url
                          ? "cover"
                          : "auto",
                        backgroundPosition: helpDecideResult.header_url
                          ? "center"
                          : "left center",
                      }}
                    />
                    <CardFooter className="border-1 border-white/20 bg-white/70 py-2 absolute bottom-1 w-[calc(100%_-_8px)] rounded-large shadow-small ml-1 z-10 text-neutral-900 backdrop-blur dark:bg-neutral-900/70 dark:text-white">
                      <div className="text-left">
                        <p className="text-[10px] uppercase font-semibold tracking-wide text-neutral-600 dark:text-white/80">
                          Recommended
                          {helpDecideRadius
                            ? ` • within ${helpDecideRadius}km`
                            : ""}
                        </p>
                        <p className="text-sm font-semibold">
                          {helpDecideResult.name}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-white/70">
                          {helpDecideResult.location_label}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-white/70">
                          {helpDecideResult.cuisine || "Cuisine"}
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
                  onPress={handleHelpDecideRoll}
                  isLoading={isHelpDecideRolling}
                >
                  Roll recommendation
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <FoodVisitModal
        isOpen={isFoodVisitOpen}
        onOpenChange={setIsFoodVisitOpen}
        modalMotionProps={modalMotionProps}
        foodEditingVisit={foodEditingVisit}
        foodVisitPhotoPreview={foodVisitPhotoPreview}
        isFoodVisitCropSaving={isFoodVisitCropSaving}
        accentColor={accentColor}
        isDarkMode={isDarkMode}
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
        buildAccentLeakGradient={buildAccentLeakGradient}
      />
      <Modal
        hideCloseButton
        isOpen={Boolean(foodVisitDetail)}
        onOpenChange={(open) => {
          if (!open) {
            setFoodVisitDetail(null);
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
            const visit = foodVisitDetail;
            if (!visit) {
              return null;
            }
            const visitImage = resolveHeaderUrl(visit.photo_url);
            const ratingValue = visit.rating ?? 0;
            const dishCount =
              visit.dish_count ?? (visit.dishes ? visit.dishes.length : 0);
            const comments = foodVisitComments[visit.id] || [];
            const detailAgainIconMap = {
              yes: Check,
              no: X,
            };
            const detailAgainClassMap = {
              yes: "bg-emerald-500 text-white",
              maybe: "bg-orange-500 text-white",
              no: "bg-rose-500 text-white",
            };
            const AgainIcon = detailAgainIconMap[visit.again] || null;
            const againClasses = detailAgainClassMap[visit.again] || "";
            const againLabel =
              visit.again === "yes"
                ? "Would eat again"
                : visit.again === "no"
                  ? "Would not eat again"
                  : visit.again === "maybe"
                    ? "Maybe eat again"
                    : null;
            const visitUpdatedBy = visit.updated_by_name || "Unknown";
            const visitUpdatedAt = visit.updated_at
              ? formatRelativeTime(visit.updated_at) ||
                formatCheckInDate(visit.updated_at)
              : "";
            return (
              <motion.div
                layoutId={`food-visit-card-${visit.id}`}
                className="relative flex h-full w-full flex-1 flex-col min-h-0"
                transition={{ type: "spring", stiffness: 260, damping: 38 }}
              >
                <motion.div
                  layoutId={`food-visit-bg-${visit.id}`}
                  className="absolute inset-0 z-0 rounded-3xl bg-white shadow-medium dark:bg-neutral-900"
                  transition={{ type: "spring", stiffness: 260, damping: 38 }}
                />
                <div className="relative z-10">
                  <motion.div
                    layoutId={`food-visit-hero-${visit.id}`}
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
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                        <span>
                          {visit.visited_at
                            ? formatCheckInDate(visit.visited_at)
                            : "Unknown date"}
                        </span>
                        {AgainIcon ? (
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full ${againClasses}`}
                            aria-label={againLabel || undefined}
                            title={againLabel || undefined}
                          >
                            <AgainIcon className="h-3.5 w-3.5" />
                          </span>
                        ) : visit.again === "maybe" ? (
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full ${againClasses}`}
                            aria-label={againLabel || undefined}
                            title={againLabel || undefined}
                          >
                            <QuestionMarkIcon className="h-3.5 w-3.5" />
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-amber-500">
                        {renderStarRow(ratingValue, `visit-detail-${visit.id}`)}
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {ratingValue.toFixed(1)}
                        </span>
                        <span className="text-xs text-neutral-600 dark:text-neutral-300">
                          {dishCount} {dishCount === 1 ? "dish" : "dishes"}
                        </span>
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
                  <Button
                    isIconOnly
                    variant="flat"
                    className="absolute right-16 top-4 bg-white/80 text-neutral-900 dark:bg-neutral-900/70 dark:text-neutral-100"
                    onPress={() => {
                      openFoodVisitEdit(visit, foodVisitPlace);
                      onClose();
                    }}
                    aria-label="Edit visit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <ModalBody className="relative z-10 flex-1 min-h-0 gap-6 px-6 pb-10 pt-6 overflow-y-auto">
                    {visit.updated_at || visit.updated_by_name ? (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        Last edited by {visitUpdatedBy}
                        {visitUpdatedAt ? ` • ${visitUpdatedAt}` : ""}
                      </div>
                    ) : null}
                    {visit.description ? (
                      <div className="rounded-2xl bg-white/80 p-4 text-sm text-neutral-700 shadow-sm dark:bg-neutral-900/60 dark:text-neutral-200">
                        {visit.description}
                      </div>
                    ) : null}
                    <div className="grid gap-3">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        Orders
                      </p>
                      <div className="grid gap-2">
                        {(visit.dishes || []).length ? (
                          visit.dishes.map((dish, index) => (
                            <div
                              key={`${visit.id}-dish-${index}`}
                              className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 text-sm text-neutral-700 shadow-sm dark:bg-neutral-900/60 dark:text-neutral-200"
                            >
                              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {dish.name}
                              </span>
                              <div className="flex items-center gap-2 text-amber-500">
                                {renderStarRow(
                                  dish.rating || 0,
                                  `${visit.id}-dish-${index}`,
                                )}
                                <span className="text-xs text-neutral-600 dark:text-neutral-300">
                                  {(dish.rating || 0).toFixed(1)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-neutral-600 shadow-sm dark:bg-neutral-900/60 dark:text-neutral-200">
                            No dishes recorded.
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        Comments
                      </p>
                      <div className="grid gap-2">
                        {isFoodVisitCommentsLoading ? (
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
                                    src={resolveAvatarUrl(
                                      comment.user_avatar_url,
                                    )}
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
                                        startContent={
                                          <Trash2 className="h-4 w-4" />
                                        }
                                        onPress={() =>
                                          setFoodVisitCommentDeleteTarget(
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
                          key={`${visit.id}-${foodVisitCommentInputKey}`}
                          onValueChange={(value) => {
                            foodVisitCommentDraftRef.current[visit.id] = value;
                          }}
                        />
                        <Button
                          color="primary"
                          onPress={() => handleFoodVisitCommentAdd(visit.id)}
                          isLoading={isFoodVisitCommentSaving}
                          isDisabled={isFoodVisitCommentSaving}
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
      <Modal
  hideCloseButton
        isOpen={Boolean(foodVisitCommentDeleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setFoodVisitCommentDeleteTarget(null);
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
                  onPress={confirmDeleteFoodVisitComment}
                  isLoading={isDeletingFoodVisitComment}
                  isDisabled={isDeletingFoodVisitComment}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <ImageCropperModal
        isOpen={isFoodHeaderCropOpen}
        onOpenChange={setIsFoodHeaderCropOpen}
        motionProps={modalMotionProps}
        title="Crop header"
        imageSrc={foodHeaderCropImageSrc}
        crop={foodHeaderCrop}
        setCrop={setFoodHeaderCrop}
        zoom={foodHeaderZoom}
        setZoom={setFoodHeaderZoom}
        aspect={3 / 2}
        cropShape="rect"
        onCropComplete={(_, pixels) => setFoodHeaderCroppedAreaPixels(pixels)}
        onConfirm={handleFoodHeaderCropConfirm}
        confirmLabel="Use header"
        isSaving={isFoodHeaderCropSaving}
      />
      <ImageCropperModal
        isOpen={isFoodVisitCropOpen}
        onOpenChange={setIsFoodVisitCropOpen}
        motionProps={modalMotionProps}
        title="Crop photo"
        imageSrc={foodVisitCropImageSrc}
        crop={foodVisitCrop}
        setCrop={setFoodVisitCrop}
        zoom={foodVisitZoom}
        setZoom={setFoodVisitZoom}
        aspect={4 / 3}
        cropShape="rect"
        onCropComplete={(_, pixels) => setFoodVisitCroppedAreaPixels(pixels)}
        onConfirm={handleFoodVisitCropConfirm}
        confirmLabel="Use photo"
        isSaving={isFoodVisitCropSaving}
        containerClassName="relative w-full overflow-hidden rounded-2xl bg-neutral-900 aspect-[4/3]"
      />
    </>
  );
}
