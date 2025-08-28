// Custom Dog Paw Print SVG Component with Gradient
function PawPrint({ className = "" }) {
  return (
    <svg 
      className={className}
      fill="currentColor" 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pawGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#FFD700", stopOpacity:1}} />
          <stop offset="30%" style={{stopColor:"#FFA500", stopOpacity:1}} />
          <stop offset="70%" style={{stopColor:"#FF6347", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#DC143C", stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="pawGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#FFD700", stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:"#FF6347", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#8B008B", stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="pawGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#FFA500", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#FF1493", stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="pawGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#FFD700", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#FF6347", stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="pawGradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#FF6347", stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:"#DC143C", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#8B008B", stopOpacity:1}} />
        </linearGradient>
      </defs>
      
      {/* Main pad */}
      <ellipse cx="50" cy="75" rx="20" ry="15" fill="url(#pawGradientMain)" />
      
      {/* Toe pads */}
      <ellipse cx="30" cy="45" rx="8" ry="12" fill="url(#pawGradient1)" />
      <ellipse cx="50" cy="35" rx="8" ry="12" fill="url(#pawGradient2)" />
      <ellipse cx="70" cy="45" rx="8" ry="12" fill="url(#pawGradient3)" />
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
      paw: "h-6 w-6",
      text: "text-sm"
    },
    md: {
      container: "h-8 w-8",
      paw: "h-8 w-8", 
      text: "text-base"
    },
    lg: {
      container: "h-10 w-10",
      paw: "h-10 w-10",
      text: "text-lg"
    },
    xl: {
      container: "h-12 w-12",
      paw: "h-12 w-12",
      text: "text-xl"
    },
    "2xl": {
      container: "h-16 w-16",
      paw: "h-16 w-16",
      text: "text-2xl"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center ${currentSize.container}`}>
        <PawPrint 
          className={`${currentSize.paw}`}
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
