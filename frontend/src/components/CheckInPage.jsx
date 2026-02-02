import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Tab,
  Tabs,
} from "@heroui/react";
import {
  LocateFixed,
  MapPin,
  Pencil,
  Plane,
  Plus,
  Search,
} from "lucide-react";
import HeroSection from "./HeroSection.jsx";
import HeroInfoPill from "./HeroInfoPill.jsx";
import HeroActionButton from "./HeroActionButton.jsx";
import StatCard from "./StatCard.jsx";

export default function CheckInPage({
  mapContainerRef,
  accentColor,
  isDarkMode,
  buildAccentLeakGradient,
  formatMonthYear,
  checkInStats,
  isCheckInMenuOpen,
  setIsCheckInMenuOpen,
  handleQuickCheckIn,
  openManualCheckIn,
  isQuickCheckInSaving,
  topAllTimeMapContainerRef,
  topYearMapContainerRef,
  latestTrip,
  tripImages,
  openTripModal,
  checkInTab,
  setCheckInTab,
  checkInSearchQuery,
  setCheckInSearchQuery,
  checkInSearchError,
  setCheckInSearchError,
  handleCheckInSearch,
  checkInYear,
  setCheckInYear,
  checkInMonth,
  setCheckInMonth,
  checkInYears,
  availableMonths,
  sortedCheckIns,
  parseCheckInDate,
  openEditCheckIn,
  setDeleteCheckInTarget,
  checkInPage,
  checkInTotal,
  CHECK_IN_ITEMS_PER_PAGE,
  setCheckInPage,
  tripEntries,
  formatCheckInDate,
}) {
  return (
    <section className="grid gap-6">
      <HeroSection
        heightClass="h-[40vh] min-h-[280px] md:h-[65vh] md:min-h-[520px]"
        backgroundNode={
          <div
            ref={mapContainerRef}
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: buildAccentLeakGradient(accentColor, isDarkMode),
              backgroundPosition: "left center",
            }}
          />
        }
      >
        <HeroInfoPill>
          <div className="border-1 border-white/20 bg-white/70 py-2 px-4 rounded-large shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:text-white/80">
              {formatMonthYear(new Date())}
            </p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {checkInStats.month} check ins
            </p>
          </div>
        </HeroInfoPill>
        <HeroActionButton>
          <Dropdown
            placement="top-end"
            isOpen={isCheckInMenuOpen}
            onOpenChange={setIsCheckInMenuOpen}
          >
            <DropdownTrigger>
              <Button
                isIconOnly
                className="h-16 w-16 rounded-full bg-white/70 text-neutral-900 shadow-xl backdrop-blur dark:bg-neutral-900/60 dark:text-neutral-100"
              >
                <MapPin className="h-6 w-6" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Check in options">
              <DropdownItem
                key="quick"
                startContent={<LocateFixed className="h-4 w-4" />}
                onPress={handleQuickCheckIn}
                isDisabled={isQuickCheckInSaving}
              >
                Quick check in
              </DropdownItem>
              <DropdownItem
                key="manual"
                startContent={<Pencil className="h-4 w-4" />}
                onPress={openManualCheckIn}
              >
                Manual check in
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </HeroActionButton>
      </HeroSection>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total visits", value: checkInStats.total },
          { label: "This year", value: checkInStats.year },
          { label: "This month", value: checkInStats.month },
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
          {
            label: "All-time top",
            entry: checkInStats.top_all_time,
            mapRef: topAllTimeMapContainerRef,
          },
          {
            label: "This year top",
            entry: checkInStats.top_year,
            mapRef: topYearMapContainerRef,
          },
        ].map((item) => {
          const hasCoords =
            Number.isFinite(item.entry?.latitude) &&
            Number.isFinite(item.entry?.longitude);
          return (
            <Card
              key={item.label}
              isFooterBlurred
              radius="lg"
              className="border-none aspect-square overflow-hidden"
            >
              {hasCoords ? (
                <div
                  ref={item.mapRef}
                  className="relative z-0 h-full w-full pointer-events-none"
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
              <CardFooter className="border-1 border-white/20 before:bg-white/10 py-2 absolute bottom-1 w-[calc(100%_-_8px)] rounded-large shadow-small ml-1 z-20 text-neutral-900 dark:text-white">
                <div className="text-left">
                  <p className="text-[10px] uppercase font-semibold tracking-wide text-neutral-700 dark:text-white/80">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {item.entry?.label || "No check ins yet"}
                  </p>
                  <p className="text-xs text-neutral-700 dark:text-white/70">
                    {item.entry
                      ? `${item.entry.count} check-ins`
                      : "Add your first visit"}
                  </p>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <Card
        isFooterBlurred
        radius="lg"
        className="border-none overflow-hidden"
        isPressable={Boolean(latestTrip)}
        onPress={() => latestTrip && openTripModal(latestTrip)}
      >
        <div
          className="h-48 w-full"
          style={{
            backgroundImage:
              latestTrip && tripImages[latestTrip.id]
                ? `url(\"${tripImages[latestTrip.id]}\")`
                : buildAccentLeakGradient(accentColor, isDarkMode),
            backgroundSize:
              latestTrip && tripImages[latestTrip.id] ? "cover" : "auto",
            backgroundPosition:
              latestTrip && tripImages[latestTrip.id] ? "center" : "left center",
          }}
        />
        <CardFooter className="border-1 border-white/20 bg-white/70 py-2 absolute bottom-1 w-[calc(100%_-_8px)] rounded-large shadow-small ml-1 z-10 text-neutral-900 backdrop-blur dark:bg-neutral-900/70 dark:text-white">
          <div className="text-left">
            <p className="text-[10px] uppercase font-semibold tracking-wide text-neutral-600 dark:text-white/80">
              Latest Trip
            </p>
            <p className="text-sm font-semibold">
              {latestTrip
                ? latestTrip.countries.length > 1
                  ? latestTrip.countries.join(", ")
                  : latestTrip.countries[0] || "Trip"
                : "No trips yet"}
            </p>
            <p className="text-xs text-neutral-600 dark:text-white/70">
              {latestTrip
                ? latestTrip.countries.length > 1
                  ? "Multi-country trip"
                  : latestTrip.cities.length
                    ? latestTrip.cities.join(", ")
                    : "Add more check ins"
                : "Start exploring"}
            </p>
          </div>
        </CardFooter>
      </Card>
      <Tabs
        aria-label="Check in tabs"
        selectedKey={checkInTab}
        onSelectionChange={(key) => {
          if (typeof key === "string") {
            setCheckInTab(key);
            setCheckInPage(1);
          }
        }}
        className="w-full"
        variant="light"
        classNames={{
          tabList: "w-full gap-2 rounded-full p-1 bg-white/70 dark:bg-neutral-900/60",
          tab: "flex-1 h-auto rounded-full py-2.5",
          tabContent: "flex items-center gap-2 text-sm font-semibold",
          cursor: "rounded-full",
        }}
      >
        <Tab
          key="checkins"
          title={
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Check ins
            </span>
          }
        />
        <Tab
          key="trips"
          title={
            <span className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Trips
            </span>
          }
        />
      </Tabs>
      <div className="grid gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={`Search ${checkInTab === "trips" ? "trips" : "check ins"}`}
              className="w-full"
              size="lg"
              value={checkInTab === "checkins" ? checkInSearchQuery : ""}
              onValueChange={(value) => {
                if (checkInTab !== "checkins") {
                  return;
                }
                setCheckInSearchQuery(value);
                if (checkInSearchError) {
                  setCheckInSearchError(false);
                }
              }}
              isInvalid={checkInTab === "checkins" && checkInSearchError}
              startContent={
                <Search className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" && checkInTab === "checkins") {
                  handleCheckInSearch();
                }
              }}
            />
            {checkInTab === "checkins" && checkInSearchError ? (
              <div className="pointer-events-none absolute -top-9 left-2 z-10 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                Please enter a search query.
              </div>
            ) : null}
          </div>
          <Button
            isIconOnly
            size="lg"
            onPress={() => {
              if (checkInTab === "checkins") {
                handleCheckInSearch();
              }
            }}
            className="h-12 w-12 rounded-full bg-white/80 text-neutral-900 shadow-xl backdrop-blur dark:bg-neutral-900/70 dark:text-neutral-100"
          >
            <Search className="h-4 w-4" />
          </Button>
          {checkInTab === "checkins" ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  className="h-12 w-12 rounded-full bg-white/80 text-neutral-900 shadow-xl backdrop-blur dark:bg-neutral-900/70 dark:text-neutral-100"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Check in options">
                <DropdownItem
                  key="quick"
                  startContent={<LocateFixed className="h-4 w-4" />}
                  onPress={handleQuickCheckIn}
                >
                  Quick check in
                </DropdownItem>
                <DropdownItem
                  key="manual"
                  startContent={<Pencil className="h-4 w-4" />}
                  onPress={openManualCheckIn}
                >
                  Manual check in
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : null}
        </div>
        {checkInTab === "checkins" ? (
          <div className="flex flex-wrap gap-2">
            <Dropdown placement="bottom-start">
              <DropdownTrigger>
                <Button variant="flat">Year: {checkInYear || "All"}</Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filter year"
                onAction={(key) => setCheckInYear(String(key))}
              >
                {checkInYears.map((year) => (
                  <DropdownItem key={year}>{year}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown placement="bottom-start">
              <DropdownTrigger>
                <Button variant="flat">
                  Month:{" "}
                  {checkInMonth === "all"
                    ? "All"
                    : MONTH_LABELS[Number(checkInMonth) - 1]}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filter month"
                onAction={(key) => setCheckInMonth(String(key))}
              >
                <DropdownItem key="all">All</DropdownItem>
                {availableMonths.map((month) => (
                  <DropdownItem key={month.value}>{month.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        ) : null}
        {checkInTab === "checkins" ? (
          <div className="grid gap-3">
            {sortedCheckIns.map((entry, index) => {
              const parsed = parseCheckInDate(entry.visited_at);
              const year = parsed.getFullYear();
              const monthIndex = parsed.getMonth();
              const dayIndex = parsed.getDate();
              const dayLabel = formatCheckInDate(parsed);
              const prev = sortedCheckIns[index - 1];
              const prevDate = prev ? parseCheckInDate(prev.visited_at) : null;
              const showDivider =
                !prevDate ||
                prevDate.getFullYear() !== year ||
                prevDate.getMonth() !== monthIndex ||
                prevDate.getDate() !== dayIndex;
              return (
                <div key={entry.id}>
                  {showDivider ? (
                    <p className="pb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      {dayLabel}
                    </p>
                  ) : null}
                  <Card className="bg-white/80 shadow-none dark:bg-neutral-900/60">
                    <CardBody className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {entry.location_label}
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-300">
                            {entry.location_name || entry.location_label}
                          </p>
                        </div>
                        <Dropdown placement="bottom-end">
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              ...
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Check in actions">
                            <DropdownItem
                              key="edit"
                              onPress={() => openEditCheckIn(entry)}
                            >
                              Edit check in
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              color="danger"
                              onPress={() => setDeleteCheckInTarget(entry)}
                            >
                              Delete check in
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              );
            })}
            <Pagination
              page={checkInPage}
              total={Math.max(
                1,
                Math.ceil(checkInTotal / CHECK_IN_ITEMS_PER_PAGE),
              )}
              onChange={setCheckInPage}
              className="self-center"
            />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {tripEntries.map((trip) => (
              <Card
                key={trip.id}
                isFooterBlurred
                radius="lg"
                className="border-none overflow-hidden"
                isPressable
                onPress={() => openTripModal(trip)}
              >
                <div
                  className="h-44 w-full"
                  style={{
                    backgroundImage: tripImages[trip.id]
                      ? `url(\"${tripImages[trip.id]}\")`
                      : buildAccentLeakGradient(accentColor, isDarkMode),
                    backgroundSize: tripImages[trip.id] ? "cover" : "auto",
                    backgroundPosition: tripImages[trip.id]
                      ? "center"
                      : "left center",
                  }}
                />
                <CardFooter className="border-1 border-white/20 bg-white/70 py-2 absolute bottom-1 w-[calc(100%_-_8px)] rounded-large shadow-small ml-1 z-10 text-neutral-900 backdrop-blur dark:bg-neutral-900/70 dark:text-white">
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-semibold tracking-wide text-neutral-600 dark:text-white/80">
                      {trip.monthLabel}
                    </p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {trip.display}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-white/70">
                      {(trip.countries || []).join(", ") || "Unknown country"}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
