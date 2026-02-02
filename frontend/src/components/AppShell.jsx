import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tab,
  Tabs,
} from "@heroui/react";
import {
  ArrowLeft,
  BookOpen,
  Footprints,
  Home,
  ListOrdered,
  LocateFixed,
  LogOut,
  MapPin,
  MapPinned,
  Pencil,
  Plus,
  Settings,
  UserCircle2,
  Utensils,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Food", path: "/food" },
  { label: "Activities", path: "/activities" },
  { label: "Check In", path: "/check-in" },
];

const NAV_ICON_BY_PATH = {
  "/": Home,
  "/food": Utensils,
  "/activities": Footprints,
  "/check-in": MapPin,
};

export default function AppShell({
  children,
  isAuthenticated,
  isScrolled,
  headerTitleClass,
  isDetailPage,
  navigate,
  currentPath,
  profile,
  resolveAvatarUrl,
  handleLogout,
  accentColor,
  setIsFoodVisitSelectOpen,
  openFoodPlaceModal,
  handleQuickCheckIn,
  openManualCheckIn,
  openActivityModal,
  appStyle,
}) {
  return (
    <div
      className="min-h-screen bg-neutral-50 text-neutral-900 font-[Outfit] dark:bg-neutral-950 dark:text-neutral-100"
      style={appStyle}
    >
      {isAuthenticated ? (
        <header
          className={`fixed left-0 right-0 top-0 z-40 px-6 transition-all ${
            isScrolled
              ? "bg-white/70 pb-4 pt-3 backdrop-blur-xl dark:bg-neutral-900/70"
              : "bg-transparent pb-4 pt-4"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isScrolled && isDetailPage ? (
                <Button
                  isIconOnly
                  className="h-9 w-9 rounded-full bg-white/70 text-neutral-900 shadow-md backdrop-blur dark:bg-neutral-900/60 dark:text-neutral-100"
                  onPress={() => navigate(-1)}
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              ) : null}
              <p className={`text-sm font-semibold ${headerTitleClass}`}>
                nut places
              </p>
            </div>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  name={profile?.display_name || "User"}
                  size="sm"
                  src={resolveAvatarUrl(profile?.avatar_url)}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem
                  key="profile"
                  className="h-16 gap-3"
                  isReadOnly
                  startContent={
                    <Avatar
                      name={profile?.display_name || "User"}
                      size="sm"
                      src={resolveAvatarUrl(profile?.avatar_url)}
                    />
                  }
                >
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold">
                      {profile?.display_name || "User"}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {profile?.telegram_uid || "UID"}
                    </p>
                  </div>
                </DropdownItem>
                <DropdownItem
                  key="profile-page"
                  onPress={() => navigate("/profile")}
                  startContent={<UserCircle2 className="h-4 w-4" />}
                >
                  Profile
                </DropdownItem>
                <DropdownItem
                  key="journal"
                  startContent={<BookOpen className="h-4 w-4" />}
                  onPress={() => navigate("/journal")}
                >
                  Journal
                </DropdownItem>
                <DropdownItem
                  key="tierlist"
                  startContent={<ListOrdered className="h-4 w-4" />}
                  onPress={() => navigate("/tierlist")}
                >
                  Tierlist
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  onPress={handleLogout}
                  startContent={<LogOut className="h-4 w-4" />}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </header>
      ) : null}
      {children}
      {isAuthenticated ? (
        <nav className="fixed bottom-4 left-1/2 z-50 flex w-[min(92vw,640px)] -translate-x-1/2 items-center gap-2">
          <div className="w-[calc(100%-3.75rem)] min-w-0 rounded-full bg-white/30 p-1 shadow-[0_18px_45px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:bg-neutral-900/30 dark:shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
            <Tabs
              aria-label="Main navigation"
              className="w-full"
              selectedKey={currentPath}
              onSelectionChange={(key) => {
                if (typeof key === "string") {
                  navigate(key);
                }
              }}
              classNames={{
                tabList:
                  "grid grid-cols-4 w-full gap-2 rounded-full p-1 bg-transparent",
                tab: "w-full h-auto rounded-full py-0.5",
                tabContent: "text-xs font-medium px-3 py-0.5",
                cursor: "rounded-full",
              }}
              variant="light"
            >
              {NAV_ITEMS.map((item) => {
                const Icon = NAV_ICON_BY_PATH[item.path];
                return (
                  <Tab
                    key={item.path}
                    title={
                      <span className="flex flex-col items-center gap-1">
                        {Icon ? (
                          <Icon aria-hidden="true" className="h-4 w-4" />
                        ) : null}
                        <span>{item.label}</span>
                      </span>
                    }
                  />
                );
              })}
            </Tabs>
          </div>
          <Dropdown placement="top-end">
            <DropdownTrigger>
              <Button
                isIconOnly
                aria-label="Quick actions"
                className="h-11 w-11 rounded-full text-white shadow-[0_16px_35px_rgba(0,0,0,0.35)]"
                style={{ backgroundColor: accentColor }}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Quick actions">
              <DropdownItem
                key="add-visit"
                startContent={<Utensils className="h-4 w-4" />}
                onPress={() => setIsFoodVisitSelectOpen(true)}
              >
                Add new food visit
              </DropdownItem>
              <DropdownItem
                key="add-place"
                startContent={<MapPinned className="h-4 w-4" />}
                onPress={openFoodPlaceModal}
              >
                Add new food place
              </DropdownItem>
              <DropdownItem
                key="quick-check-in"
                startContent={<LocateFixed className="h-4 w-4" />}
                onPress={handleQuickCheckIn}
              >
                Quick check in
              </DropdownItem>
              <DropdownItem
                key="manual-check-in"
                startContent={<Pencil className="h-4 w-4" />}
                onPress={openManualCheckIn}
              >
                Manual check in
              </DropdownItem>
              <DropdownItem
                key="log-activity"
                startContent={<Footprints className="h-4 w-4" />}
                onPress={() => openActivityModal()}
              >
                Log activity
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </nav>
      ) : null}
    </div>
  );
}
