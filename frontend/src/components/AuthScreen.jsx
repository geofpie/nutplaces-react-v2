import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Lock, RefreshCcw, ShieldCheck } from "lucide-react";
import { Avatar, Button, Card, CardBody, InputOtp } from "@heroui/react";

export default function AuthScreen({
  users,
  selectedUser,
  setSelectedUser,
  setPin,
  setOtpCode,
  setPinVerified,
  setPinError,
  setStatusMessage,
  pinInputRef,
  pinVerified,
  pinShake,
  setPinShake,
  pin,
  handlePinChange,
  handleVerifyPin,
  isPinLoading,
  pinError,
  otpShake,
  setOtpShake,
  otpCode,
  handleOtpChange,
  handleVerifyOtp,
  isOtpLoading,
  otpError,
  handleResendOtp,
  statusMessage,
  resolveAvatarUrl,
  PIN_LENGTH,
}) {
  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 11
      ? "Good morning"
      : hour >= 11 && hour < 16
        ? "Good afternoon"
        : hour >= 16 && hour < 22
          ? "Good evening"
          : "Up late?";
  const greetingLower = greeting.charAt(0).toLowerCase() + greeting.slice(1);
  const heading =
    selectedUser && !pinVerified
      ? `Hi ${selectedUser.display_name || "there"}, ${greetingLower}`
      : greeting;
  const stage = !selectedUser
    ? "select"
    : pinVerified
      ? "otp"
      : "pin";
  const stageIndex = stage === "select" ? 0 : stage === "pin" ? 1 : 2;
  const prevStageRef = useRef(stageIndex);
  const isReturningToSelect = stage === "select" && stageIndex < prevStageRef.current;
  const [resendCooldown, setResendCooldown] = useState(0);
  useEffect(() => {
    prevStageRef.current = stageIndex;
  }, [stageIndex]);
  useEffect(() => {
    if (!pinVerified) {
      setResendCooldown(0);
      return;
    }
    setResendCooldown(30);
  }, [pinVerified]);
  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-16 text-white">
      <div className="gradient-bg">
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="goo">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="10"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
        <div className="gradients-container">
          <div className="g1" />
          <div className="g2" />
          <div className="g3" />
          <div className="g4" />
          <div className="g5" />
          <div className="interactive" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div className="h-[460px] w-[460px] rounded-full bg-white/10 blur-3xl" />
      </div>
      <Card
        className="relative z-10 w-full max-w-md overflow-hidden border border-white/20 bg-white/10 shadow-2xl backdrop-blur-2xl"
        shadow="lg"
      >
        <CardBody className="relative min-h-[460px] overflow-hidden p-0">
          <AnimatePresence>
            {stage === "select" ? (
              <motion.section
                key="select"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 flex h-full flex-col px-10 py-10"
              >
                <div className="text-center">
                  <h1 className="text-3xl font-semibold tracking-tight text-white">
                    {greeting}
                  </h1>
                  <p className="mt-2 text-sm text-white/60">
                    Select your profile to continue
                  </p>
                </div>
                <motion.div
                  key={`avatars-${stage}`}
                  initial={isReturningToSelect ? { opacity: 0, scale: 0.95 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="mt-10 mb-8 flex items-center justify-center gap-8"
                >
                  {users.length ? (
                    users.map((user) => {
                      const avatarSrc = resolveAvatarUrl(user.avatar_url);
                      const hasAvatar = Boolean(avatarSrc);
                      return (
                        <button
                          key={user.telegram_uid}
                          type="button"
                          className="group flex flex-col items-center gap-4"
                          onClick={() => {
                            setSelectedUser(user);
                            setPin("");
                            setOtpCode("");
                            setPinVerified(false);
                            setPinError(false);
                            setStatusMessage("");
                            setTimeout(() => {
                              pinInputRef.current?.focus?.();
                            }, 0);
                          }}
                        >
                          <motion.div
                            layoutId={`avatar-container-${user.telegram_uid}`}
                            className="relative"
                          >
                            <Avatar
                              name={user.display_name || "User"}
                              className={`h-24 w-24 text-2xl transition-all ${
                                hasAvatar
                                  ? "border border-transparent group-hover:border-white/40"
                                  : "bg-neutral-200 text-neutral-700"
                              }`}
                              src={avatarSrc}
                            />
                          </motion.div>
                          <span className="text-base font-semibold text-white/90 group-hover:text-white">
                            {user.display_name || "User"}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-sm text-white/60">No users found.</div>
                  )}
                </motion.div>
                <div className="mt-auto pb-6">
                  <div className="h-px w-full bg-white/15" />
                  <div className="mt-4 text-center text-xs uppercase tracking-[0.35em] text-white/50">
                    or
                  </div>
                  <p className="mt-4 text-center text-sm text-white/70">
                    Or request <strong>/app</strong> on Telegram to generate a
                    magic link to login quickly.
                  </p>
                  {statusMessage ? (
                    <p className="mt-4 text-center text-sm font-semibold text-white">
                      {statusMessage}
                    </p>
                  ) : null}
                  <div className="mt-6 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/50">
                    <Lock className="h-3 w-3" />
                    End-to-end encrypted
                  </div>
                </div>
              </motion.section>
            ) : null}

            {stage === "pin" && selectedUser ? (
              <motion.section
                key="pin"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 flex h-full flex-col px-10 py-10"
              >
                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  onPress={() => {
                    setSelectedUser(null);
                    setPin("");
                    setOtpCode("");
                    setPinVerified(false);
                    setPinError(false);
                    setStatusMessage("");
                  }}
                  className="absolute left-6 top-6 text-white/70 hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex flex-col items-center gap-4 pt-4">
                  <motion.div
                    layoutId={`avatar-container-${selectedUser.telegram_uid}`}
                    className="relative z-10"
                  >
                    {(() => {
                      const avatarSrc = resolveAvatarUrl(selectedUser.avatar_url);
                      const hasAvatar = Boolean(avatarSrc);
                      return (
                        <Avatar
                          name={selectedUser.display_name || "User"}
                          className={`h-20 w-20 text-xl border border-white/20 shadow-xl ${
                            hasAvatar
                              ? ""
                              : "bg-neutral-200 text-neutral-700"
                          }`}
                          src={avatarSrc}
                        />
                      );
                    })()}
                  </motion.div>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-white">
                      {heading}
                    </h2>
                    <p className="mt-1 text-xs text-white/60">
                      Enter your 6-digit PIN to continue
                    </p>
                  </div>
                </div>
                <motion.div
                  className="mt-10 flex flex-col items-center gap-4"
                  animate={
                    pinShake
                      ? { x: [-8, 8, -6, 6, -4, 4, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  onAnimationComplete={() => {
                    if (pinShake) {
                      setPinShake(false);
                    }
                  }}
                >
                  <InputOtp
                    className="w-full"
                    length={PIN_LENGTH}
                    radius="md"
                    size="lg"
                    type="password"
                    variant="faded"
                    value={pin}
                    onValueChange={handlePinChange}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleVerifyPin();
                      }
                    }}
                    ref={pinInputRef}
                    classNames={{
                      base: "w-full",
                      segmentWrapper: "w-full justify-center gap-3",
                      segment: [
                        "relative",
                        "h-12",
                        "w-10",
                        "rounded-xl",
                        "border",
                        "border-white/20",
                        "bg-white/5",
                        "text-white",
                        "backdrop-blur-md",
                        "shadow-[0_10px_25px_rgba(0,0,0,0.15)]",
                        "data-[active=true]:border-white/70",
                        "data-[active=true]:ring-2",
                        "data-[active=true]:ring-white/30",
                        "data-[active=true]:bg-white/15",
                      ],
                      caret: "bg-white",
                      passwordChar: "text-white",
                    }}
                  />
                  {pinError ? (
                    <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
                      Incorrect PIN
                    </span>
                  ) : null}
                  <Button
                    color="primary"
                    onPress={handleVerifyPin}
                    isLoading={isPinLoading}
                    className="w-full"
                  >
                    Unlock device
                  </Button>
                </motion.div>
              </motion.section>
            ) : null}

            {stage === "otp" && selectedUser ? (
              <motion.section
                key="otp"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 flex h-full flex-col px-10 py-10"
              >
                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  onPress={() => {
                    setPinVerified(false);
                    setOtpCode("");
                  }}
                  className="absolute left-6 top-6 text-white/70 hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex flex-col items-center gap-4 pt-4 text-center">
                  <div className="rounded-full bg-blue-500/20 p-4 text-blue-200 ring-1 ring-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Device check
                    </h2>
                    <p className="mt-1 text-xs text-white/60">
                      Enter the code sent to your Telegram
                    </p>
                  </div>
                </div>
                <motion.div
                  className="mt-10 flex flex-col items-center gap-4"
                  animate={
                    otpShake
                      ? { x: [-8, 8, -6, 6, -4, 4, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  onAnimationComplete={() => {
                    if (otpShake) {
                      setOtpShake(false);
                    }
                  }}
                >
                  <InputOtp
                    className="w-full"
                    length={6}
                    value={otpCode}
                    onValueChange={handleOtpChange}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleVerifyOtp();
                      }
                    }}
                    classNames={{
                      base: "w-full",
                      segmentWrapper: "w-full justify-center gap-2",
                      segment: [
                        "relative",
                        "h-12",
                        "w-10",
                        "rounded-xl",
                        "border",
                        "border-white/20",
                        "bg-white/5",
                        "text-white",
                        "backdrop-blur-md",
                        "shadow-[0_10px_25px_rgba(0,0,0,0.15)]",
                        "data-[active=true]:border-white/70",
                        "data-[active=true]:ring-2",
                        "data-[active=true]:ring-white/30",
                        "data-[active=true]:bg-white/15",
                      ],
                      caret: "bg-white",
                      passwordChar: "text-white",
                    }}
                  />
                  {otpError ? (
                    <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
                      Incorrect OTP
                    </span>
                  ) : null}
                  <Button
                    color="secondary"
                    onPress={handleVerifyOtp}
                    isLoading={isOtpLoading}
                    className="w-full"
                  >
                    Verify OTP
                  </Button>
                  <Button
                    variant="flat"
                    isDisabled={resendCooldown > 0}
                    onPress={() => {
                      if (resendCooldown > 0) {
                        return;
                      }
                      handleResendOtp();
                      setResendCooldown(30);
                    }}
                  >
                    Resend OTP{resendCooldown > 0 ? ` (${resendCooldown}s)` : ""}
                  </Button>
                </motion.div>
                {isOtpLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-md"
                  >
                    <div className="flex flex-col items-center gap-3 text-white">
                      <RefreshCcw className="h-8 w-8 animate-spin" />
                      <span className="text-sm font-medium">
                        Verifying credentials...
                      </span>
                    </div>
                  </motion.div>
                ) : null}
              </motion.section>
            ) : null}
          </AnimatePresence>
        </CardBody>
      </Card>
    </main>
  );
}
