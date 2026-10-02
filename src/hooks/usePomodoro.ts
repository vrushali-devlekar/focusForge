"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import soundSynthesizer from "@/lib/soundSynthesizer";

export type PomodoroPhase = "focus" | "short-break" | "long-break";

export interface PomodoroState {
  phase: PomodoroPhase;
  isRunning: boolean;
  secondsRemaining: number;
  currentRound: number; // 1 to 4
  totalRoundsCompleted: number;
  focusDurationMinutes: number; // 25 or 50
  shortBreakMinutes: number; // default 5
  longBreakMinutes: number; // default 15
  dailyAccumulatedSeconds: number; // cumulative focus logged today
  milestoneTriggered: boolean;
  showMilestoneBanner: boolean;
}

const STORAGE_KEY_POMODORO = "focusforge_pomodoro_engine_v1";
const THREE_HOURS_SECONDS = 3 * 3600; // 10,800 seconds

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

// Request desktop notification permissions
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch {
      return false;
    }
  }
  return false;
}

// Send native desktop notification
export function sendDesktopNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    } catch (e) {
      console.warn("Could not fire desktop notification", e);
    }
  }
}

export function usePomodoro() {
  const [phase, setPhase] = useState<PomodoroPhase>("focus");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [focusDurationMinutes, setFocusDurationMinutes] = useState<number>(25);
  const [shortBreakMinutes] = useState<number>(5);
  const [longBreakMinutes] = useState<number>(15);

  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [currentRound, setCurrentRound] = useState<number>(1); // 1, 2, 3, 4
  const [totalRoundsCompleted, setTotalRoundsCompleted] = useState<number>(0);

  const [dailyAccumulatedSeconds, setDailyAccumulatedSeconds] = useState<number>(0);
  const [milestoneTriggered, setMilestoneTriggered] = useState<boolean>(false);
  const [showMilestoneBanner, setShowMilestoneBanner] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Restore state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POMODORO);
      const today = getTodayDateString();

      if (saved) {
        const parsed = JSON.parse(saved);
        const lastSavedDate = parsed.lastSavedDate || today;

        if (lastSavedDate === today) {
          setDailyAccumulatedSeconds(parsed.dailyAccumulatedSeconds || 0);
          setMilestoneTriggered(parsed.milestoneTriggered || false);
          if (parsed.dailyAccumulatedSeconds >= THREE_HOURS_SECONDS && !parsed.milestoneTriggered) {
            setShowMilestoneBanner(true);
          }
        } else {
          // Reset daily metrics for a fresh day
          setDailyAccumulatedSeconds(0);
          setMilestoneTriggered(false);
        }

        if (parsed.focusDurationMinutes === 50 || parsed.focusDurationMinutes === 25) {
          setFocusDurationMinutes(parsed.focusDurationMinutes);
          if (parsed.phase === "focus") {
            setSecondsRemaining(parsed.focusDurationMinutes * 60);
          }
        }
        if (typeof parsed.currentRound === "number") {
          setCurrentRound(Math.min(4, Math.max(1, parsed.currentRound)));
        }
        if (typeof parsed.totalRoundsCompleted === "number") {
          setTotalRoundsCompleted(parsed.totalRoundsCompleted);
        }
      }
    } catch (e) {
      console.error("Failed to load Pomodoro state from localStorage", e);
    }
  }, []);

  // 2. Persist state to localStorage
  const persistState = useCallback(
    (
      accumulated: number,
      milestoneFired: boolean,
      dur: number,
      round: number,
      totalCompleted: number
    ) => {
      try {
        const payload = {
          lastSavedDate: getTodayDateString(),
          dailyAccumulatedSeconds: accumulated,
          milestoneTriggered: milestoneFired,
          focusDurationMinutes: dur,
          currentRound: round,
          totalRoundsCompleted: totalCompleted,
        };
        localStorage.setItem(STORAGE_KEY_POMODORO, JSON.stringify(payload));
      } catch (e) {
        console.error("Failed to save Pomodoro state", e);
      }
    },
    []
  );

  // Handle 3-Hour Milestone Threshold
  const checkAndFireMilestone = useCallback(
    (accumulated: number) => {
      if (accumulated >= THREE_HOURS_SECONDS && !milestoneTriggered) {
        setMilestoneTriggered(true);
        setShowMilestoneBanner(true);
        soundSynthesizer.playChime("milestone");

        sendDesktopNotification(
          "Session Milestone Reached: 3 Hours of Deep Work!",
          {
            body: "You have completed 3 hours of deep work today. Step back, stretch, and recharge!",
            requireInteraction: true,
          }
        );

        persistState(accumulated, true, focusDurationMinutes, currentRound, totalRoundsCompleted);
      }
    },
    [milestoneTriggered, focusDurationMinutes, currentRound, totalRoundsCompleted, persistState]
  );

  // Phase transition logic
  const handlePhaseComplete = useCallback(() => {
    if (phase === "focus") {
      const addedFocusSec = focusDurationMinutes * 60;
      const newAccumulated = dailyAccumulatedSeconds + addedFocusSec;
      const newTotalCompleted = totalRoundsCompleted + 1;

      setDailyAccumulatedSeconds(newAccumulated);
      setTotalRoundsCompleted(newTotalCompleted);

      // Check milestone
      checkAndFireMilestone(newAccumulated);

      soundSynthesizer.playChime("phase-switch");

      if (currentRound >= 4) {
        // Switch to Long Break
        setPhase("long-break");
        setSecondsRemaining(longBreakMinutes * 60);
        setCurrentRound(1); // reset round cycle

        sendDesktopNotification("Focus Cycle Complete!", {
          body: "4 focus rounds completed. Enjoy a well-deserved 15-minute Long Break.",
        });

        persistState(newAccumulated, milestoneTriggered, focusDurationMinutes, 1, newTotalCompleted);
      } else {
        // Switch to Short Break
        const nextRound = currentRound + 1;
        setPhase("short-break");
        setSecondsRemaining(shortBreakMinutes * 60);
        setCurrentRound(nextRound);

        sendDesktopNotification("Focus Block Complete!", {
          body: `Round ${currentRound} of 4 finished. Time for a 5-minute short break.`,
        });

        persistState(newAccumulated, milestoneTriggered, focusDurationMinutes, nextRound, newTotalCompleted);
      }
    } else {
      // Break (Short or Long) finished -> Switch back to Focus
      soundSynthesizer.playChime("phase-switch");
      setPhase("focus");
      setSecondsRemaining(focusDurationMinutes * 60);

      sendDesktopNotification("Break Ended!", {
        body: "Ready to lock in for the next deep work sprint.",
      });

      persistState(dailyAccumulatedSeconds, milestoneTriggered, focusDurationMinutes, currentRound, totalRoundsCompleted);
    }
  }, [
    phase,
    focusDurationMinutes,
    dailyAccumulatedSeconds,
    totalRoundsCompleted,
    currentRound,
    longBreakMinutes,
    shortBreakMinutes,
    milestoneTriggered,
    checkAndFireMilestone,
    persistState,
  ]);

  // Interval timer engine
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, handlePhaseComplete]);

  // Controls
  const start = useCallback(async () => {
    await requestNotificationPermission();
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const toggle = useCallback(async () => {
    if (!isRunning) {
      await requestNotificationPermission();
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, [isRunning]);

  const resetCurrentPhase = useCallback(() => {
    setIsRunning(false);
    if (phase === "focus") {
      setSecondsRemaining(focusDurationMinutes * 60);
    } else if (phase === "short-break") {
      setSecondsRemaining(shortBreakMinutes * 60);
    } else {
      setSecondsRemaining(longBreakMinutes * 60);
    }
  }, [phase, focusDurationMinutes, shortBreakMinutes, longBreakMinutes]);

  const skipPhase = useCallback(() => {
    handlePhaseComplete();
  }, [handlePhaseComplete]);

  const setDurationMode = useCallback(
    (minutes: 25 | 50) => {
      setFocusDurationMinutes(minutes);
      if (phase === "focus" && !isRunning) {
        setSecondsRemaining(minutes * 60);
      }
      persistState(dailyAccumulatedSeconds, milestoneTriggered, minutes, currentRound, totalRoundsCompleted);
    },
    [phase, isRunning, dailyAccumulatedSeconds, milestoneTriggered, currentRound, totalRoundsCompleted, persistState]
  );

  const selectPhase = useCallback(
    (newPhase: PomodoroPhase) => {
      setIsRunning(false);
      setPhase(newPhase);
      if (newPhase === "focus") {
        setSecondsRemaining(focusDurationMinutes * 60);
      } else if (newPhase === "short-break") {
        setSecondsRemaining(shortBreakMinutes * 60);
      } else {
        setSecondsRemaining(longBreakMinutes * 60);
      }
    },
    [focusDurationMinutes, shortBreakMinutes, longBreakMinutes]
  );

  const dismissMilestoneBanner = useCallback(() => {
    setShowMilestoneBanner(false);
  }, []);

  // Keyboard shortcut: Spacebar for start/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  // Formatted countdown MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedMinutes = String(mins).padStart(2, "0");
  const formattedSeconds = String(secs).padStart(2, "0");

  const milestoneProgressPercent = Math.min(
    Math.round((dailyAccumulatedSeconds / THREE_HOURS_SECONDS) * 100),
    100
  );

  return {
    phase,
    isRunning,
    secondsRemaining,
    formattedMinutes,
    formattedSeconds,
    currentRound,
    totalRoundsCompleted,
    focusDurationMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    dailyAccumulatedSeconds,
    milestoneProgressPercent,
    milestoneTriggered,
    showMilestoneBanner,

    start,
    pause,
    toggle,
    resetCurrentPhase,
    skipPhase,
    setDurationMode,
    selectPhase,
    dismissMilestoneBanner,
  };
}

export default usePomodoro;
