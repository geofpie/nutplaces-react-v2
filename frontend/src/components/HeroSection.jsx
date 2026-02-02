import { motion } from "framer-motion";

export default function HeroSection({
  heightClass = "h-[40vh] min-h-[280px] md:h-[55vh] md:min-h-[460px]",
  className = "",
  backgroundStyle,
  backgroundNode,
  overlayClassName = "",
  children,
}) {
  return (
    <div
      className={`relative -mx-4 -mt-6 overflow-hidden ${heightClass} ${className}`}
    >
      {backgroundNode ? (
        backgroundNode
      ) : (
        <motion.div
          className="h-full w-full"
          style={backgroundStyle}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}
      {overlayClassName ? (
        <div className={`absolute inset-0 ${overlayClassName}`} />
      ) : null}
      {children}
    </div>
  );
}
