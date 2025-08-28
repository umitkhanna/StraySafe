// Custom Paw Print SVG Component
function PawPrint({ className = "" }) {
  return (
    <svg 
      className={className}
      fill="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-5 8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm10 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-5 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
    </svg>
  );
}

export default function DoublePawLogo({ 
  size = "md", 
  showText = true, 
  className = "",
  textClassName = ""
}) {
  const sizeClasses = {
    sm: {
      container: "h-6 w-6",
      paw: "h-3 w-3",
      text: "text-sm"
    },
    md: {
      container: "h-8 w-8",
      paw: "h-4 w-4", 
      text: "text-base"
    },
    lg: {
      container: "h-10 w-10",
      paw: "h-5 w-5",
      text: "text-lg"
    },
    xl: {
      container: "h-12 w-12",
      paw: "h-6 w-6",
      text: "text-xl"
    },
    "2xl": {
      container: "h-16 w-16",
      paw: "h-8 w-8",
      text: "text-2xl"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg ${currentSize.container}`}>
        {/* First paw - slightly offset */}
        <PawPrint 
          className={`absolute text-white/80 transform -translate-x-0.5 -translate-y-0.5 ${currentSize.paw}`}
        />
        {/* Second paw - main position */}
        <PawPrint 
          className={`text-white transform translate-x-0.5 translate-y-0.5 ${currentSize.paw}`}
        />
      </div>
      {showText && (
        <span className={`font-bold tracking-tight text-slate-800 dark:text-slate-200 ${currentSize.text} ${textClassName}`}>
          StraySafe
        </span>
      )}
    </div>
  );
}
