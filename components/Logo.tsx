import React from "react";

export interface LogoProps {
  size?: number;
  variant?: "accent" | "mono";
  className?: string;
}

export default function Logo({
  size = 32,
  variant = "accent",
  className = "",
}: LogoProps) {
  // Unique gradient IDs so multiple instances on a page don't conflict
  const gradientId = "ascend-sigil-gradient";
  const glowId = "ascend-sigil-glow";

  if (variant === "mono") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        {/* Monochromatic glyph for high-contrast small rendering */}
        <path
          d="M16 3L27 25H21L16 14.5L11 25H5L16 3Z"
          fill="currentColor"
        />
        <polygon points="16,11 18.5,19 13.5,19" fill="currentColor" opacity="0.9" />
        <circle cx="16" cy="7.5" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="5"
          y1="3"
          x2="27"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#c4b5fd" />
          <stop offset="0.45" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#4c1d95" />
        </linearGradient>

        <linearGradient
          id="ascend-core-gradient"
          x1="13"
          y1="11"
          x2="19"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>

        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1.5"
            floodColor="#8b5cf6"
            floodOpacity="0.45"
          />
        </filter>
      </defs>

      {/* Outer Ascension Chevron Blade */}
      <path
        d="M16 3L27 25H21.2L16 14.2L10.8 25H5L16 3Z"
        fill={`url(#${gradientId})`}
        stroke="#c4b5fd"
        strokeWidth="0.8"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />

      {/* Relic Core Amber Apex Prism */}
      <polygon
        points="16,10.5 19,19 13,19"
        fill="url(#ascend-core-gradient)"
        stroke="#fef3c7"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />

      {/* Zenith Luminary Star */}
      <circle cx="16" cy="7" r="1.25" fill="#ffffff" />
    </svg>
  );
}
