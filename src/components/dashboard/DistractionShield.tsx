"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Play,
  ArrowRight,
  RotateCcw,
  X,
} from "lucide-react";
import { ShieldEvent } from "@/hooks/useDistractionShield";
import { formatShortDuration, formatTime } from "@/lib/utils";

const ACCENT = "var(--accent-color, var(--accent-primary))";
const WARN = "#FBBF24";
const OFF = "rgba(255, 255, 255, 0.35)";

const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

/* ------------------------------------------------------------------ */
/* Status panel shown inside the stopwatch card                        */
/* ------------------------------------------------------------------ */

interface ShieldPanelProps {
  isEnabled: boolean;
  isRunning: boolean;
  isPaused: boolean;
  distractionCount: number;
  awaySeconds: number;
  purity: number;
  onToggle: () => void;
}

export const ShieldPanel: React.FC<ShieldPanelProps> = ({
  isEnabled,
  isRunning,
  isPaused,
  distractionCount,
  awaySeconds,
  purity,
  onToggle,
}) => {
  const isCracked = isEnabled && distractionCount > 0;
  const inSession = isRunning || isPaused;

  let tone = ACCENT;
  let label = "Standby";
  let description = "Arms automatically when you start a session";
  let Icon = Shield;

  if (!isEnabled) {
    tone = OFF;
    label = "Off";
    description = "Tab switches won't be tracked this session";
    Icon = ShieldOff;
  } else if (isCracked) {
    tone = WARN;
    label = "Cracked";
    description = `${distractionCount} ${distractionCount === 1 ? "break" : "breaks"} · ${formatShortDuration(awaySeconds)} away`;
    Icon = ShieldAlert;
  } else if (isRunning) {
    label = "Armed";
    description = "Leave this tab for 10s+ and the shield cracks";
    Icon = ShieldCheck;
  } else if (isPaused) {
    label = "Intact";
    description = "Zero distractions this session";
    Icon = ShieldCheck;
  }

  return (
    <div
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.02)",
        borderColor: isEnabled ? tint(tone, 18) : "rgba(255, 255, 255, 0.06)",
      }}
      className="mt-6 w-full max-w-md rounded-2xl border px-3.5 sm:px-4 py-3 flex items-center gap-3 transition-colors duration-300"
    >
      {/* Shield Emblem */}
      <motion.div
        key={distractionCount}
        initial={distractionCount > 0 ? { rotate: -12, scale: 1.15 } : false}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 12 }}
        style={{ color: tone, backgroundColor: tint(tone, 12) }}
        className="relative w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center"
      >
        {isEnabled && isRunning && !isCracked && (
          <span
            style={{ borderColor: tone }}
            className="absolute inset-0 rounded-xl border animate-ping opacity-25"
          />
        )}
        <Icon className="w-4 h-4" />
      </motion.div>

      {/* Copy */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-sans text-white/90 whitespace-nowrap">
            <span className="hidden sm:inline">Distraction </span>Shield
          </span>
          <span
            style={{ color: tone, backgroundColor: tint(tone, 12) }}
            className="text-[9px] uppercase tracking-widest font-mono font-bold px-1.5 py-0.5 rounded-md"
          >
            {label}
          </span>
        </div>
        <p
          style={{ color: "var(--text-secondary)" }}
          className="text-[11px] font-sans mt-0.5 leading-snug sm:truncate"
        >
          {description}
        </p>
      </div>

      {/* Live Purity Readout */}
      {isEnabled && inSession && (
        <div className="text-right flex-shrink-0">
          <div
            style={{ color: tone }}
            className="font-mono font-bold text-sm tabular-numbers leading-none"
          >
            {purity}%
          </div>
          <div
            style={{ color: "var(--text-secondary)" }}
            className="text-[9px] uppercase tracking-widest font-mono mt-1"
          >
            Purity
          </div>
        </div>
      )}

      {/* On / Off Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={isEnabled}
        aria-label="Toggle Distraction Shield"
        title={isEnabled ? "Turn shield off" : "Turn shield on"}
        onClick={onToggle}
        style={{
          backgroundColor: isEnabled ? tint(ACCENT, 85) : "rgba(255, 255, 255, 0.1)",
          boxShadow: isEnabled ? "var(--accent-glow)" : undefined,
        }}
        className="relative w-9 h-5 flex-shrink-0 rounded-full transition-colors duration-200 cursor-pointer"
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
            isEnabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Toast shown when the user returns to the tab                        */
/* ------------------------------------------------------------------ */

interface ShieldToastProps {
  event: ShieldEvent | null;
  purity: number;
  onDismiss: () => void;
}

export const ShieldToast: React.FC<ShieldToastProps> = ({ event, purity, onDismiss }) => {
  const visible = event !== null && event.type !== "autoPaused";

  useEffect(() => {
    if (!visible || !event) return;
    const timeout = setTimeout(onDismiss, event.type === "held" ? 3500 : 6500);
    return () => clearTimeout(timeout);
  }, [visible, event, onDismiss]);

  // Keep the last toast mounted and animate it out in place. Relying on
  // AnimatePresence exit left an invisible, click-blocking node behind.
  const [shown, setShown] = useState<ShieldEvent | null>(null);
  useEffect(() => {
    if (visible && event) setShown(event);
  }, [visible, event]);

  if (!shown) return null;

  const isHeld = shown.type === "held";
  const tone = isHeld ? ACCENT : WARN;

  return (
    <div className="fixed top-20 sm:top-24 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <motion.div
        key={shown.id}
        role="status"
        aria-hidden={!visible}
        initial={{ y: -16, opacity: 0, scale: 0.96 }}
        animate={visible ? { y: 0, opacity: 1, scale: 1 } : { y: -10, opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{
          pointerEvents: visible ? "auto" : "none",
          visibility: visible ? "visible" : "hidden",
          transitionProperty: "visibility",
          transitionDelay: visible ? "0s" : "0.22s",
          backgroundColor: "rgba(16, 19, 23, 0.92)",
          border: `1px solid ${tint(tone, 35)}`,
          boxShadow: `0 10px 30px rgba(0,0,0,0.6), 0 0 24px ${tint(tone, 18)}`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
        className="max-w-md w-full sm:w-auto rounded-2xl sm:rounded-full pl-2 pr-3 py-2 flex items-center gap-3"
      >
        <div
          style={{ color: tone, backgroundColor: tint(tone, 14) }}
          className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center"
        >
          {isHeld ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-bold font-sans text-white">
            {isHeld ? "Shield held" : "Shield cracked"}
          </p>
          <p style={{ color: "var(--text-secondary)" }} className="text-[11px] font-sans">
            {isHeld
              ? `Back in ${shown.awaySeconds}s, within the grace window.`
              : `Away for ${formatShortDuration(shown.awaySeconds)} · session purity ${purity}%`}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          tabIndex={visible ? 0 : -1}
          aria-label="Dismiss"
          className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Modal shown after the shield auto-paused a long absence            */
/* ------------------------------------------------------------------ */

interface ShieldAutoPauseModalProps {
  event: ShieldEvent | null;
  sessionSeconds: number;
  distractionCount: number;
  purity: number;
  autoPauseMinutes: number;
  isLogging: boolean;
  onResume: () => void;
  onLog: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

export const ShieldAutoPauseModal: React.FC<ShieldAutoPauseModalProps> = ({
  event,
  sessionSeconds,
  distractionCount,
  purity,
  autoPauseMinutes,
  isLogging,
  onResume,
  onLog,
  onDiscard,
  onClose,
}) => {
  const isOpen = event?.type === "autoPaused";

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const stats = [
    { label: "Logged", value: formatTime(sessionSeconds) },
    { label: "Breaks", value: String(distractionCount) },
    { label: "Purity", value: `${purity}%` },
  ];

  // Unmount immediately on close: AnimatePresence exits left the dialog
  // mounted over the page, blocking every click.
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shield-modal-title"
        initial={{ y: 20, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          backgroundColor: "var(--bg-card)",
          border: "var(--border-card)",
          color: "var(--text-primary)",
          borderRadius: "var(--card-radius)",
          boxShadow: "var(--card-shadow)",
          backdropFilter: "blur(var(--backdrop-blur))",
          WebkitBackdropFilter: "blur(var(--backdrop-blur))",
        }}
        className="relative z-10 w-full max-w-md p-6 sm:p-8 text-center"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          style={{
            color: WARN,
            backgroundColor: tint(WARN, 12),
            boxShadow: `0 0 30px ${tint(WARN, 25)}`,
          }}
          className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
        >
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h2
          id="shield-modal-title"
          className="mt-5 text-xl sm:text-2xl font-extrabold tracking-tight font-display"
        >
          Shield Paused Your Forge
        </h2>
        <p
          style={{ color: "var(--text-secondary)" }}
          className="mt-2 text-xs sm:text-sm font-sans leading-relaxed"
        >
          You stepped away for{" "}
          <span className="font-bold text-white">{formatShortDuration(event.awaySeconds)}</span>.
          The timer froze {autoPauseMinutes} minutes after you left, so idle time won&apos;t
          inflate your focus.
        </p>

        {/* Session Snapshot */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-white/[0.03] border border-white/[0.05] py-3"
            >
              <div className="font-mono font-bold text-sm sm:text-base tabular-numbers text-white">
                {stat.value}
              </div>
              <div
                style={{ color: "var(--text-secondary)" }}
                className="text-[9px] uppercase tracking-widest font-mono mt-1"
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={onResume}
            disabled={isLogging}
            className="theme-accent-btn w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-extrabold text-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume Focus</span>
          </button>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onLog}
              disabled={isLogging}
              style={{ color: ACCENT }}
              className="px-4 py-2 text-xs sm:text-sm font-bold hover:brightness-125 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isLogging ? "Logging..." : "Complete & Log"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-white/15">|</span>
            <button
              type="button"
              onClick={onDiscard}
              disabled={isLogging}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-rose-400/80 hover:text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Discard</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
