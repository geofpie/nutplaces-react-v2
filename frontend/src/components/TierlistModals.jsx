import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
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
  Textarea,
} from "@heroui/react";
import { Loader2, MoreHorizontal, Pencil, Plus, Trash2, Upload } from "lucide-react";
import ImageCropperModal from "./ImageCropperModal.jsx";

export default function TierlistModals({
  modalMotionProps,
  // Tierlist header cropper
  isTierlistHeaderCropOpen,
  setIsTierlistHeaderCropOpen,
  tierlistHeaderCropImageSrc,
  tierlistHeaderCrop,
  setTierlistHeaderCrop,
  tierlistHeaderZoom,
  setTierlistHeaderZoom,
  setTierlistHeaderCroppedAreaPixels,
  handleTierlistHeaderCropConfirm,
  isTierlistHeaderCropSaving,
  // Tierlist add/edit
  isTierlistOpen,
  setIsTierlistOpen,
  setIsTierlistSaving,
  tierlistEditing,
  tierlistHeaderPreview,
  accentColor,
  isDarkMode,
  buildAccentLeakGradient,
  tierlistTitle,
  setTierlistTitle,
  tierlistDescription,
  setTierlistDescription,
  tierlistHeaderInputRef,
  handleTierlistHeaderChange,
  setTierlistHeaderPreview,
  setTierlistHeaderData,
  setTierlistHeaderChanged,
  TIER_COLOR_PALETTE,
  tierlistTiers,
  handleTierlistTierAdd,
  handleTierlistTierColorChange,
  handleTierlistTierLabelChange,
  handleTierlistTierRemove,
  handleTierItemChange,
  handleTierItemCommit,
  handleTierItemAdd,
  handleTierlistSave,
  isTierlistSaving,
  // Tierlist detail modal
  selectedTierlist,
  setSelectedTierlist,
  DEFAULT_TIERLIST_TIERS,
  resolveHeaderUrl,
  openTierlistEdit,
  setTierlistDeleteTarget,
  formatRelativeTime,
  profile,
  resolveAvatarUrl,
  tierlistComments,
  isTierlistCommentsLoading,
  handleTierlistCommentDelete,
  tierlistCommentInputKey,
  tierlistCommentDraftRef,
  handleTierlistCommentAdd,
  isTierlistCommentSaving,
  // Tierlist delete modal
  tierlistDeleteTarget,
  handleTierlistDelete,
}) {
  return (
    <>
      <ImageCropperModal
        isOpen={isTierlistHeaderCropOpen}
        onOpenChange={setIsTierlistHeaderCropOpen}
        motionProps={modalMotionProps}
        title="Crop tierlist header"
        imageSrc={tierlistHeaderCropImageSrc}
        crop={tierlistHeaderCrop}
        setCrop={setTierlistHeaderCrop}
        zoom={tierlistHeaderZoom}
        setZoom={setTierlistHeaderZoom}
        aspect={3 / 2}
        cropShape="rect"
        onCropComplete={(_, pixels) => setTierlistHeaderCroppedAreaPixels(pixels)}
        onConfirm={handleTierlistHeaderCropConfirm}
        confirmLabel="Save crop"
        isSaving={isTierlistHeaderCropSaving}
        containerClassName="relative h-72 w-full overflow-hidden rounded-2xl bg-neutral-900"
        showHelperText={false}
      />
      <Modal
  hideCloseButton
        isOpen={isTierlistOpen}
        onOpenChange={(open) => {
          setIsTierlistOpen(open);
          if (!open) {
            setIsTierlistSaving(false);
          }
        }}
        placement="center"
        size="lg"
        motionProps={modalMotionProps}
      >
        <ModalContent className="mx-4 my-6 max-h-[calc(100vh-3rem)] overflow-hidden">
          {(onClose) => (
            <>
              <ModalBody className="gap-4 overflow-y-auto p-0">
                <div className="relative">
                  <div className="absolute left-6 top-4 z-20 text-lg font-semibold text-white drop-shadow">
                    {tierlistEditing ? "Edit tierlist" : "Add tierlist"}
                  </div>
                  <div className="relative overflow-hidden rounded-large rounded-b-none">
                    {tierlistHeaderPreview ? (
                      <HeroImage
                        alt="Tierlist header preview"
                        className="w-full object-cover aspect-[3/2] rounded-b-none"
                        src={tierlistHeaderPreview}
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
                    {isTierlistHeaderCropSaving ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    ) : null}
                    <div className="absolute bottom-4 left-4 z-20">
                      <div className="rounded-large border-1 border-white/20 bg-white/75 px-3 py-2 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/70 dark:text-white">
                        <p className="text-sm font-semibold">
                          {tierlistTitle || "Tierlist title"}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-white/70">
                          {tierlistDescription || "Describe your ranking theme"}
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
                        <DropdownMenu aria-label="Tierlist header actions">
                          <DropdownItem
                            key="upload-tierlist-header"
                            startContent={<Upload className="h-4 w-4" />}
                            onPress={() => tierlistHeaderInputRef.current?.click()}
                          >
                            Upload header
                          </DropdownItem>
                          <DropdownItem
                            key="delete-tierlist-header"
                            color="danger"
                            startContent={<Trash2 className="h-4 w-4" />}
                            isDisabled={!tierlistHeaderPreview}
                            onPress={() => {
                              setTierlistHeaderPreview("");
                              setTierlistHeaderData("");
                              setTierlistHeaderChanged(true);
                            }}
                          >
                            Delete header
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    <input
                      ref={tierlistHeaderInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleTierlistHeaderChange}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-4 px-6 pb-6">
                  <Input
                    label="Tierlist title"
                    placeholder="Give your tierlist a name"
                    value={tierlistTitle}
                    onValueChange={setTierlistTitle}
                  />
                  <Textarea
                    label="Description"
                    placeholder="Add a short description"
                    value={tierlistDescription}
                    onValueChange={setTierlistDescription}
                  />
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Tiers</p>
                      <Button size="sm" variant="flat" onPress={handleTierlistTierAdd}>
                        Add tier
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      {tierlistTiers.map((tier) => (
                        <div key={tier.id} className="grid gap-2">
                          <div className="flex items-center gap-2 rounded-2xl bg-white/80 p-3 text-sm shadow-sm dark:bg-neutral-900/60">
                            <Dropdown placement="bottom-start">
                              <DropdownTrigger>
                                <Button
                                  isIconOnly
                                  variant="flat"
                                  className="h-10 w-10"
                                  style={{ backgroundColor: tier.color }}
                                  aria-label="Pick color"
                                />
                              </DropdownTrigger>
                              <DropdownMenu
                                aria-label="Tier colors"
                                classNames={{ list: "grid grid-cols-4 gap-2 p-2" }}
                              >
                                {TIER_COLOR_PALETTE.map((color) => (
                                  <DropdownItem
                                    key={color}
                                    textValue={color}
                                    className="p-0"
                                    onPress={() =>
                                      handleTierlistTierColorChange(tier.id, color)
                                    }
                                  >
                                    <div
                                      className="h-8 w-8 rounded-full"
                                      style={{ backgroundColor: color }}
                                    />
                                  </DropdownItem>
                                ))}
                              </DropdownMenu>
                            </Dropdown>
                            <Input
                              size="sm"
                              className="flex-1"
                              value={tier.label}
                              onValueChange={(value) =>
                                handleTierlistTierLabelChange(tier.id, value)
                              }
                              placeholder="Tier label"
                            />
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleTierlistTierRemove(tier.id)}
                              isDisabled={tierlistTiers.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 px-1 pb-2">
                            {tier.items.map((item) => (
                              <Input
                                key={item.id}
                                size="sm"
                                className="w-auto"
                                classNames={{
                                  base: `w-auto ${item.isNew ? "tier-item-enter" : ""}`,
                                  mainWrapper: "w-auto",
                                  inputWrapper: "w-auto px-2 py-1",
                                  input: "w-auto p-0",
                                }}
                                style={{
                                  width: `${Math.max(8, (item.value || "").length)}ch`,
                                }}
                                value={item.value}
                                placeholder="Add item"
                                onValueChange={(value) =>
                                  handleTierItemChange(tier.id, item.id, value)
                                }
                                onBlur={() => handleTierItemCommit(tier.id, item.id)}
                              />
                            ))}
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              className="h-7 w-7 rounded-full"
                              onPress={() => handleTierItemAdd(tier.id)}
                              aria-label="Add tier item"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleTierlistSave}
                  isLoading={isTierlistSaving}
                  isDisabled={isTierlistSaving}
                >
                  Save tierlist
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
  hideCloseButton
        isOpen={Boolean(selectedTierlist)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTierlist(null);
          }
        }}
        placement="center"
        size="lg"
        motionProps={modalMotionProps}
      >
        <ModalContent className="mx-4 my-6 max-h-[calc(100vh-3rem)] overflow-hidden">
          {(onClose) => {
            const tiers = (
              selectedTierlist?.tiers ||
              DEFAULT_TIERLIST_TIERS.map((tier) => ({
                ...tier,
                items: [],
              }))
            ).map((tier, index) => ({
              id: tier.id || tier.label || `tier-${index}`,
              ...tier,
            }));
            return (
              <>
                <ModalBody className="gap-4 overflow-y-auto p-0">
                  <div className="relative">
                    <div className="absolute right-4 top-4 z-20">
                      <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="solid">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Tierlist actions">
                          <DropdownItem
                            key="edit-tierlist"
                            startContent={<Pencil className="h-4 w-4" />}
                            onPress={() => {
                              openTierlistEdit(selectedTierlist);
                            }}
                          >
                            Edit tierlist
                          </DropdownItem>
                          <DropdownItem
                            key="delete-tierlist"
                            color="danger"
                            startContent={<Trash2 className="h-4 w-4" />}
                            onPress={() => setTierlistDeleteTarget(selectedTierlist)}
                          >
                            Delete tierlist
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    <div className="relative overflow-hidden rounded-large rounded-b-none">
                      {selectedTierlist?.header_url ? (
                        <HeroImage
                          alt={selectedTierlist?.title || "Tierlist header"}
                          className="w-full object-cover aspect-[3/2] rounded-b-none"
                          src={resolveHeaderUrl(selectedTierlist.header_url)}
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
                      <div className="absolute bottom-4 left-4 z-20">
                        <div className="rounded-large border-1 border-white/20 bg-white/75 px-3 py-2 text-neutral-900 shadow-small backdrop-blur dark:border-white/10 dark:bg-neutral-900/70 dark:text-white">
                          <p className="text-sm font-semibold">
                            {selectedTierlist?.title || "Tierlist"}
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-white/70">
                            {selectedTierlist?.description || "Ranked highlights"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 px-6 pb-6">
                    <div className="grid gap-1 text-xs text-neutral-600 dark:text-neutral-300">
                      <p>
                        Created{" "}
                        {selectedTierlist?.created_at
                          ? formatRelativeTime(selectedTierlist.created_at)
                          : "recently"}
                      </p>
                      <p>
                        Created by{" "}
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {selectedTierlist?.created_by_name || "Unknown"}
                        </span>{" "}
                        • Last edited by{" "}
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {selectedTierlist?.updated_by_name || "Unknown"}
                        </span>
                      </p>
                    </div>
                    {selectedTierlist?.description ? (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        {selectedTierlist.description}
                      </p>
                    ) : null}
                    <div className="grid gap-3">
                      {tiers.map((tier) => (
                        <div
                          key={tier.id}
                          className="rounded-2xl bg-white/80 p-3 shadow-sm dark:bg-neutral-900/60"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-flex min-w-24 w-24 max-w-24 items-center justify-center rounded-xl px-3 py-2 text-center text-sm font-semibold leading-tight text-white whitespace-normal break-words"
                              style={{ backgroundColor: tier.color }}
                            >
                              {tier.label}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {(tier.items || []).length ? (
                                tier.items.map((item, index) => (
                                  <span
                                    key={`${tier.id}-${index}`}
                                    className="rounded-full bg-neutral-900/10 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-white/10 dark:text-white/80"
                                  >
                                    {item}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                  No items yet
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-3">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        Comments
                      </p>
                      <div className="grid gap-2">
                        {isTierlistCommentsLoading ? (
                          <div className="flex w-full max-w-[300px] items-center gap-3">
                            <Skeleton className="flex h-12 w-12 rounded-full" />
                            <div className="flex w-full flex-col gap-2">
                              <Skeleton className="h-3 w-3/5 rounded-lg" />
                              <Skeleton className="h-3 w-4/5 rounded-lg" />
                            </div>
                          </div>
                        ) : (tierlistComments[selectedTierlist.id] || []).length ? (
                          (tierlistComments[selectedTierlist.id] || []).map((comment) => (
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
                                profile?.telegram_uid === comment.user_telegram_uid ? (
                                  <Dropdown placement="bottom-end">
                                    <DropdownTrigger>
                                      <Button isIconOnly size="sm" variant="light">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Comment actions">
                                      <DropdownItem
                                        key="delete"
                                        color="danger"
                                        startContent={<Trash2 className="h-4 w-4" />}
                                        onPress={() =>
                                          handleTierlistCommentDelete(
                                            selectedTierlist.id,
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
                          placeholder="Share a thought about this tierlist"
                          key={`${selectedTierlist.id}-${tierlistCommentInputKey}`}
                          onValueChange={(value) => {
                            tierlistCommentDraftRef.current[selectedTierlist.id] = value;
                          }}
                        />
                        <Button
                          color="primary"
                          onPress={() => handleTierlistCommentAdd(selectedTierlist.id)}
                          isLoading={isTierlistCommentSaving}
                          isDisabled={isTierlistCommentSaving}
                        >
                          Post comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
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
        isOpen={Boolean(tierlistDeleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setTierlistDeleteTarget(null);
          }
        }}
        placement="center"
        size="sm"
        motionProps={modalMotionProps}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete tierlist?</ModalHeader>
              <ModalBody>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  This will permanently remove{" "}
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {tierlistDeleteTarget?.title || "this tierlist"}
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
                  onPress={handleTierlistDelete}
                  isLoading={isTierlistSaving}
                  isDisabled={isTierlistSaving}
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
