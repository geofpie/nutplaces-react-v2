import {
  Avatar,
  Button,
  Card,
  CardBody,
  DatePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image as HeroImage,
  Input,
  InputOtp,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Cake, Pencil, Trash2, Upload } from "lucide-react";
 
export default function ProfileModals({
  // Profile edit modal
  isEditOpen,
  setIsEditOpen,
  modalMotionProps,
  editHeaderPreview,
  editAccent,
  isDarkMode,
  editName,
  profile,
  editBirthday,
  editAvatarPreview,
  headerInputRef,
  avatarInputRef,
  ACCENT_COLORS,
  formatBirthday,
  setEditAccent,
  setEditName,
  parseDate,
  setEditBirthday,
  handleAvatarChange,
  handleHeaderChange,
  handleProfileSave,
  isEditSaving,
  buildAccentLeakGradient,
  // Profile delete confirmation modal
  setDeleteTarget,
  // PIN change modal
  isPinModalOpen,
  setIsPinModalOpen,
  pinStep,
  setPinStep,
  currentPin,
  setCurrentPin,
  currentPinError,
  setCurrentPinError,
  currentPinShake,
  setCurrentPinShake,
  newPin,
  setNewPin,
  newPinError,
  setNewPinError,
  newPinShake,
  setNewPinShake,
  confirmPin,
  setConfirmPin,
  confirmPinError,
  setConfirmPinError,
  confirmPinShake,
  setConfirmPinShake,
  PIN_LENGTH,
  handleVerifyCurrentPin,
  handleChangePin,
  isPinVerifying,
  isPinSaving,
}) {
  return (
    <>
      <Modal
  hideCloseButton
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        placement="center"
        size="sm"
        motionProps={modalMotionProps}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit profile
              </ModalHeader>
              <ModalBody>
                <Card className="pt-0 pb-4">
                  <CardBody className="overflow-visible px-4 pb-4 pt-0">
                    <div className="relative -mx-4 overflow-visible rounded-t-3xl">
                      {editHeaderPreview ? (
                        <HeroImage
                          alt="Header preview"
                          className="h-40 w-full rounded-t-3xl object-cover rounded-b-none"
                          src={editHeaderPreview}
                          width={600}
                        />
                      ) : (
                        <div
                          className="h-40 w-full rounded-t-3xl rounded-b-none"
                          style={{
                            backgroundImage: buildAccentLeakGradient(
                              editAccent,
                              isDarkMode,
                            ),
                          }}
                        />
                      )}
                      <div className="absolute right-4 top-4 z-10">
                        <Dropdown placement="bottom-end">
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="solid">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Header actions">
                            <DropdownItem
                              key="upload-header"
                              startContent={<Upload className="h-4 w-4" />}
                              onPress={() => headerInputRef.current?.click()}
                            >
                              Upload header
                            </DropdownItem>
                            <DropdownItem
                              key="delete-header"
                              color="danger"
                              startContent={<Trash2 className="h-4 w-4" />}
                              isDisabled={!editHeaderPreview}
                              onPress={() => setDeleteTarget("header")}
                            >
                              Delete header
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                      <div className="absolute -bottom-10 left-6 z-10">
                        <div className="flex items-center gap-2">
                          <Avatar
                            isBordered
                            name={editName || profile?.display_name || "User"}
                            size="lg"
                            className="h-[72px] w-[72px]"
                            src={editAvatarPreview || undefined}
                          />
                          <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                className="mt-6"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Avatar actions">
                              <DropdownItem
                                key="upload-avatar"
                                startContent={<Upload className="h-4 w-4" />}
                                onPress={() => avatarInputRef.current?.click()}
                              >
                                Upload photo
                              </DropdownItem>
                              <DropdownItem
                                key="delete-avatar"
                                color="danger"
                                startContent={<Trash2 className="h-4 w-4" />}
                                isDisabled={!editAvatarPreview}
                                onPress={() => setDeleteTarget("avatar")}
                              >
                                Delete photo
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 px-4">
                      <div className="flex flex-wrap items-start justify-between gap-4 pt-6">
                        <div>
                          <h4 className="text-lg font-semibold">
                            {editName || profile?.display_name || "User"}
                          </h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {profile?.telegram_uid || "UID"}
                          </p>
                        </div>
                        <Button size="sm" variant="flat" isDisabled>
                          Edit profile
                        </Button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-6 text-xs text-neutral-600 dark:text-neutral-400">
                        <div>
                          <span className="font-semibold">0</span> food spots
                        </div>
                        <div>
                          <span className="font-semibold">0</span> activities
                        </div>
                        <div className="flex items-center gap-2">
                          <Cake className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                          <span className="font-semibold">
                            {formatBirthday(editBirthday)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                <Input
                  label="Name"
                  placeholder="Enter your name"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold">Accent color</p>
                  <div className="flex flex-wrap gap-2">
                    {ACCENT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        aria-label={color.name}
                        title={color.name}
                        className={`h-8 w-8 rounded-full transition-transform ${
                          editAccent === color.value
                            ? "ring-2 ring-neutral-900/70 ring-offset-2 ring-offset-white/80 dark:ring-white/80 dark:ring-offset-neutral-900/80"
                            : "ring-1 ring-neutral-900/10 dark:ring-white/10"
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setEditAccent(color.value)}
                      />
                    ))}
                  </div>
                </div>
                <DatePicker
                  label="Birth date"
                  className="w-full"
                  value={editBirthday ? parseDate(editBirthday) : null}
                  onChange={(value) =>
                    setEditBirthday(value ? value.toString() : "")
                  }
                  locale="en-GB"
                  showMonthAndYearPickers
                  formatOptions={{
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }}
                />
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <input
                  ref={headerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHeaderChange}
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Images are compressed client-side to 500px width.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleProfileSave}
                  isLoading={isEditSaving}
                >
                  Save changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
  hideCloseButton
        isOpen={isPinModalOpen}
        onOpenChange={(open) => {
          setIsPinModalOpen(open);
          if (!open) {
            setPinStep(0);
            setCurrentPinError(false);
            setNewPinError(false);
            setConfirmPinError(false);
          }
        }}
        placement="center"
        size="sm"
        motionProps={modalMotionProps}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Change PIN</ModalHeader>
              <ModalBody>
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${pinStep * 100}%)` }}
                  >
                    <div className="w-full shrink-0 pr-2">
                      <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        Confirm current PIN
                      </p>
                      <div
                        className={currentPinShake ? "shake" : ""}
                        onAnimationEnd={() => setCurrentPinShake(false)}
                      >
                        <InputOtp
                          className="w-full"
                          length={PIN_LENGTH}
                          radius="md"
                          size="sm"
                          type="password"
                          value={currentPin}
                          onValueChange={(value) => {
                            setCurrentPin(value);
                            setCurrentPinError(false);
                            if (value.length === PIN_LENGTH) {
                              handleVerifyCurrentPin();
                            }
                          }}
                          label="Current PIN"
                          isInvalid={currentPinError}
                          errorMessage="Invalid PIN"
                        />
                      </div>
                    </div>
                    <div className="w-full shrink-0 pl-2">
                      <div className="flex flex-col gap-3">
                        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                          Enter new PIN
                        </p>
                        <div
                          className={newPinShake ? "shake" : ""}
                          onAnimationEnd={() => setNewPinShake(false)}
                        >
                          <InputOtp
                            className="w-full"
                            length={PIN_LENGTH}
                            radius="md"
                            size="sm"
                            type="password"
                            value={newPin}
                            onValueChange={(value) => {
                              setNewPin(value);
                              setNewPinError(false);
                            }}
                            label="New PIN"
                            isInvalid={newPinError}
                            errorMessage="Enter 6 digits"
                          />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                          Confirm new PIN
                        </p>
                        <div
                          className={confirmPinShake ? "shake" : ""}
                          onAnimationEnd={() => setConfirmPinShake(false)}
                        >
                          <InputOtp
                            className="w-full"
                            length={PIN_LENGTH}
                            radius="md"
                            size="sm"
                            type="password"
                            value={confirmPin}
                            onValueChange={(value) => {
                              setConfirmPin(value);
                              setConfirmPinError(false);
                            }}
                            label="Confirm PIN"
                            isInvalid={confirmPinError}
                            errorMessage="PINs do not match"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                {pinStep === 0 ? (
                  <Button
                    color="primary"
                    onPress={handleVerifyCurrentPin}
                    isDisabled={
                      currentPin.length !== PIN_LENGTH || isPinVerifying
                    }
                    isLoading={isPinVerifying}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    onPress={handleChangePin}
                    isLoading={isPinSaving}
                  >
                    Update PIN
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
