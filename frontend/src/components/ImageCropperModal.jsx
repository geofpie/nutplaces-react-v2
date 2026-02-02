import Cropper from "react-easy-crop";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

export default function ImageCropperModal({
  isOpen,
  onOpenChange,
  motionProps,
  title,
  imageSrc,
  crop,
  setCrop,
  zoom,
  setZoom,
  aspect,
  cropShape = "rect",
  onCropComplete,
  onConfirm,
  confirmLabel = "Use photo",
  isSaving = false,
  containerClassName = "relative h-48 w-full overflow-hidden rounded-2xl bg-neutral-900",
  showHelperText = true,
  helperText = "Pinch to zoom on touch devices.",
}) {
  return (
    <Modal
  hideCloseButton
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      motionProps={motionProps}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>
              <div className={containerClassName}>
                {imageSrc ? (
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    cropShape={cropShape}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                ) : null}
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
              {showHelperText ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {helperText}
                </p>
              ) : null}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} isDisabled={isSaving}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={onConfirm}
                isLoading={isSaving}
                isDisabled={isSaving}
              >
                {confirmLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
