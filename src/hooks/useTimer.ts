"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toDayKey } from "@/lib/day";

interface UseTimerOptions {
  onSessionLogged?: () => void;
  onReset?: () => void;
  minDurationSeconds?: number;
}

export function useTimer(options: UseTimerOptions = {}) {
  const { onSessionLogged, onReset, minDurationSeconds = 10 } = options;

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timestamp references to guarantee zero drift across background browser tabs
  const startTimestampRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // 1. Start or Resume Timer
  const start = useCallback(() => {
    if (isRunning) return;

    setErrorMessage(null);
    startTimestampRef.current = Date.now();
    setIsRunning(true);
    setIsPaused(false);

    timerIntervalRef.current = setInterval(() => {
      if (startTimestampRef.current !== null) {
        const deltaMs = Date.now() - startTimestampRef.current;
        const totalMs = accumulatedMsRef.current + deltaMs;
        setSecondsElapsed(Math.floor(totalMs / 1000));
      }
    }, 200);
  }, [isRunning]);

  // 2. Pause Timer (Freezes time in place, DOES NOT reset to 00:00:00)
  // `atTimestamp` lets callers pause retroactively (e.g. Distraction Shield auto-pause)
  const pauseAt = useCallback((atTimestamp: number) => {
    if (!isRunning || isPaused) return;

    if (startTimestampRef.current !== null) {
      const endMs = Math.min(Math.max(atTimestamp, startTimestampRef.current), Date.now());
      accumulatedMsRef.current += endMs - startTimestampRef.current;
      startTimestampRef.current = null;
    }

    clearTimerInterval();
    setIsRunning(false);
    setIsPaused(true);
    setSecondsElapsed(Math.floor(accumulatedMsRef.current / 1000));
  }, [isRunning, isPaused, clearTimerInterval]);

  const pause = useCallback(() => pauseAt(Date.now()), [pauseAt]);

  // 3. Discard / Reset without saving
  const discard = useCallback(() => {
    clearTimerInterval();
    startTimestampRef.current = null;
    accumulatedMsRef.current = 0;
    setSecondsElapsed(0);
    setIsRunning(false);
    setIsPaused(false);
    setErrorMessage(null);
    onReset?.();
  }, [clearTimerInterval, onReset]);

  // 4. Complete & Log Session to database, then reset
  const completeAndLog = useCallback(async (extra?: Record<string, unknown>) => {
    // If running, capture active slice
    let totalMs = accumulatedMsRef.current;
    if (isRunning && startTimestampRef.current !== null) {
      totalMs += Date.now() - startTimestampRef.current;
    }

    const finalSeconds = Math.floor(totalMs / 1000);

    // Stop timer intervals immediately
    clearTimerInterval();
    setIsRunning(false);
    setIsPaused(false);

    // Validate minimum duration (10 seconds)
    if (finalSeconds < minDurationSeconds) {
      setErrorMessage(
        `Focus block is ${finalSeconds}s. Minimum ${minDurationSeconds}s required to record in the journal.`
      );
      // Keep accumulated time so user can resume if accidental click
      setIsPaused(true);
      return;
    }

    setIsLogging(true);
    setErrorMessage(null);

    try {
      const startedAt = new Date(Date.now() - finalSeconds * 1000).toISOString();
      const endedAt = new Date().toISOString();

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...extra,
          day: toDayKey(),
          duration: finalSeconds,
          startedAt,
          endedAt,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to record focus session");
      }

      // Successful save -> Reset timer back to 00:00:00
      discard();
      onSessionLogged?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving session";
      setErrorMessage(msg);
      setIsPaused(true); // Allow retry
    } finally {
      setIsLogging(false);
    }
  }, [isRunning, minDurationSeconds, clearTimerInterval, discard, onSessionLogged]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  return {
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
  };
}
