import { I18nProvider } from "@react-aria/i18n";
import {
  Avatar,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  DatePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
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
import {
  Loader2,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";

export default function JournalModals({
  selectedEntry,
  setSelectedEntry,
  modalMotionProps,
  typeMeta,
  journalPhotos,
  moodLabels,
  parseCheckInDate,
  formatRelativeTime,
  resolveAvatarUrl,
  resolveHeaderUrl,
  profile,
  openJournalEntryEdit,
  openJournalDeleteModal,
  journalDeleteTarget,
  setJournalDeleteTarget,
  handleDeleteJournalEntry,
  isJournalEntryOpen,
  setIsJournalEntryOpen,
  resetJournalEntryForm,
  journalEditingEntry,
  journalEntryMode,
  journalIconOptions,
  journalEntryIcon,
  setJournalEntryIcon,
  journalEntryTitle,
  setJournalEntryTitle,
  journalEntryVisibility,
  setJournalEntryVisibility,
  journalEntryDate,
  setJournalEntryDate,
  journalEntryMood,
  setJournalEntryMood,
  journalEntryBody,
  setJournalEntryBody,
  journalEntryLinkQuery,
  setJournalEntryLinkQuery,
  isJournalLinkSearching,
  journalLinkResults,
  journalEntryLinks,
  setJournalEntryLinks,
  journalEntryPhotos,
  setJournalEntryPhotos,
  readFileAsDataUrl,
  compressImageDataUrl,
  addToast,
  isJournalEntrySaving,
  setIsJournalEntrySaving,
  getLocalTimeZone,
  today,
  createJournalEntry,
  updateJournalEntry,
  setJournalPhotos,
  setJournalEntries,
}) {
  return (
    <>
      <Modal
  hideCloseButton
        isOpen={Boolean(selectedEntry)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEntry(null);
          }
        }}
        placement="center"
        size="lg"
        motionProps={modalMotionProps}
      >
        <ModalContent className="mx-4">
          {(onClose) => {
            if (!selectedEntry) {
              return null;
            }
            const meta = typeMeta[selectedEntry.type] || typeMeta.food;
            const EntryIcon = meta.icon;
            const linked = selectedEntry.linked || [];
            const entryPhotos = journalPhotos[selectedEntry.id] || [];
            const moodIndex = Math.max(
              0,
              Math.min(4, (selectedEntry.mood || 1) - 1),
            );
            const detailDate = parseCheckInDate(selectedEntry.date);
            const detailDateLabel = Number.isNaN(detailDate.getTime())
              ? "Date unavailable"
              : formatRelativeTime(detailDate);
            return (
              <>
                <ModalHeader className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
                    <EntryIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {selectedEntry.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>{detailDateLabel}</span>
                      {selectedEntry.is_public ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                          Shared
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <span className="text-base">
                        {["😔", "🙂", "😌", "😄", "✨"][moodIndex]}
                      </span>
                      <span className="text-xs">{moodLabels[moodIndex]}</span>
                      <div className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span
                            key={`${selectedEntry.id}-detail-mood-${index}`}
                            className={`h-1.5 w-6 rounded-full ${
                              index < (selectedEntry.mood || 0)
                                ? "bg-neutral-900 dark:bg-white"
                                : "bg-neutral-200 dark:bg-neutral-800"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {selectedEntry.is_public ? (
                      <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <Avatar
                          size="sm"
                          name={selectedEntry.author_name || "Shared"}
                          src={resolveAvatarUrl(
                            selectedEntry.author_avatar_url,
                          )}
                        />
                        <span>
                          {selectedEntry.author_name
                            ? `Shared by ${selectedEntry.author_name}`
                            : "Shared entry"}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </ModalHeader>
                <ModalBody className="max-h-[70vh] gap-4 overflow-y-auto">
                  <p className="text-sm text-neutral-700 whitespace-pre-line dark:text-neutral-300">
                    {selectedEntry.body || selectedEntry.summary}
                  </p>
                  <div className="grid gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Photos
                    </p>
                    {entryPhotos.length ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {entryPhotos.map((photo, index) => (
                          <div
                            key={`${selectedEntry.id}-photo-${index}`}
                            className="aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900"
                          >
                            <img
                              alt={`Journal ${selectedEntry.title} ${index + 1}`}
                              src={resolveHeaderUrl(photo)}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-neutral-200/70 bg-white/70 px-3 py-3 text-xs text-neutral-500 dark:border-neutral-800/70 dark:bg-neutral-900/60 dark:text-neutral-300">
                        No photos yet.
                      </div>
                    )}
                  </div>
                  {linked.length ? (
                    <div className="grid gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        Linked
                      </p>
                      <div className="grid gap-2">
                        {linked.map((item, itemIndex) => (
                          <div
                            key={`${selectedEntry.id}-${item.id || item.visit_id || itemIndex}-modal`}
                            className="rounded-2xl border border-neutral-200/70 bg-white/70 px-3 py-2 text-xs text-neutral-700 shadow-sm dark:border-neutral-800/70 dark:bg-neutral-900/60 dark:text-neutral-200"
                          >
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              {item.title || "Linked visit"}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {item.subtitle || "Details pending"}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {item.meta || "Tap to view"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </ModalBody>
                <ModalFooter>
                  {selectedEntry?.author_telegram_uid ===
                  profile?.telegram_uid ? (
                    <Dropdown placement="top-end">
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          variant="flat"
                          className="rounded-full"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Journal detail actions">
                        <DropdownItem
                          key="edit"
                          startContent={<Pencil className="h-4 w-4" />}
                          onPress={() => {
                            const entry = selectedEntry;
                            setSelectedEntry(null);
                            openJournalEntryEdit(entry);
                          }}
                        >
                          Edit entry
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          color="danger"
                          startContent={<Trash2 className="h-4 w-4" />}
                          onPress={() => openJournalDeleteModal(selectedEntry)}
                        >
                          Delete entry
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  ) : null}
                  <Button variant="light" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
      <Modal
  hideCloseButton
        isOpen={Boolean(journalDeleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setJournalDeleteTarget(null);
          }
        }}
        placement="center"
        size="sm"
        motionProps={modalMotionProps}
      >
        <ModalContent className="mx-4">
          {(onClose) => (
            <>
              <ModalHeader>Delete journal entry</ModalHeader>
              <ModalBody className="gap-3">
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  This will permanently remove{" "}
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {journalDeleteTarget?.title || "this entry"}
                  </span>
                  .
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  isDisabled={!journalDeleteTarget}
                  onPress={() => {
                    handleDeleteJournalEntry();
                    onClose();
                  }}
                >
                  Delete entry
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
  hideCloseButton
        isOpen={isJournalEntryOpen}
        onOpenChange={(open) => {
          setIsJournalEntryOpen(open);
          if (!open) {
            resetJournalEntryForm();
          }
        }}
        placement="center"
        size="lg"
        motionProps={modalMotionProps}
      >
        <ModalContent className="mx-4 my-6 max-h-[calc(100vh-3rem)] overflow-hidden">
          {(onClose) => (
            <>
              <ModalHeader>
                {journalEditingEntry ? "Edit journal entry" : "Add journal entry"}
              </ModalHeader>
              <ModalBody className="gap-4 overflow-y-auto">
                <div className="grid gap-2">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-3">
                    {journalEntryMode === "full" ? (
                      <div className="grid gap-1">
                        <p className="text-sm font-semibold">Icon</p>
                        <Dropdown placement="bottom-start">
                          <DropdownTrigger>
                            <Button
                              variant="flat"
                              isIconOnly
                              className="h-11 w-11 rounded-full"
                            >
                              {(() => {
                                const current =
                                  journalIconOptions.find(
                                    (option) => option.value === journalEntryIcon,
                                  ) || journalIconOptions[0];
                                const Icon = current.icon;
                                return <Icon className="h-5 w-5" />;
                              })()}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Journal icon options"
                            onAction={(key) => setJournalEntryIcon(String(key))}
                            classNames={{
                              list: "grid grid-cols-3 gap-2 p-2",
                            }}
                          >
                            {journalIconOptions.map((option) => (
                              <DropdownItem
                                key={option.value}
                                aria-label={option.label}
                                className="h-10 w-10 rounded-full p-0"
                                classNames={{
                                  title:
                                    "w-full h-full flex items-center justify-center",
                                }}
                              >
                                <option.icon className="h-4 w-4" />
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    ) : null}
                    <div className="grid gap-1">
                      <p className="text-sm font-semibold">Title</p>
                      <Input
                        placeholder="Give it a short title"
                        value={journalEntryTitle}
                        onValueChange={setJournalEntryTitle}
                      />
                    </div>
                  </div>
                </div>
                <Switch
                  isSelected={journalEntryVisibility === "public"}
                  onValueChange={(value) =>
                    setJournalEntryVisibility(value ? "public" : "private")
                  }
                >
                  {journalEntryVisibility === "public"
                    ? "Public entry"
                    : "Private entry"}
                </Switch>
                {journalEntryMode === "full" ? (
                  <>
                    <div className="grid gap-2">
                      <I18nProvider locale="en-GB">
                        <DatePicker
                          label="Date"
                          className="w-full"
                          value={journalEntryDate}
                          onChange={setJournalEntryDate}
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
                            setJournalEntryDate(today(getLocalTimeZone()))
                          }
                        >
                          Today
                        </Button>
                      </ButtonGroup>
                    </div>
                    <div className="grid gap-2">
                      <p className="text-sm font-semibold">Mood</p>
                      <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <span className="text-base">
                          {["😔", "🙂", "😌", "😄", "✨"][
                            Math.max(0, Math.min(4, journalEntryMood - 1))
                          ]}
                        </span>
                        <span>{moodLabels[journalEntryMood - 1]}</span>
                      </div>
                      <Slider
                        minValue={1}
                        maxValue={5}
                        step={1}
                        value={journalEntryMood}
                        onChange={setJournalEntryMood}
                        showSteps
                        showTooltip
                        getValue={(value) =>
                          moodLabels[(Number(value) || 3) - 1] || "Balanced"
                        }
                      />
                    </div>
                  </>
                ) : null}
                <Textarea
                  label="Post body"
                  placeholder="Share what happened..."
                  value={journalEntryBody}
                  onValueChange={setJournalEntryBody}
                />
                {journalEntryMode === "full" ? (
                  <>
                    <div className="grid gap-2">
                      <p className="text-sm font-semibold">
                        Link visits ({journalEntryLinks.length}/5)
                      </p>
                      <Input
                        placeholder="Search food or activity visits"
                        value={journalEntryLinkQuery}
                        onValueChange={setJournalEntryLinkQuery}
                      />
                      {journalEntryLinkQuery ? (
                        <div className="grid gap-2">
                          {isJournalLinkSearching ? (
                            <Skeleton className="h-10 w-full rounded-lg" />
                          ) : (
                            journalLinkResults.slice(0, 6).map((item) => (
                              <Card
                                key={item.id}
                                className="border border-neutral-200/70 bg-white/80 dark:border-neutral-800/70 dark:bg-neutral-900/60"
                                shadow="sm"
                                isPressable
                                onPress={() => {
                                  if (journalEntryLinks.length >= 5) {
                                    return;
                                  }
                                  if (
                                    journalEntryLinks.some(
                                      (link) => link.id === item.id,
                                    )
                                  ) {
                                    return;
                                  }
                                  setJournalEntryLinks((prev) => [
                                    ...prev,
                                    item,
                                  ]);
                                  setJournalEntryLinkQuery("");
                                }}
                              >
                                <CardBody className="gap-1">
                                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                    {item.title}
                                  </p>
                                  {item.type === "activity" ? (
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                      {item.activityName}
                                    </p>
                                  ) : null}
                                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    <span>{item.dateLabel}</span>
                                    <span className="flex items-center gap-1">
                                      {item.type === "food" ? (
                                        <Star className="h-3 w-3" />
                                      ) : item.ratingValue === "up" ? (
                                        <ThumbsUp className="h-3 w-3" />
                                      ) : item.ratingValue === "down" ? (
                                        <ThumbsDown className="h-3 w-3" />
                                      ) : (
                                        <Minus className="h-3 w-3" />
                                      )}
                                      <span>
                                        {item.type === "food"
                                          ? item.ratingValue || "No rating"
                                          : item.ratingValue === "up"
                                            ? "Thumbs up"
                                            : item.ratingValue === "down"
                                              ? "Thumbs down"
                                              : "N/A"}
                                      </span>
                                    </span>
                                  </div>
                                </CardBody>
                              </Card>
                            ))
                          )}
                        </div>
                      ) : null}
                      {journalEntryLinks.length ? (
                        <div className="grid gap-2">
                          {journalEntryLinks.map((item) => (
                            <div
                              key={`linked-${item.id}`}
                              className="flex items-center justify-between rounded-2xl border border-neutral-200/70 bg-white/80 px-3 py-2 text-xs text-neutral-600 dark:border-neutral-800/70 dark:bg-neutral-900/60 dark:text-neutral-300"
                            >
                              <div>
                                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                  {item.title}
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {item.subtitle}
                                </p>
                              </div>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() =>
                                  setJournalEntryLinks((prev) =>
                                    prev.filter((link) => link.id !== item.id),
                                  )
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="grid gap-2">
                      <p className="text-sm font-semibold">
                        Photos ({journalEntryPhotos.length}/3)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {journalEntryPhotos.map((photo, index) => (
                          <div
                            key={`journal-photo-${photo.id || index}`}
                            className="relative h-24 w-24 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900"
                          >
                            {photo.status === "loading" ? (
                              <div className="flex h-full w-full items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-neutral-400 dark:text-neutral-500" />
                              </div>
                            ) : (
                              <>
                                <img
                                  alt={`Journal upload ${index + 1}`}
                                  src={photo.src}
                                  className="h-full w-full object-cover"
                                />
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  className="absolute right-1 top-1 bg-white/80 text-neutral-900 dark:bg-neutral-900/70 dark:text-neutral-100"
                                  onPress={() =>
                                    setJournalEntryPhotos((prev) =>
                                      prev.filter((item) => item.id !== photo.id),
                                    )
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        ))}
                        {journalEntryPhotos.length < 3 ? (
                          <Button
                            variant="ghost"
                            className="h-24 w-24 rounded-2xl border border-dashed border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
                            onPress={() =>
                              document.getElementById("journal-entry-photo")?.click()
                            }
                          >
                            <span className="flex flex-col items-center gap-1 text-xs">
                              <Plus className="h-4 w-4" />
                              Add photo
                            </span>
                          </Button>
                        ) : null}
                        <input
                          id="journal-entry-photo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                              return;
                            }
                            if (journalEntryPhotos.length >= 3) {
                              event.target.value = "";
                              return;
                            }
                            const photoId = `${Date.now()}-${Math.random()}`;
                            setJournalEntryPhotos((prev) => [
                              ...prev,
                              { id: photoId, src: "", status: "loading" },
                            ]);
                            try {
                              const dataUrl = await readFileAsDataUrl(file);
                              const compressed =
                                await compressImageDataUrl(dataUrl);
                              setJournalEntryPhotos((prev) =>
                                prev.map((item) =>
                                  item.id === photoId
                                    ? {
                                        ...item,
                                        src: compressed,
                                        status: "ready",
                                      }
                                    : item,
                                ),
                              );
                            } catch (error) {
                              setJournalEntryPhotos((prev) =>
                                prev.filter((item) => item.id !== photoId),
                              );
                              addToast({
                                title: "Unable to add photo",
                                description: "Please try again.",
                                color: "warning",
                                timeout: 3000,
                              });
                            } finally {
                              event.target.value = "";
                            }
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : null}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isJournalEntrySaving}
                  isDisabled={isJournalEntrySaving}
                  onPress={async () => {
                    if (!journalEntryTitle.trim()) {
                      addToast({
                        title: "Add a title",
                        color: "warning",
                        timeout: 2000,
                      });
                      return;
                    }
                    setIsJournalEntrySaving(true);
                    try {
                      const entryDateValue =
                        journalEntryDate.toDate(getLocalTimeZone());
                      const now = new Date();
                      entryDateValue.setHours(
                        now.getHours(),
                        now.getMinutes(),
                        now.getSeconds(),
                        now.getMilliseconds(),
                      );
                      const linksPayload = journalEntryLinks
                        .map((link) => {
                          const visitId = Number(String(link.id).split("-").pop());
                          if (!Number.isFinite(visitId)) {
                            return null;
                          }
                          const subtitle =
                            link.subtitle ||
                            (link.type === "activity"
                              ? link.activityName || "Activity visit"
                              : "Food visit");
                          const ratingLabel =
                            link.type === "food"
                              ? link.ratingValue
                                ? `Rating ${link.ratingValue}`
                                : "No rating"
                              : link.ratingValue === "up"
                                ? "Thumbs up"
                                : link.ratingValue === "down"
                                  ? "Thumbs down"
                                  : "N/A";
                          return {
                            type: link.type || "unknown",
                            visit_id: visitId,
                            title: link.title,
                            subtitle,
                            meta:
                              link.meta || `${link.dateLabel} • ${ratingLabel}`,
                          };
                        })
                        .filter(Boolean)
                        .filter((link) => Number.isFinite(link.visit_id));
                      const payload = {
                        title: journalEntryTitle.trim(),
                        body: journalEntryBody.trim() || null,
                        entry_date: entryDateValue.toISOString(),
                        icon: journalEntryIcon,
                        mood:
                          journalEntryMode === "full" ? journalEntryMood : null,
                        is_public: journalEntryVisibility === "public",
                        links: linksPayload,
                        photos: journalEntryPhotos
                          .filter((photo) => photo.status === "ready")
                          .map((photo) => photo.src),
                      };
                      const response = journalEditingEntry
                        ? await updateJournalEntry(
                            journalEditingEntry.id,
                            payload,
                          )
                        : await createJournalEntry(payload);
                      const summary =
                        payload.body ||
                        journalEditingEntry?.summary ||
                        "New journal entry";
                      const nextEntry = {
                        id: response.id,
                        date: response.entry_date,
                        type: response.icon || "note",
                        icon: response.icon || "note",
                        title: response.title,
                        location: journalEditingEntry?.location || "",
                        summary,
                        body: payload.body,
                        accent: journalEditingEntry?.accent || "#F97316",
                        mood: response.mood || 3,
                        linked: journalEntryLinks,
                        is_public: response.is_public,
                        photos: response.photos || [],
                        author_name: response.author_name,
                        author_avatar_url: response.author_avatar_url,
                        author_telegram_uid: response.author_telegram_uid,
                      };
                      setJournalPhotos((prev) => ({
                        ...prev,
                        [response.id]: response.photos || [],
                      }));
                      setJournalEntries((prev) => {
                        if (journalEditingEntry) {
                          return prev.map((entry) =>
                            entry.id === journalEditingEntry.id
                              ? { ...entry, ...nextEntry }
                              : entry,
                          );
                        }
                        return [nextEntry, ...prev];
                      });
                      addToast({
                        title: journalEditingEntry
                          ? "Entry updated"
                          : "Entry saved",
                        color: "success",
                        timeout: 2000,
                      });
                      onClose();
                    } catch (error) {
                      addToast({
                        title: "Unable to save entry",
                        description: error?.message || "Please try again.",
                        color: "danger",
                        timeout: 3000,
                      });
                    } finally {
                      setIsJournalEntrySaving(false);
                    }
                  }}
                >
                  {journalEditingEntry ? "Update entry" : "Save entry"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
