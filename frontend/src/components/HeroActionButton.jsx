export default function HeroActionButton({ children, className = "" }) {
  return (
    <div className={`absolute bottom-6 right-6 z-20 ${className}`}>
      {children}
    </div>
  );
}
