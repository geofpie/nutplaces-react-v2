import { motion } from "framer-motion";

export default function HeroInfoPill({
  children,
  className = "",
  isActive,
  disableAnimation = false,
}) {
  const animateState =
    isActive === undefined ? "visible" : isActive ? "visible" : "hidden";
  return (
    <motion.div
      className={`absolute bottom-6 left-6 z-20 ${className}`}
      initial={disableAnimation ? false : "hidden"}
      animate={animateState}
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{
        duration: disableAnimation ? 0 : 0.4,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
