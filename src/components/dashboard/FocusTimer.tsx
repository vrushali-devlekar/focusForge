"use client";

import React from "react";
import { Play, Pause, ArrowRight, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { useDistractionShield, computePurity } from "@/hooks/useDistractionShield";
import { formatTime } from "@/lib/utils";
import { ShieldPanel, ShieldToast, ShieldAutoPauseModal } from "./DistractionShield";

const SHIELD_GRACE_SECONDS = 10;
const SHIELD_AUTO_PAUSE_SECONDS = 5 * 60;

interface FocusTimerProps {
  onSessionLogged?: () => void;
  onActiveSecondsChange?: (seconds: number, isRunning: boolean) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onSessionLogged,
  onActiveSecondsChange,
}) => {
  // The shield is created after the timer, so route the timer's reset through a ref
  const resetShieldRef = React.useRef<() => void>(() => {});
  const handleTimerReset = React.useCallback(() => resetShieldRef.current(), []);

  const {
    secondsElapsed,
    isRunning,
    isPaused,
    isLogging,
    errorMessage,
    start,
    pause,
    pauseAt,
    discard,
    completeAndLog,
  } = useTimer({
    onSessionLogged,
    onReset: handleTimerReset,
    minDurationSeconds: 10,
  });

  const shield = useDistractionShield({
    isRunning,
    graceSeconds: SHIELD_GRACE_SECONDS,
    autoPauseSeconds: SHIELD_AUTO_PAUSE_SECONDS,
    onAutoPause: pauseAt,
  });
  resetShieldRef.current = shield.reset;

  const purity = computePurity(secondsElapsed, shield.awaySeconds);

  const handleCompleteAndLog = () =>
    completeAndLog(
      shield.isEnabled
        ? { distractionCount: shield.distractionCount, awaySeconds: shield.awaySeconds }
        : undefined
    );

  React.useEffect(() => {
    onActiveSecondsChange?.(secondsElapsed, isRunning);
  }, [secondsElapsed, isRunning, onActiveSecondsChange]);

  const formatted = formatTime(secondsElapsed, true);
  const [hrs, mins, secs] = formatted.split(":");

  return (
    <>
      <div id="stopwatch" className="w-full flex flex-col items-center text-center space-y-6">
        {/* Hero Headline */}
        <div className="space-y-3 max-w-2xl px-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-sans">
            Forging Your{" "}
            <span
              className="theme-accent-text"
              style={{
                textShadow: "var(--accent-glow)",
              }}
            >
              Deep Focus
            </span>
          </h1>
          <p
            style={{ color: "var(--text-secondary)" }}
            className="text-xs sm:text-sm font-sans max-w-lg mx-auto"
          >
            Unbroken focus blocks are the critical component of your daily deep work mastery.
          </p>
        </div>

        {/* Clock Display Card */}
        <div
          className="theme-card w-full max-w-xl p-8 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300"
        >
          {/* Top Status Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span
              style={{
                backgroundColor: isRunning
                  ? "var(--accent-color, var(--accent-primary))"
                  : isPaused
                  ? "#EAB308"
                  : "rgba(255, 255, 255, 0.3)",
                boxShadow: isRunning ? "var(--accent-glow)" : undefined,
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isRunning ? "animate-pulse" : ""
              }`}
            />
            <span
              style={{ color: "var(--text-secondary)" }}
              className="text-[11px] uppercase tracking-widest font-mono font-semibold"
            >
              {isRunning
                ? "Deep Focus Active"
                : isPaused
                ? "Session Paused"
                : "Focus Stopwatch"}
            </span>
          </div>

          {/* Digits Display in Monospace */}
          <div className="flex items-baseline justify-center font-mono font-light text-6xl sm:text-7xl md:text-8xl tracking-tight select-none tabular-numbers text-white drop-shadow-md my-2">
            <div className="flex flex-col items-center">
              <span className="leading-none">{hrs}</span>
              <span
                style={{ color: "var(--text-secondary)" }}
                className="text-[10px] font-sans font-medium uppercase tracking-widest mt-3 opacity-75"
              >
                Hours
              </span>
            </div>

            <span
              style={{ color: "rgba(255, 255, 255, 0.3)" }}
              className={`leading-none px-2 sm:px-4 pb-6 font-thin ${
                isRunning ? "animate-pulse" : ""
              }`}
            >
              :
            </span>

            <div className="flex flex-col items-center">
              <span className="leading-none">{mins}</span>
              <span
                style={{ color: "var(--text-secondary)" }}
                className="text-[10px] font-sans font-medium uppercase tracking-widest mt-3 opacity-75"
              >
                Minutes
              </span>
            </div>

            <span
              style={{ color: "rgba(255, 255, 255, 0.3)" }}
              className={`leading-none px-2 sm:px-4 pb-6 font-thin ${
                isRunning ? "animate-pulse" : ""
              }`}
            >
              :
            </span>

            <div className="flex flex-col items-center">
              <span
                style={{
                  color: isRunning ? "var(--accent-color, var(--accent-primary))" : "#FFFFFF",
                }}
                className="leading-none transition-colors duration-200 font-bold"
              >
                {secs}
              </span>
              <span
                style={{ color: "var(--text-secondary)" }}
                className="text-[10px] font-sans font-medium uppercase tracking-widest mt-3 opacity-75"
              >
                Seconds
              </span>
            </div>
          </div>

          {/* Dual-Pill Action Capsule */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <div
              style={{
                backgroundColor: "rgba(16, 19, 23, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
              className="rounded-full p-1.5 flex items-center gap-1.5"
            >
              {/* Primary Action Button */}
              {!isRunning && !isPaused && (
                <button
                  type="button"
                  onClick={start}
                  disabled={isLogging}
                  className="theme-accent-btn flex items-center gap-2 px-7 sm:px-8 py-3 rounded-full font-extrabold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Get Started</span>
                </button>
              )}

              {isRunning && (
                <button
                  type="button"
                  onClick={pause}
                  disabled={isLogging}
                  className="theme-accent-btn flex items-center gap-2 px-7 sm:px-8 py-3 rounded-full font-extrabold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Session</span>
                </button>
              )}

              {isPaused && (
                <button
                  type="button"
                  onClick={start}
                  disabled={isLogging}
                  className="theme-accent-btn flex items-center gap-2 px-7 sm:px-8 py-3 rounded-full font-extrabold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Focus</span>
                </button>
              )}

              {/* Secondary Action Link Button */}
              {!isRunning && !isPaused ? (
                <a
                  href="#constellation"
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white/80 hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteAndLog}
                  disabled={isLogging}
                  style={{
                    color: "var(--accent-color, var(--accent-primary))",
                  }}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold hover:brightness-125 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLogging ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Logging...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete & Log</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Discard link shown only when paused with recorded time */}
            {isPaused && secondsElapsed > 0 && (
              <button
                type="button"
                onClick={discard}
                disabled={isLogging}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-400/80 hover:text-rose-300 py-1 transition-colors cursor-pointer"
                title="Discard session without saving"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Discard Session</span>
              </button>
            )}
          </div>

          {/* Distraction Shield Status */}
          <ShieldPanel
            isEnabled={shield.isEnabled}
            isRunning={isRunning}
            isPaused={isPaused}
            distractionCount={shield.distractionCount}
            awaySeconds={shield.awaySeconds}
            purity={purity}
            onToggle={shield.toggleEnabled}
          />

          {/* Error Alert */}
          {errorMessage && (
            <div className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      <ShieldToast event={shield.lastEvent} purity={purity} onDismiss={shield.dismissEvent} />

      <ShieldAutoPauseModal
        event={shield.lastEvent}
        sessionSeconds={secondsElapsed}
        distractionCount={shield.distractionCount}
        purity={purity}
        autoPauseMinutes={SHIELD_AUTO_PAUSE_SECONDS / 60}
        isLogging={isLogging}
        onResume={() => {
          shield.dismissEvent();
          start();
        }}
        onLog={() => {
          shield.dismissEvent();
          handleCompleteAndLog();
        }}
        onDiscard={() => {
          shield.dismissEvent();
          discard();
        }}
        onClose={shield.dismissEvent}
      />
    </>
  );
};

export default FocusTimer;
