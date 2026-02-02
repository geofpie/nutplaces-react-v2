import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
} from "@heroui/react";
import {
  Cake,
  Footprints,
  ListOrdered,
  MapPin,
  MessageSquare,
  Pencil,
  Settings,
  Star,
  Utensils,
} from "lucide-react";

export default function ProfilePage({
  profile,
  isDarkMode,
  ACCENT_COLORS,
  resolveHeaderUrl,
  resolveAvatarUrl,
  buildAccentLeakGradient,
  formatBirthday,
  formatCheckInDate,
  formatRelativeTime,
  openEditProfile,
  setIsPinModalOpen,
  handleRevokeDevice,
  getDeviceIcon,
  activityLog,
  isActivityLogLoading,
}) {
  return (
    <section className="w-full rounded-3xl px-2 pt-10 md:mx-auto md:max-w-5xl">
      {profile ? (
        <div className="grid gap-6">
          <Card className="bg-white/80 shadow-xl dark:bg-neutral-900/70">
            <CardBody className="px-8 pb-8 pt-0">
              <div className="grid gap-4">
                <div className="relative -mx-8 overflow-visible rounded-t-3xl">
                  {profile.header_url ? (
                    <img
                      alt="Profile header"
                      className="h-56 w-full object-cover"
                      src={resolveHeaderUrl(profile.header_url)}
                    />
                  ) : (
                    <div
                      className="h-56 w-full"
                      style={{
                        backgroundImage: buildAccentLeakGradient(
                          profile.accent_color || ACCENT_COLORS[0].value,
                          isDarkMode,
                        ),
                        backgroundPosition: "left center",
                      }}
                    />
                  )}
                  <div className="absolute -bottom-12 left-6 right-6 z-10 flex items-end justify-between">
                    <Avatar
                      name={profile.display_name || "User"}
                      size="lg"
                      className="h-[88px] w-[88px] border border-neutral-300 dark:border-neutral-700"
                      src={resolveAvatarUrl(profile.avatar_url)}
                    />
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="flat">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Profile settings">
                        <DropdownItem
                          key="change-pin"
                          startContent={<Pencil className="h-4 w-4" />}
                          onPress={() => setIsPinModalOpen(true)}
                        >
                          Change PIN
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
                <div className="pt-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        {profile.display_name || "User"}
                      </h2>
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                        {profile.telegram_uid}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={openEditProfile}
                      className="w-full sm:w-auto"
                    >
                      Edit profile
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-6 text-sm text-neutral-700 dark:text-neutral-300">
                    <div>
                      <span className="font-semibold">0</span> food spots
                    </div>
                    <div>
                      <span className="font-semibold">0</span> activities
                    </div>
                    <div className="flex items-center gap-2">
                      <Cake className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      <span className="font-semibold">
                        {formatBirthday(profile.birthday)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          <Accordion variant="splitted" className="px-0">
            <AccordionItem
              key="trusted-devices"
              aria-label="Trusted devices"
              title="Trusted devices"
            >
              <div className="grid gap-3 pb-4">
                {profile.trusted_devices
                  .filter((device) => !device.revoked_at)
                  .map((device) => (
                    <Card
                      key={device.id}
                      className="bg-neutral-100/80 shadow-none dark:bg-neutral-800/70"
                    >
                      <CardHeader className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {(() => {
                            const Icon = getDeviceIcon(
                              device.user_agent,
                              device.device_name,
                            );
                            return (
                              <span className="mt-0.5 rounded-full bg-white/70 p-2 text-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200">
                                <Icon className="h-4 w-4" />
                              </span>
                            );
                          })()}
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">
                              {device.device_name || "Device"}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {device.user_agent || "Unknown user agent"}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <Divider />
                      <CardBody className="pt-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                              Trusted until
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {device.trusted_until}
                            </p>
                          </div>
                          <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                ...
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                              aria-label="Device actions"
                              classNames={{
                                base: "backdrop-blur-lg bg-white/40 dark:bg-neutral-900/40",
                              }}
                            >
                              <DropdownItem
                                key="revoke"
                                color="danger"
                                onPress={() => handleRevokeDevice(device.id)}
                              >
                                Revoke
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                {!profile.trusted_devices.filter((device) => !device.revoked_at)
                  .length ? (
                  <div className="rounded-2xl bg-neutral-100/80 p-4 text-sm text-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-200">
                    No trusted devices yet.
                  </div>
                ) : null}
              </div>
            </AccordionItem>
          </Accordion>
          <section className="grid gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-semibold">
                {profile.display_name || "User"}&rsquo;s latest activity
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {isActivityLogLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <Card
                      key={`activity-log-skeleton-${index}`}
                      className="bg-white/80 shadow-none dark:bg-neutral-900/60"
                    >
                      <CardHeader className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex w-full flex-col gap-2">
                          <Skeleton className="h-3 w-1/3 rounded-lg" />
                          <Skeleton className="h-3 w-4/5 rounded-lg" />
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                : activityLog.map((activity) => {
                    const iconMap = {
                      food_place: Utensils,
                      food_visit: Star,
                      food_visit_comment: MessageSquare,
                      activity: Footprints,
                      activity_visit: Footprints,
                      activity_visit_comment: MessageSquare,
                      tierlist_comment: MessageSquare,
                      check_in: MapPin,
                      journal_entry: Pencil,
                      tierlist: ListOrdered,
                    };
                    const Icon = iconMap[activity.entity_type] || Star;
                    const labelMap = {
                      food_visit_comment: "Comment",
                      activity_visit_comment: "Comment",
                      tierlist_comment: "Comment",
                    };
                    const label =
                      labelMap[activity.entity_type] ||
                      activity.entity_type
                        .replace("_", " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase());
                    const subtitleDate = activity.entity_subtitle
                      ? new Date(activity.entity_subtitle)
                      : null;
                    const subtitle =
                      subtitleDate && !Number.isNaN(subtitleDate.getTime())
                        ? formatCheckInDate(subtitleDate)
                        : activity.entity_subtitle;
                    return (
                      <Card
                        key={activity.id}
                        className="bg-white/80 shadow-none dark:bg-neutral-900/60"
                      >
                        <CardHeader className="flex items-center gap-3 pb-0">
                          <span className="rounded-full bg-neutral-100 p-2 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                              {label}
                            </p>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300">
                              {activity.summary}
                            </p>
                          </div>
                        </CardHeader>
                        <CardBody className="gap-3 pt-3">
                          {activity.entity_title ? (
                            <Card
                              isFooterBlurred
                              radius="lg"
                              className="border-none overflow-hidden"
                            >
                              <div
                                className="h-48 w-full"
                                style={{
                                  backgroundImage: activity.entity_image_url
                                    ? `url("${resolveHeaderUrl(
                                        activity.entity_image_url,
                                      )}")`
                                    : buildAccentLeakGradient(
                                        profile?.accent_color ||
                                          ACCENT_COLORS[0].value,
                                        isDarkMode,
                                      ),
                                  backgroundSize: activity.entity_image_url
                                    ? "cover"
                                    : "auto",
                                  backgroundPosition: activity.entity_image_url
                                    ? "center"
                                    : "left center",
                                }}
                              />
                              <CardFooter className="border-1 border-white/20 bg-white/70 py-2 absolute bottom-1 w-[calc(100%_-_8px)] rounded-large shadow-small ml-1 z-10 text-neutral-900 backdrop-blur dark:bg-neutral-900/70 dark:text-white">
                                <div className="text-left">
                                  <p className="text-[10px] uppercase font-semibold tracking-wide text-white/80">
                                    {label}
                                  </p>
                                  <p className="text-sm font-semibold">
                                    {activity.entity_title}
                                  </p>
                                  {subtitle ? (
                                    <p className="text-xs text-neutral-600 dark:text-white/70">
                                      {subtitle}
                                    </p>
                                  ) : null}
                                </div>
                              </CardFooter>
                            </Card>
                          ) : null}
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formatRelativeTime(activity.created_at)}
                          </p>
                        </CardBody>
                      </Card>
                    );
                  })}
              {!activityLog.length && !isActivityLogLoading ? (
                <div className="rounded-2xl bg-neutral-100/80 p-4 text-sm text-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-200">
                  No recent activity yet.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : (
        <p className="text-sm">Loading profile...</p>
      )}
    </section>
  );
}
