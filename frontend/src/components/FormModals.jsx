import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

export default function FormModals({
  // Duplicate modal
  isDuplicateModalOpen,
  setIsDuplicateModalOpen,
  duplicateModalTitle,
  duplicateModalMessage,
  modalMotionProps,
  // Profile delete confirmation modal
  deleteTarget,
  setDeleteTarget,
  setEditHeaderPreview,
  setEditHeaderData,
  setEditHeaderChanged,
  setEditAvatarPreview,
  setEditAvatarData,
  setEditAvatarChanged,
  // Food delete modals
  foodVisitDeleteTarget,
  setFoodVisitDeleteTarget,
  confirmDeleteFoodVisit,
  isDeletingFoodVisit,
  foodPlaceDeleteTarget,
  setFoodPlaceDeleteTarget,
  foodPlaceDeleteConfirmName,
  setFoodPlaceDeleteConfirmName,
  confirmDeleteFoodPlace,
  isDeletingFoodPlace,
  // Activity delete modals
  activityVisitDeleteTarget,
  setActivityVisitDeleteTarget,
  confirmDeleteActivityVisit,
  isDeletingActivityVisit,
  activityDeleteTarget,
  setActivityDeleteTarget,
  activityDeleteConfirmName,
  setActivityDeleteConfirmName,
  activityDeleteHasVisits,
  confirmDeleteActivity,
}) {
  return (
    <>
      <Modal
  hideCloseButton
        isOpen={isDuplicateModalOpen}
        onOpenChange={setIsDuplicateModalOpen}
        placement="center"
        size="sm"
        motionProps={modalMotionProps}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{duplicateModalTitle || "Already exists"}</ModalHeader>
              <ModalBody>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {duplicateModalMessage ||
                    "This name already exists. Please choose another."}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
  hideCloseButton
        isOpen={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        placement="center"
        size="sm"
        motionProps={modalMotionProps}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {deleteTarget === "header"
                  ? "Remove header photo?"
                  : "Remove profile photo?"}
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {deleteTarget === "header"
                    ? "This will remove your header image from your profile."
                    : "This will remove your profile photo from your account."}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    if (deleteTarget === "header") {
                      setEditHeaderPreview("");
                      setEditHeaderData("");
                      setEditHeaderChanged(true);
                    }
                    if (deleteTarget === "avatar") {
                      setEditAvatarPreview("");
                      setEditAvatarData("");
                      setEditAvatarChanged(true);
                    }
                    setDeleteTarget(null);
                  }}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
  hideCloseButton
        isOpen={Boolean(foodVisitDeleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setFoodVisitDeleteTarget(null);
          }
        }}
        placement="center"
        size="sm"
        motionProps={modalMotionProps}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete visit?</ModalHeader>
              <ModalBody>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  This will permanently remove the visit.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={confirmDeleteFoodVisit}
                  isLoading={isDeletingFoodVisit}
                  isDisabled={isDeletingFoodVisit}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
  hideCloseButton
        isOpen={Boolean(foodPlaceDeleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setFoodPlaceDeleteTarget(null);
            setFoodPlaceDeleteConfirmName("");
          }
        }}
        placement="center"
        size="sm"
        motionProps={modalMotionProps}
      >
        <ModalContent>
          {(onClose) => {
            const requiresNameConfirmation =
              (foodPlaceDeleteTarget?.visit_count ?? 0) > 0;
            const targetName = foodPlaceDeleteTarget?.name || "";
            const hasMatchingName =
              !requiresNameConfirmation ||
              foodPlaceDeleteConfirmName.trim().toLowerCase() ===
                targetName.trim().toLowerCase();
            return (
              <>
                <ModalHeader>Delete food place?</ModalHeader>
                <ModalBody className="gap-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    This will permanently remove{" "}
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {targetName || "this place"}
                    </span>
                    . Are you sure?
                  </p>
                  {requiresNameConfirmation ? (
                    <>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        This place has visits. Type{" "}
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {targetName}
                        </span>{" "}
                        to confirm deletion.
                      </p>
                      <Input
                        label="Place name"
                        placeholder="Type the place name"
                        value={foodPlaceDeleteConfirmName}
                        onValueChange={setFoodPlaceDeleteConfirmName}
                      />
                    </>
                  ) : null}
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    onPress={confirmDeleteFoodPlace}
                    isLoading={isDeletingFoodPlace}
                    isDisabled={!hasMatchingName || isDeletingFoodPlace}
                  >
                    Delete
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
      <Modal
  hideCloseButton
        isOpen={Boolean(activityVisitDeleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setActivityVisitDeleteTarget(null);
          }
        }}
        placement="center"
        size="sm"
        motionProps={modalMotionProps}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete visit?</ModalHeader>
              <ModalBody>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  This will permanently remove the visit.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={confirmDeleteActivityVisit}
                  isLoading={isDeletingActivityVisit}
                  isDisabled={isDeletingActivityVisit}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
  hideCloseButton
        isOpen={Boolean(activityDeleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setActivityDeleteTarget(null);
            setActivityDeleteConfirmName("");
          }
        }}
        placement="center"
        size="sm"
        motionProps={modalMotionProps}
      >
        <ModalContent>
          {(onClose) => {
            const targetName = activityDeleteTarget?.name || "this activity";
            const requiresNameConfirmation = activityDeleteHasVisits;
            const hasMatchingName =
              !requiresNameConfirmation ||
              activityDeleteConfirmName.trim().toLowerCase() ===
                targetName.trim().toLowerCase();
            return (
              <>
                <ModalHeader>Delete activity?</ModalHeader>
                <ModalBody className="gap-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    This will permanently remove{" "}
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {targetName}
                    </span>
                    . Are you sure?
                  </p>
                  {requiresNameConfirmation ? (
                    <>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        This activity has visits. Type{" "}
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {targetName}
                        </span>{" "}
                        to confirm deletion.
                      </p>
                      <Input
                        label="Activity name"
                        placeholder="Type the activity name"
                        value={activityDeleteConfirmName}
                        onValueChange={setActivityDeleteConfirmName}
                      />
                    </>
                  ) : null}
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    onPress={() => confirmDeleteActivity(onClose)}
                    isDisabled={!hasMatchingName}
                  >
                    Delete
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </>
  );
}
