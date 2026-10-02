"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const SHIELD_STORAGE_KEY = "focusforge-shield-enabled";

export type ShieldEventType = "held" | "cracked" | "autoPaused";

export interface ShieldEvent {
  id: number;
  type: ShieldEventType;
  awaySeconds: number;
}

interface UseDistractionShieldOptions {
  isRunning: boolean;
  /** Absences shorter than this are forgiven (quick glances, alt-tabs) */
  graceSeconds?: number;
  /** Absences longer than this auto-pause the timer at exactly this mark */
  autoPauseSeconds?: number;
  onAutoPause: (atTimestamp: number) => void;
}

/**
 * Watches for the user leaving the focus tab while the timer runs.
 *
 * "Away" = document hidden (tab switch, minimise) or window blur to another
 * window. Blur caused by clicking into an embedded iframe (the Spotify /
 * YouTube media dock) is ignored, since the page is still in front.
 */
export function useDistractionShield({
  isRunning,
  graceSeconds = 10,
  autoPauseSeconds = 300,
  onAutoPause,
}: UseDistractionShieldOptions) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [distractionCount, setDistractionCount] = useState(0);
  const [awaySeconds, setAwaySeconds] = useState(0);
  const [lastEvent, setLastEvent] = useState<ShieldEvent | null>(null);

  const awayStartRef = useRef<number | null>(null);
  const autoPausedRef = useRef(false);
  const autoPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const originalTitleRef = useRef<string | null>(null);
  const eventIdRef = useRef(0);

  // Latest values for the long-lived DOM listeners
  const isRunningRef = useRef(isRunning);
  const isEnabledRef = useRef(isEnabled);
  const onAutoPauseRef = useRef(onAutoPause);
  isRunningRef.current = isRunning;
  isEnabledRef.current = isEnabled;
  onAutoPauseRef.current = onAutoPause;

  const graceMs = graceSeconds * 1000;
  const autoPauseMs = autoPauseSeconds * 1000;

  useEffect(() => {
    try {
      if (localStorage.getItem(SHIELD_STORAGE_KEY) === "false") setIsEnabled(false);
    } catch {
      // Storage unavailable: keep the shield on
    }
  }, []);

  const restoreTitle = useCallback(() => {
    if (originalTitleRef.current !== null) {
      document.title = originalTitleRef.current;
      originalTitleRef.current = null;
    }
  }, []);

  const clearAway = useCallback(() => {
    if (autoPauseTimeoutRef.current) {
      clearTimeout(autoPauseTimeoutRef.current);
      autoPauseTimeoutRef.current = null;
    }
    awayStartRef.current = null;
    autoPausedRef.current = false;
    restoreTitle();
  }, [restoreTitle]);

  const triggerAutoPause = useCallback(() => {
    if (awayStartRef.current === null || autoPausedRef.current) return;
    autoPausedRef.current = true;
    onAutoPauseRef.current(awayStartRef.current + autoPauseMs);
    document.title = "⏸ Paused · FocusForge";
  }, [autoPauseMs]);

  const handleLeave = useCallback(() => {
    if (!isRunningRef.current || !isEnabledRef.current) return;
    if (awayStartRef.current !== null) return;

    awayStartRef.current = Date.now();
    autoPausedRef.current = false;
    originalTitleRef.current = document.title;
    document.title = "🛡️ Come back to your forge!";
    autoPauseTimeoutRef.current = setTimeout(triggerAutoPause, autoPauseMs);
  }, [autoPauseMs, triggerAutoPause]);

  const handleReturn = useCallback(() => {
    const awayStart = awayStartRef.current;
    if (awayStart === null) return;

    const elapsedMs = Date.now() - awayStart;
    // Background tabs throttle timers, so the timeout may not have fired yet
    if (elapsedMs >= autoPauseMs) triggerAutoPause();
    const wasAutoPaused = autoPausedRef.current;
    clearAway();

    let event: Omit<ShieldEvent, "id"> | null = null;
    if (wasAutoPaused) {
      const counted = Math.round(autoPauseMs / 1000);
      setDistractionCount((c) => c + 1);
      setAwaySeconds((s) => s + counted);
      event = { type: "autoPaused", awaySeconds: Math.round(elapsedMs / 1000) };
    } else if (elapsedMs >= graceMs) {
      const counted = Math.round(elapsedMs / 1000);
      setDistractionCount((c) => c + 1);
      setAwaySeconds((s) => s + counted);
      event = { type: "cracked", awaySeconds: counted };
    } else if (elapsedMs >= 3000) {
      event = { type: "held", awaySeconds: Math.round(elapsedMs / 1000) };
    }

    if (event) {
      eventIdRef.current += 1;
      setLastEvent({ id: eventIdRef.current, ...event });
    }
  }, [autoPauseMs, graceMs, triggerAutoPause, clearAway]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") handleLeave();
      else handleReturn();
    };

    const onBlur = () => {
      // Wait a tick so activeElement reflects where focus went
      setTimeout(() => {
        if (document.activeElement?.tagName === "IFRAME") return;
        handleLeave();
      }, 0);
    };

    const onFocus = () => handleReturn();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [handleLeave, handleReturn]);

  // Clean up any pending absence on unmount
  useEffect(() => clearAway, [clearAway]);

  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SHIELD_STORAGE_KEY, String(next));
      } catch {
        // Non-critical preference
      }
      if (!next) clearAway();
      return next;
    });
  }, [clearAway]);

  const reset = useCallback(() => {
    clearAway();
    setDistractionCount(0);
    setAwaySeconds(0);
    setLastEvent(null);
  }, [clearAway]);

  const dismissEvent = useCallback(() => setLastEvent(null), []);

  return {
    isEnabled,
    distractionCount,
    awaySeconds,
    lastEvent,
    toggleEnabled,
    reset,
    dismissEvent,
  };
}

/** Share of a session spent actually in the forge, 0–100 */
export function computePurity(durationSeconds: number, awaySeconds: number): number {
  if (durationSeconds <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((1 - awaySeconds / durationSeconds) * 100)));
}
