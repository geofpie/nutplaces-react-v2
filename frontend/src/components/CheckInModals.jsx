import { I18nProvider } from "@react-aria/i18n";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
  TimeInput,
} from "@heroui/react";
import { LocateFixed, Search } from "lucide-react";

export default function CheckInModals({
  isTripModalOpen,
  setIsTripModalOpen,
  selectedTrip,
  setSelectedTrip,
  modalMotionProps,
  tripImages,
  accentColor,
  isDarkMode,
  isTripLoading,
  selectedTripCheckInGroups,
  buildAccentLeakGradient,
  isManualCheckInOpen,
  setIsManualCheckInOpen,
  manualDate,
  setManualDate,
  manualTime,
  setManualTime,
  locationQuery,
  setLocationQuery,
  fetchLocationSearch,
  isSearchingLocation,
  isLocating,
  handleLocateMe,
  locationResults,
  isLocationCollapsed,
  selectedLocation,
  setSelectedLocation,
  setIsLocationCollapsed,
  handleManualCheckInSave,
  isManualCheckInSaving,
  getLocalTimeZone,
  today,
  deleteCheckInTarget,
  setDeleteCheckInTarget,
  confirmDeleteCheckIn,
  isDeletingCheckIn,
}) {
  return (
    <>
      <Modal
  hideCloseButton
        isOpen={isTripModalOpen}
        onOpenChange={(open) => {
          setIsTripModalOpen(open);
          if (!open) {
            setSelectedTrip(null);
          }
        }}
        placement="center"
        size="md"
        motionProps={modalMotionProps}
      >
        <ModalContent className="relative mx-4 overflow-hidden">
          {(onClose) => (
            <>
              <ModalHeader className="sr-only">
                {selectedTrip?.display || "Trip details"}
              </ModalHeader>
              <ModalBody className="gap-4 p-0">
                <div
                  className="relative h-56 w-full overflow-hidden"
                  style={{
                    backgroundImage:
                      selectedTrip && tripImages[selectedTrip.id]
                        ? `url("${tripImages[selectedTrip.id]}")`
                        : buildAccentLeakGradient(accentColor, isDarkMode),
                    backgroundSize:
                      selectedTrip && tripImages[selectedTrip.id]
                        ? "cover"
                        : "auto",
                    backgroundPosition:
                      selectedTrip && tripImages[selectedTrip.id]
                        ? "center"
                        : "left center",
                  }}
                >
                  <div className="absolute bottom-2 left-2">
                    <div className="inline-flex rounded-2xl border border-white/20 bg-neutral-900/70 px-4 py-2 text-sm font-semibold text-white shadow-small backdrop-blur">
                      <div className="text-left">
                        <p className="text-[10px] uppercase font-semibold tracking-wide text-white/80">
                          {selectedTrip?.monthLabel || ""}
                        </p>
                        <p className="text-sm font-semibold text-white">
                          {(selectedTrip?.countries || []).join(", ") ||
                            "Unknown country"}
                        </p>
                        <p className="text-xs text-white/70">
                          {(selectedTrip?.cities || []).join(", ") ||
                            selectedTrip?.display ||
                            "Unknown city"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2 px-4 pb-4">
                  {isTripLoading ? (
                    <div className="grid gap-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={`trip-skeleton-${index}`}
                          className="flex items-center gap-3"
                        >
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex w-full flex-col gap-2">
                            <Skeleton className="h-3 w-3/5 rounded-lg" />
                            <Skeleton className="h-3 w-2/5 rounded-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedTripCheckInGroups.length ? (
                    <div className="space-y-4">
                      {selectedTripCheckInGroups.map((group, index) => (
                        <div key={group.label} className="relative pl-6">
                          <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-neutral-900/70 dark:bg-white/80" />
                          {index !== selectedTripCheckInGroups.length - 1 ? (
                            <div className="absolute left-[11px] top-4 h-full w-px bg-neutral-200 dark:bg-neutral-800" />
                          ) : null}
                          <div className="grid gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                              {group.label}
                            </p>
                            {group.entries.map((entry) => (
                              <Card
                                key={entry.id}
                                className="bg-white/80 shadow-none dark:bg-neutral-900/60"
                              >
                                <CardBody className="py-3">
                                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                    {entry.location_name ||
                                      entry.location_label}
                                  </p>
                                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                                    {entry.location_label}
                                  </p>
                                </CardBody>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      No check ins recorded yet.
                    </p>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
  hideCloseButton
        isOpen={isManualCheckInOpen}
        onOpenChange={setIsManualCheckInOpen}
        placement="center"
        size="lg"
        motionProps={modalMotionProps}
      >
        <ModalContent className="mx-4">
          {(onClose) => (
            <>
              <ModalHeader>Manual check in</ModalHeader>
              <ModalBody className="gap-4">
                <div className="grid gap-2">
                  <I18nProvider locale="en-GB">
                    <DatePicker
                      label="Date"
                      className="w-full"
                      value={manualDate}
                      onChange={setManualDate}
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
                      onPress={() => setManualDate(today(getLocalTimeZone()))}
                    >
                      Today
                    </Button>
                  </ButtonGroup>
                </div>
                <TimeInput
                  label="Time"
                  value={manualTime}
                  onChange={setManualTime}
                />
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      label="Location search"
                      placeholder="Search for a place"
                      className="flex-1"
                      size="lg"
                      value={locationQuery}
                      onChange={(event) => setLocationQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          fetchLocationSearch(locationQuery);
                        }
                      }}
                    />
                    <Button
                      isIconOnly
                      variant="flat"
                      size="lg"
                      aria-label="Search location"
                      onPress={() => fetchLocationSearch(locationQuery)}
                      isLoading={isSearchingLocation}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      isIconOnly
                      variant="flat"
                      size="lg"
                      aria-label="Locate me"
                      onPress={handleLocateMe}
                      isLoading={isLocating}
                    >
                      <LocateFixed className="h-4 w-4" />
                    </Button>
                  </div>
                  <div
                    className={`grid gap-2 transition-[max-height,opacity] duration-300 ease-out ${
                      isSearchingLocation || locationResults.length
                        ? "max-h-[520px] opacity-100 overflow-visible"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    {isSearchingLocation
                      ? Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={`skeleton-${index}`}
                            className="flex w-full max-w-[300px] items-center gap-3"
                          >
                            <Skeleton className="flex h-12 w-12 rounded-full" />
                            <div className="flex w-full flex-col gap-2">
                              <Skeleton className="h-3 w-3/5 rounded-lg" />
                              <Skeleton className="h-3 w-4/5 rounded-lg" />
                            </div>
                          </div>
                        ))
                      : (isLocationCollapsed && selectedLocation
                          ? [selectedLocation]
                          : locationResults
                        ).map((result) => (
                          <Card
                            key={result.id}
                            className={`overflow-hidden border ${
                              selectedLocation?.id === result.id
                                ? "border-neutral-900/50 dark:border-white/60"
                                : "border-transparent"
                            } bg-white/80 dark:bg-neutral-900/70`}
                            shadow="sm"
                            isPressable
                            onPress={() => {
                              setSelectedLocation(result);
                              setIsLocationCollapsed(true);
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
                    {isLocationCollapsed && locationResults.length > 1 ? (
                      <Button
                        variant="light"
                        size="sm"
                        onPress={() => setIsLocationCollapsed(false)}
                      >
                        View more
                      </Button>
                    ) : null}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleManualCheckInSave}
                  isLoading={isManualCheckInSaving}
                  isDisabled={isManualCheckInSaving}
                >
                  Save check in
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
  hideCloseButton
        isOpen={Boolean(deleteCheckInTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteCheckInTarget(null);
          }
        }}
        placement="center"
        size="sm"
        motionProps={modalMotionProps}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete check in?</ModalHeader>
              <ModalBody>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  This will permanently remove the check in.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={confirmDeleteCheckIn}
                  isLoading={isDeletingCheckIn}
                  isDisabled={isDeletingCheckIn}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
