import { useEffect } from "react";
import { Card, CardBody } from "@heroui/react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { buildAccentKpiGradient } from "../utils/gradients.js";

export default function StatCard({
  label,
  value,
  accentColor,
  isDarkMode,
  gradientConfig,
  className = "",
}) {
  const numericValue = Number(value);
  const isNumeric = Number.isFinite(numericValue);
  const motionValue = useMotionValue(0);
  const roundedValue = useTransform(motionValue, (latest) =>
    Math.round(latest),
  );

  useEffect(() => {
    if (!isNumeric) {
      return undefined;
    }
    const controls = animate(motionValue, numericValue, {
      duration: 0.9,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [motionValue, numericValue, isNumeric]);

  return (
    <Card
      isBlurred
      shadow="sm"
      className={`border-none bg-white/70 dark:bg-neutral-900/60 ${className}`}
      style={{
        background: buildAccentKpiGradient(
          accentColor,
          isDarkMode,
          gradientConfig,
        ),
      }}
    >
      <CardBody className="gap-1 text-center">
        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {isNumeric ? <motion.span>{roundedValue}</motion.span> : value}
        </p>
      </CardBody>
    </Card>
  );
}
