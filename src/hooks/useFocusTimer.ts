"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface CompletedSession {
  id: string;
  duration: number; // in seconds
  timestamp: string; // ISO string
  formattedTime: string;
  date: string; // YYYY-MM-DD
}

export interface FocusTimerState {
  secondsElapsed: number;
  status: "idle" | "running" | "paused";
  isRunning: boolean;
  isPaused: boolean;
  todayTotalSeconds: number;
  dailyGoalMinutes: number;
  streakDays: number;
  sessionHistory: CompletedSession[];
}

const STORAGE_KEY = "focusforge_timer_data_v2";

export function formatTimeDigits(totalSec: number): {
  hours: string;
  minutes: string;
  seconds: string;
  formatted: string;
} {
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const hours = String(hrs).padStart(2, "0");
  const minutes = String(mins).padStart(2, "0");
  const seconds = String(secs).padStart(2, "0");

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours} : ${minutes} : ${seconds}`,
  };
}

export function formatDurationLabel(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;

  if (hrs > 0) {
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
  }
  return `${mins}m`;
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function useFocusTimer() {
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "running" | "paused">("idle");
  const [todayTotalSeconds, setTodayTotalSeconds] = useState<number>(0);
  const [dailyGoalMinutes, setDailyGoalMinutesState] = useState<number>(240); // default 4h
  const [streakDays, setStreakDays] = useState<number>(0);
  const [sessionHistory, setSessionHistory] = useState<CompletedSession[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Restore persisted data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const today = getTodayDateString();

      if (saved) {
        const parsed = JSON.parse(saved);
        const lastSavedDate = parsed.lastSavedDate || today;

        // If today is a new date, reset todayTotalSeconds unless saved date is today
        if (lastSavedDate === today) {
          setTodayTotalSeconds(parsed.todayTotalSeconds || 0);
        } else {
          // Check streak continuity for day transitions
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          if (lastSavedDate === yesterdayStr && (parsed.todayTotalSeconds || 0) > 0) {
            setStreakDays(parsed.streakDays || 1);
          } else if (lastSavedDate !== today) {
            // Gap day -> keep current streak if already saved or recalculate from history
          }
          setTodayTotalSeconds(0);
        }

        if (parsed.dailyGoalMinutes) {
          setDailyGoalMinutesState(parsed.dailyGoalMinutes);
        }
        if (typeof parsed.streakDays === "number") {
          setStreakDays(parsed.streakDays);
        }
        if (Array.isArray(parsed.sessionHistory)) {
          setSessionHistory(parsed.sessionHistory);
          // Calculate streak from history if needed
          computeStreakFromHistory(parsed.sessionHistory);
        }
      } else {
        // Fallback: Check if there's legacy session data
        const legacyToday = localStorage.getItem("focusforge_today_seconds");
        if (legacyToday) {
          setTodayTotalSeconds(parseInt(legacyToday, 10) || 0);
        }
      }
    } catch (err) {
      console.error("Error reading localStorage timer data:", err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const computeStreakFromHistory = (history: CompletedSession[]) => {
    if (!history || history.length === 0) return;
    const uniqueDates = Array.from(new Set(history.map((h) => h.date))).sort().reverse();
    const today = getTodayDateString();
    
    let streak = 0;
    let checkDate = new Date();
    
    // If today has sessions, start counting from today, else from yesterday
    const hasToday = uniqueDates.includes(today);
    if (!hasToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    setStreakDays(Math.max(streak, hasToday ? 1 : 0));
  };

  // 2. Persist state to localStorage whenever key values change
  const persistData = useCallback(
    (
      newTodayTotal: number,
      newHistory: CompletedSession[],
      newGoal: number,
      newStreak: number
    ) => {
      try {
        const payload = {
          lastSavedDate: getTodayDateString(),
          todayTotalSeconds: newTodayTotal,
          dailyGoalMinutes: newGoal,
          streakDays: newStreak,
          sessionHistory: newHistory,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.error("Error saving timer data to localStorage:", err);
      }
    },
    []
  );

  // 3. Timer interval effect
  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
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
  }, [status]);

  // Controls
  const start = useCallback(() => {
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    setStatus("paused");
  }, []);

  const toggle = useCallback(() => {
    setStatus((prev) => (prev === "running" ? "paused" : "running"));
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setSecondsElapsed(0);
  }, []);

  const completeAndLog = useCallback(async () => {
    if (secondsElapsed <= 0) return null;

    const loggedDuration = secondsElapsed;
    const now = new Date();
    const today = getTodayDateString();

    const newSession: CompletedSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      duration: loggedDuration,
      timestamp: now.toISOString(),
      formattedTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: today,
    };

    const updatedTotal = todayTotalSeconds + loggedDuration;
    const updatedHistory = [newSession, ...sessionHistory].slice(0, 50); // keep up to 50

    // Compute updated streak
    const uniqueDates = Array.from(new Set(updatedHistory.map((h) => h.date)));
    const newStreak = Math.max(streakDays, 1, uniqueDates.length > 0 ? streakDays || 1 : 1);

    setTodayTotalSeconds(updatedTotal);
    setSessionHistory(updatedHistory);
    setStreakDays(newStreak);
    setStatus("idle");
    setSecondsElapsed(0);

    persistData(updatedTotal, updatedHistory, dailyGoalMinutes, newStreak);

    // Also attempt background sync to API route if online & logged in
    try {
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: loggedDuration,
          startedAt: new Date(Date.now() - loggedDuration * 1000).toISOString(),
          endedAt: now.toISOString(),
        }),
      }).catch(() => {
        // Silently handle if offline or not logged into NextAuth
      });
    } catch {
      // Ignore background fetch error
    }

    return newSession;
  }, [secondsElapsed, todayTotalSeconds, sessionHistory, streakDays, dailyGoalMinutes, persistData]);

  const setDailyGoalMinutes = useCallback(
    (minutes: number) => {
      const sanitized = Math.max(15, Math.min(1440, minutes));
      setDailyGoalMinutesState(sanitized);
      persistData(todayTotalSeconds, sessionHistory, sanitized, streakDays);
    },
    [todayTotalSeconds, sessionHistory, streakDays, persistData]
  );

  const clearHistory = useCallback(() => {
    setSessionHistory([]);
    setTodayTotalSeconds(0);
    setStreakDays(0);
    persistData(0, [], dailyGoalMinutes, 0);
  }, [dailyGoalMinutes, persistData]);

  // 4. Keyboard Shortcuts: Spacebar (Start/Pause), R (Reset), Enter (Complete & Log)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing into an input, textarea, select or modal
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
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        reset();
      } else if (e.code === "Enter") {
        if (secondsElapsed > 0) {
          e.preventDefault();
          completeAndLog();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle, reset, completeAndLog, secondsElapsed]);

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const formattedTime = formatTimeDigits(secondsElapsed);

  return {
    // Timer State
    secondsElapsed,
    status,
    isRunning,
    isPaused,
    formattedTime,
    isInitialized,

    // Aggregates & Metrics
    todayTotalSeconds,
    todayMinutes: Math.floor(todayTotalSeconds / 60),
    dailyGoalMinutes,
    streakDays,
    sessionHistory,
    recentSessions: sessionHistory.slice(0, 5),

    // Controls
    start,
    pause,
    toggle,
    reset,
    completeAndLog,
    setDailyGoalMinutes,
    clearHistory,
  };
}

export default useFocusTimer;
