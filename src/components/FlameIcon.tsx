"use client";

import React, { useId } from "react";

interface FlameIconProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  containerVariant?: "navbar" | "card" | "none";
  style?: React.CSSProperties;
}

export const FlameIcon: React.FC<FlameIconProps> = ({
  size = "md",
  className = "",
  containerVariant = "none",
  style,
}) => {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  // Dimensions for the vector SVG
  const dimension = {
    sm: 16,
    md: 22,
    lg: 32,
    xl: 44,
  }[size];

  // Crisp dual-layer vector SVG
  const vectorFlameSvg = (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flame-wiggle-subtle select-none ${className}`}
      style={style}
    >
      <defs>
        {/* Outer Flame Gradient: Rich Emerald Green (#34d399 -> #059669) */}
        <linearGradient
          id={`outer-emerald-flame-${id}`}
          x1="12"
          y1="2"
          x2="12"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Inner Core Flame Gradient: Pale Mint Core (#ecfdf5 -> #6ee7b7) */}
        <linearGradient
          id={`inner-core-flame-${id}`}
          x1="12"
          y1="11.5"
          x2="12"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ecfdf5" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>
      </defs>

      {/* Layer 1: Outer Emerald Flame */}
      <path
        d="M12 2C11.2 4.6 9.8 6.5 8.5 9C6.8 12.2 6 14.2 6 16C6 19.3 8.7 22 12 22C15.3 22 18 19.3 18 16C18 13.2 16.5 10.5 14.8 7.8C14.2 9.4 13.3 10.6 12.2 11.2C12.1 8.8 12.4 5.5 12 2Z"
        fill={`url(#outer-emerald-flame-${id})`}
      />

      {/* Layer 2: Distinct Inner Core Flame (Gently Pulses at Base) */}
      <path
        d="M12 11.5C11 13.3 9.8 14.8 9.8 16.5C9.8 18.2 10.8 19.8 12 19.8C13.2 19.8 14.2 18.2 14.2 16.5C14.2 14.8 13 13.3 12 11.5Z"
        fill={`url(#inner-core-flame-${id})`}
        className="flame-core-pulse"
      />
    </svg>
  );

  // Navbar compact circular container
  if (containerVariant === "navbar") {
    return (
      <div className="w-7 h-7 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        {vectorFlameSvg}
      </div>
    );
  }

  // Card rounded container: clean dark card with zero muddy blur
  if (containerVariant === "card") {
    return (
      <div className="rounded-2xl bg-[#16181c] border border-white/10 p-3.5 inline-flex items-center justify-center mb-6">
        {vectorFlameSvg}
      </div>
    );
  }

  return vectorFlameSvg;
};

export default FlameIcon;
