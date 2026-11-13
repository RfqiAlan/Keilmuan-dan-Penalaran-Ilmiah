import { useState } from "react";

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 sm:w-16 sm:h-16 text-xl sm:text-2xl",
  xl: "w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl",
  "2xl": "w-28 h-28 sm:w-32 sm:h-32 text-3xl sm:text-4xl",
};

export default function Avatar({
  src,
  name = "User",
  size = "md",
  className = "",
  alt,
  ...props
}) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const initial = (name || "?").charAt(0).toUpperCase();

  // Reset imgError if src changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleImgError = () => {
    setImgError(true);
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 select-none overflow-hidden ${sizeClass} ${className}`}
      {...props}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt || name}
          onError={handleImgError}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div className="w-full h-full bg-sky-100 dark:bg-sky-950/70 border border-sky-300 dark:border-sky-800 rounded-full flex items-center justify-center font-bold text-[#0284c7] dark:text-[#38bdf8] shadow-xs">
          {initial}
        </div>
      )}
    </div>
  );
}
