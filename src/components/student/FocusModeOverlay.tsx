"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minimize2,
  Play,
  Pause,
  Brain,
  Flame,
  Zap,
} from "lucide-react";

interface FocusModeOverlayProps {
  isOpen: boolean;
  onExit: () => void;
  taskObjective?: string;
  secondsElapsed: number;
  isRunning: boolean;
  onToggleTimer: () => void;
  onOpenScratchpad?: () => void;
  distractionCount?: number;
}

function formatThreeColumns(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return {
    hours: String(hrs).padStart(2, "0"),
    minutes: String(mins).padStart(2, "0"),
    seconds: String(secs).padStart(2, "0"),
  };
}

interface ForgeHeatTier {
  name: string;
  badgeClass: string;
  barWidthPercent: number;
  gradient: string;
  useAccent: boolean;
}

function getForgeHeatTier(minutes: number): ForgeHeatTier {
  if (minutes < 25) {
    return {
      name: "COLD STEEL",
      badgeClass: "bg-zinc-800 text-zinc-400 border-zinc-700/80",
      barWidthPercent: Math.max(10, (minutes / 25) * 25),
      gradient: "from-zinc-600 to-zinc-400",
      useAccent: false,
    };
  }
  if (minutes < 50) {
    return {
      name: "TEMPERED IRON",
      badgeClass: "bg-zinc-900 text-zinc-200 border-zinc-700/80",
      barWidthPercent: 25 + ((minutes - 25) / 25) * 25,
      gradient: "from-zinc-600 to-zinc-200",
      useAccent: true,
    };
  }
  if (minutes < 90) {
    return {
      name: "PLASMA FLOW",
      badgeClass: "bg-zinc-900 text-zinc-100 border-zinc-600",
      barWidthPercent: 50 + ((minutes - 50) / 40) * 35,
      gradient: "from-zinc-500 via-zinc-200 to-white",
      useAccent: true,
    };
  }
  return {
    name: "MAXIMUM FORGE",
    badgeClass: "bg-white/10 text-white border-white/40 animate-pulse",
    barWidthPercent: 100,
    gradient: "from-zinc-400 via-white to-white",
    useAccent: true,
  };
}

export const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({
  isOpen,
  onExit,
  taskObjective = "Deep Focus Session",
  secondsElapsed,
  isRunning,
  onToggleTimer,
  onOpenScratchpad,
  distractionCount = 0,
}) => {
  // Keyboard shortcut listener: Spacebar to toggle, ESC to exit
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onExit();
      } else if (e.code === "Space") {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        onToggleTimer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onExit, onToggleTimer]);

  if (!isOpen) return null;

  const { hours, minutes, seconds } = formatThreeColumns(secondsElapsed);
  const totalMinutes = Math.floor(secondsElapsed / 60);
  const heatTier = getForgeHeatTier(totalMinutes);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-8 md:p-10 select-none text-zinc-100 overflow-hidden"
        style={{
          backgroundColor: "var(--bg-page, #070809)",
        }}
      >
        {/* Ambient Subtle Radial Theme Backlight */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, var(--accent-primary, rgba(66,228,37,0.08)) 0%, transparent 65%)`,
              opacity: isRunning ? 0.8 : 0.25,
              transition: "opacity 0.5s ease",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 100%, var(--accent-primary, rgba(66,228,37,0.05)) 0%, transparent 50%)`,
            }}
          />
        </div>

        {/* 1. Top Header Bar */}
        <header className="relative z-20 flex items-center justify-between w-full max-w-5xl mx-auto">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-zinc-950/90 border border-white/10 backdrop-blur-md text-xs font-mono text-zinc-300 flex items-center gap-2 shadow-sm">
              <span
                className={`w-2 h-2 rounded-full ${isRunning ? "animate-pulse" : "bg-zinc-600"}`}
                style={
                  isRunning
                    ? {
                        backgroundColor: "var(--accent-primary, #42e425)",
                        boxShadow: "0 0 8px var(--accent-primary, #42e425)",
                      }
                    : undefined
                }
              />
              <span
                className={isRunning ? "font-semibold tracking-wider" : "text-zinc-400 tracking-wider"}
                style={isRunning ? { color: "var(--accent-primary, #42e425)" } : undefined}
              >
                {isRunning ? "DEEP FOCUS ACTIVE" : "SESSION PAUSED"}
              </span>
            </span>
          </div>

          {/* Controls: Scratchpad (optional) & Exit Zen */}
          <div className="flex items-center gap-2">
            {onOpenScratchpad && (
              <button
                type="button"
                onClick={onOpenScratchpad}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white text-xs font-mono backdrop-blur-md transition shadow-sm cursor-pointer"
                title="Scratchpad (Alt + D)"
              >
                <Brain className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Scratchpad</span>
                {distractionCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-zinc-700 text-zinc-200 text-[10px] font-bold">
                    {distractionCount}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onExit}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white text-xs font-mono backdrop-blur-md transition shadow-sm active:scale-95 cursor-pointer"
              title="Exit Zen (ESC)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Zen</span>
              <kbd className="text-[10px] text-zinc-500 ml-1 px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700">ESC</kbd>
            </button>
          </div>
        </header>

        {/* 2. Center Pinned Display: Oversized Righteous Stopwatch */}
        <main className="relative z-20 flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-6 sm:space-y-8 my-auto w-full">
          {/* Locked Objective Tag */}
          <div className="space-y-1.5 max-w-xl">
            <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-zinc-500">
              Locked Focus Objective
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold tracking-tight text-zinc-100 leading-snug px-4">
              &ldquo;{taskObjective}&rdquo;
            </h2>
          </div>

          {/* Oversized Righteous Font Digit Readout */}
          <div className="w-full flex items-center justify-center gap-3 sm:gap-6 md:gap-8 my-2 select-none">
            {/* HOURS Column */}
            <div className="flex flex-col items-center">
              <div className="font-righteous text-6xl sm:text-8xl md:text-9xl text-white tracking-tight tabular-nums">
                {hours}
              </div>
              <span className="text-[10px] sm:text-xs md:text-sm font-mono tracking-widest text-zinc-400 uppercase mt-2 sm:mt-3 font-medium">
                HOURS
              </span>
            </div>

            {/* Pulsing Colon Dot Separators */}
            <div className="flex flex-col items-center justify-center gap-2.5 sm:gap-3.5 pb-6 sm:pb-9 md:pb-11">
              <span
                className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full transition-opacity duration-300 ${
                  isRunning ? "bg-zinc-400 animate-pulse" : "bg-zinc-700"
                }`}
              />
              <span
                className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full transition-opacity duration-300 ${
                  isRunning ? "bg-zinc-400 animate-pulse" : "bg-zinc-700"
                }`}
              />
            </div>

            {/* MINUTES Column */}
            <div className="flex flex-col items-center">
              <div className="font-righteous text-6xl sm:text-8xl md:text-9xl text-white tracking-tight tabular-nums">
                {minutes}
              </div>
              <span className="text-[10px] sm:text-xs md:text-sm font-mono tracking-widest text-zinc-400 uppercase mt-2 sm:mt-3 font-medium">
                MINUTES
              </span>
            </div>

            {/* Pulsing Colon Dot Separators */}
            <div className="flex flex-col items-center justify-center gap-2.5 sm:gap-3.5 pb-6 sm:pb-9 md:pb-11">
              <span
                className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full transition-opacity duration-300 ${
                  isRunning ? "bg-zinc-400 animate-pulse" : "bg-zinc-700"
                }`}
              />
              <span
                className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full transition-opacity duration-300 ${
                  isRunning ? "bg-zinc-400 animate-pulse" : "bg-zinc-700"
                }`}
              />
            </div>

            {/* SECONDS Column (Dynamic Accent on running) */}
            <div className="flex flex-col items-center">
              <div
                className="font-righteous text-6xl sm:text-8xl md:text-9xl tracking-tight tabular-nums transition-colors duration-200"
                style={{
                  color: isRunning ? "var(--accent-primary, #42e425)" : "#ffffff",
                }}
              >
                {seconds}
              </div>
              <span className="text-[10px] sm:text-xs md:text-sm font-mono tracking-widest text-zinc-400 uppercase mt-2 sm:mt-3 font-medium">
                SECONDS
              </span>
            </div>
          </div>

          {/* Central Start/Pause Button (Dynamic Theme Accent) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onToggleTimer}
              className="flex items-center gap-2 px-8 sm:px-10 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm md:text-base transition active:scale-[0.98] shadow-lg hover:brightness-110 cursor-pointer"
              style={{
                backgroundColor: "var(--accent-primary, #42e425)",
                color: "var(--accent-btn-text, #050805)",
                boxShadow: isRunning
                  ? "0 0 25px var(--accent-primary, rgba(66,228,37,0.35))"
                  : "0 0 15px rgba(255,255,255,0.08)",
              }}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Session</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Session</span>
                </>
              )}
            </button>
          </div>
        </main>

        {/* 3. Bottom Pinned Section: Gamified "Forge Heat & Momentum Bar" */}
        <footer className="relative z-20 w-full max-w-2xl mx-auto flex flex-col items-center space-y-2.5 pt-4 border-t border-white/10">
          {/* Header Row: Forge Heat Tier Badge & Unbroken Streak */}
          <div className="w-full flex items-center justify-between px-1 text-xs font-mono">
            {/* Forge Heat Status */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Flame
                  className={`w-3.5 h-3.5 ${isRunning ? "animate-pulse" : "text-zinc-500"}`}
                  style={isRunning ? { color: "var(--accent-primary, #42e425)" } : undefined}
                />
                <span>Forge Heat:</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${heatTier.badgeClass}`}
                style={
                  heatTier.useAccent
                    ? {
                        borderColor: "var(--accent-primary, #42e425)",
                        color: "var(--accent-primary, #42e425)",
                      }
                    : undefined
                }
              >
                {heatTier.name}
              </span>
            </div>

            {/* Unbroken Streak */}
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Zap
                className="w-3.5 h-3.5"
                style={{ color: "var(--accent-primary, #42e425)" }}
              />
              <span>
                Unbroken Streak: <strong className="text-white font-bold">{totalMinutes}m</strong>
              </span>
            </div>
          </div>

          {/* Sleek Horizontal Momentum Progress Bar */}
          <div className="w-full h-2 bg-zinc-900/90 rounded-full border border-white/10 p-0.5 overflow-hidden shadow-inner relative">
            <motion.div
              className={`h-full rounded-full ${heatTier.useAccent ? "" : "bg-gradient-to-r from-zinc-600 to-zinc-400"}`}
              initial={{ width: 0 }}
              animate={{ width: `${heatTier.barWidthPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={
                heatTier.useAccent
                  ? {
                      background: "linear-gradient(90deg, var(--accent-secondary, #38cb1e), var(--accent-primary, #42e425))",
                      boxShadow: isRunning ? "0 0 12px var(--accent-primary, rgba(66,228,37,0.4))" : "none",
                    }
                  : undefined
              }
            />
          </div>

          {/* Micro-incentive & Shortcuts footer row */}
          <div className="w-full flex items-center justify-between px-1 text-[10px] font-mono text-zinc-500">
            <span>Every continuous minute fuels the fire. Pausing cools the forge.</span>
            <div className="hidden sm:flex items-center gap-1 text-zinc-500">
              <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">Space</kbd>
              <span>to toggle &bull;</span>
              <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">ESC</kbd>
              <span>to exit</span>
            </div>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};

export default FocusModeOverlay;
