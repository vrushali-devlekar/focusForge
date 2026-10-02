"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  Target,
  Edit2,
  X,
  Maximize2,
  EyeOff,
} from "lucide-react";
import soundSynthesizer from "@/lib/soundSynthesizer";
import { AudioDock } from "@/components/dashboard/AudioDock";
import { MilestoneBanner } from "@/components/pomodoro/MilestoneBanner";

const THREE_HOURS_SECONDS = 3 * 3600; // 10,800s

function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDailyStorageKey(date: Date = new Date()): string {
  return `focus_total_${getLocalDateString(date)}`;
}

function formatThreeColumns(totalSeconds: number): { hours: string; minutes: string; seconds: string } {
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

export const PomodoroControls: React.FC = () => {
  // 1. Open-ended Free Flow Stopwatch state (Wall-Clock Based)
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // 2. Streamlined Task state
  const [taskInput, setTaskInput] = useState<string>("");
  const [lockedTask, setLockedTask] = useState<string>("");
  const [isEditingTask, setIsEditingTask] = useState<boolean>(false);

  // 3. Metrics & Milestone state
  const [todayFocusSeconds, setTodayFocusSeconds] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [showMilestoneBanner, setShowMilestoneBanner] = useState<boolean>(false);
  const [milestoneFired, setMilestoneFired] = useState<boolean>(false);

  // 4. Distraction Shield state
  const [isShieldActive, setIsShieldActive] = useState<boolean>(true);

  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to load today's accumulated daily total from localStorage
  const loadDailyTotal = useCallback(() => {
    try {
      const todayKey = getDailyStorageKey();
      const rawDaily = localStorage.getItem(todayKey);
      let total = 0;

      if (rawDaily !== null) {
        total = Number(rawDaily) || 0;
      } else {
        const legacy = localStorage.getItem("focusforge_stopwatch_v1");
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (parsed.lastSavedDate === getLocalDateString() && typeof parsed.todayFocusSeconds === "number") {
            total = parsed.todayFocusSeconds;
            localStorage.setItem(todayKey, String(total));
          }
        }
      }

      setTodayFocusSeconds(total);
      return total;
    } catch (e) {
      console.error("Failed to load daily total", e);
      return 0;
    }
  }, []);

  // Restore persisted state from localStorage
  useEffect(() => {
    try {
      const dailyTotal = loadDailyTotal();

      const savedTask = localStorage.getItem("focus_active_task");
      if (savedTask) setLockedTask(savedTask);

      const savedShield = localStorage.getItem("focus_shield_active");
      if (savedShield !== null) setIsShieldActive(savedShield === "true");

      const savedStreak = Number(localStorage.getItem("focus_streak_days") || 1);
      if (savedStreak) setStreakDays(savedStreak);

      const savedMilestone = localStorage.getItem("focus_milestone_fired_" + getLocalDateString());
      if (savedMilestone === "true") {
        setMilestoneFired(true);
      } else if (dailyTotal >= THREE_HOURS_SECONDS) {
        setShowMilestoneBanner(true);
      }

      const savedStart = localStorage.getItem("focus_active_start");
      const savedAccumulated = Number(localStorage.getItem("focus_active_accumulated") || 0);
      setAccumulatedSeconds(savedAccumulated);

      if (savedStart) {
        const startTimestamp = Number(savedStart);
        if (!isNaN(startTimestamp) && startTimestamp > 0) {
          startTimeRef.current = startTimestamp;
          const currentElapsed = savedAccumulated + Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000));
          setSecondsElapsed(currentElapsed);
          setIsRunning(true);
        }
      } else {
        startTimeRef.current = null;
        setSecondsElapsed(savedAccumulated);
        setIsRunning(false);
      }
    } catch (e) {
      console.error("Failed to restore stopwatch state", e);
    }
  }, [loadDailyTotal]);

  // Trigger 3-Hour Milestone notification & chime without stopping the timer
  const triggerMilestoneAlert = useCallback(() => {
    setMilestoneFired(true);
    setShowMilestoneBanner(true);
    localStorage.setItem("focus_milestone_fired_" + getLocalDateString(), "true");
    soundSynthesizer.playChime("milestone");

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("🎉 3-Hour Deep Work Milestone Achieved!", {
          body: "Outstanding focus! You have surpassed 3 hours (10,800s) of deep study today.",
          icon: "/icon.svg",
        });
      }
    }
  }, []);

  // Request browser desktop notification permission
  const requestNotificationPermission = useCallback(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Wall-Clock Accurate Timer Tick
  useEffect(() => {
    const updateElapsed = () => {
      if (startTimeRef.current) {
        const now = Date.now();
        const segment = Math.max(0, Math.floor((now - startTimeRef.current) / 1000));
        const currentElapsed = accumulatedSeconds + segment;
        setSecondsElapsed(currentElapsed);

        // Check 3-Hour Daily Milestone
        if (todayFocusSeconds + currentElapsed >= THREE_HOURS_SECONDS && !milestoneFired) {
          triggerMilestoneAlert();
        }
      }
    };

    if (isRunning) {
      updateElapsed();
      intervalRef.current = setInterval(updateElapsed, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, accumulatedSeconds, todayFocusSeconds, milestoneFired, triggerMilestoneAlert]);

  // Handle Tab Visibility & Focus changes
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible" || document.hasFocus()) {
        const savedStart = localStorage.getItem("focus_active_start");
        const savedAccumulated = Number(localStorage.getItem("focus_active_accumulated") || 0);
        setAccumulatedSeconds(savedAccumulated);
        loadDailyTotal();

        if (savedStart) {
          const startTimestamp = Number(savedStart);
          startTimeRef.current = startTimestamp;
          const currentElapsed = savedAccumulated + Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000));
          setSecondsElapsed(currentElapsed);
          setIsRunning(true);
        } else {
          startTimeRef.current = null;
          setSecondsElapsed(savedAccumulated);
          setIsRunning(false);
        }
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "focus_active_start" ||
        e.key === "focus_active_accumulated" ||
        e.key?.startsWith("focus_total_") ||
        e.key === "focus_active_task"
      ) {
        handleVisibilityOrFocus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadDailyTotal]);

  // Controls
  const toggleStartPause = useCallback(() => {
    const now = Date.now();

    if (!isRunning) {
      requestNotificationPermission();
      startTimeRef.current = now;
      localStorage.setItem("focus_active_start", String(now));
      localStorage.setItem("focus_active_accumulated", String(accumulatedSeconds));
      setIsRunning(true);
    } else {
      const segment = startTimeRef.current ? Math.max(0, Math.floor((now - startTimeRef.current) / 1000)) : 0;
      const totalSession = accumulatedSeconds + segment;

      startTimeRef.current = null;
      setAccumulatedSeconds(totalSession);
      setSecondsElapsed(totalSession);
      setIsRunning(false);

      localStorage.removeItem("focus_active_start");
      localStorage.setItem("focus_active_accumulated", String(totalSession));

      try {
        const payload = {
          lastSavedDate: getLocalDateString(),
          todayFocusSeconds: todayFocusSeconds,
          streakDays,
          lockedTask,
          milestoneFired,
          isShieldActive,
          secondsElapsed: totalSession,
        };
        localStorage.setItem("focusforge_stopwatch_v1", JSON.stringify(payload));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isRunning, accumulatedSeconds, todayFocusSeconds, streakDays, lockedTask, milestoneFired, isShieldActive, requestNotificationPermission]);

  const handleReset = useCallback(() => {
    startTimeRef.current = null;
    setIsRunning(false);
    setAccumulatedSeconds(0);
    setSecondsElapsed(0);

    localStorage.removeItem("focus_active_start");
    localStorage.removeItem("focus_active_accumulated");

    try {
      const payload = {
        lastSavedDate: getLocalDateString(),
        todayFocusSeconds: todayFocusSeconds,
        streakDays,
        lockedTask,
        milestoneFired,
        isShieldActive,
        secondsElapsed: 0,
      };
      localStorage.setItem("focusforge_stopwatch_v1", JSON.stringify(payload));
    } catch (e) {
      console.error(e);
    }
  }, [todayFocusSeconds, streakDays, lockedTask, milestoneFired, isShieldActive]);

  const handleCompleteAndLog = useCallback(() => {
    const now = Date.now();
    const segment = isRunning && startTimeRef.current ? Math.max(0, Math.floor((now - startTimeRef.current) / 1000)) : 0;
    const finalSessionDuration = accumulatedSeconds + segment;

    if (finalSessionDuration <= 0) return;

    const todayKey = getDailyStorageKey();
    const currentToday = Number(localStorage.getItem(todayKey) || todayFocusSeconds || 0);
    const updatedToday = currentToday + finalSessionDuration;

    localStorage.setItem(todayKey, String(updatedToday));
    setTodayFocusSeconds(updatedToday);
    soundSynthesizer.playChime("complete");

    const isNowMilestone = updatedToday >= THREE_HOURS_SECONDS;
    if (isNowMilestone && !milestoneFired) {
      triggerMilestoneAlert();
    }

    startTimeRef.current = null;
    setAccumulatedSeconds(0);
    setSecondsElapsed(0);
    setIsRunning(false);
    localStorage.removeItem("focus_active_start");
    localStorage.removeItem("focus_active_accumulated");

    const newStreak = Math.max(streakDays, 1);
    setStreakDays(newStreak);
    localStorage.setItem("focus_streak_days", String(newStreak));

    try {
      const payload = {
        lastSavedDate: getLocalDateString(),
        todayFocusSeconds: updatedToday,
        streakDays: newStreak,
        lockedTask,
        milestoneFired: isNowMilestone || milestoneFired,
        isShieldActive,
        secondsElapsed: 0,
      };
      localStorage.setItem("focusforge_stopwatch_v1", JSON.stringify(payload));
    } catch (e) {
      console.error(e);
    }
  }, [isRunning, accumulatedSeconds, todayFocusSeconds, streakDays, lockedTask, milestoneFired, isShieldActive, triggerMilestoneAlert]);

  const handleToggleShield = () => {
    const nextVal = !isShieldActive;
    setIsShieldActive(nextVal);
    localStorage.setItem("focus_shield_active", String(nextVal));
  };

  const handleToggleZen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Lock-in Task handler
  const handleLockTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    const task = taskInput.trim();
    setLockedTask(task);
    setTaskInput("");
    setIsEditingTask(false);
    localStorage.setItem("focus_active_task", task);
  };

  const handleClearTask = () => {
    setLockedTask("");
    setIsEditingTask(false);
    localStorage.removeItem("focus_active_task");
  };

  // Keyboard shortcut: Spacebar to Start/Pause
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
        toggleStartPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleStartPause]);

  const { hours, minutes, seconds } = formatThreeColumns(secondsElapsed);
  const totalCombinedSeconds = todayFocusSeconds + (isRunning ? secondsElapsed : 0);
  const todayHoursFormatted = (totalCombinedSeconds / 3600).toFixed(1);
  const milestonePercent = Math.min(Math.round((totalCombinedSeconds / THREE_HOURS_SECONDS) * 100), 100);

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">
      {/* 1. Streamlined Single Task Input */}
      <div className="w-full">
        {!lockedTask || isEditingTask ? (
          <form onSubmit={handleLockTask} className="w-full">
            <input
              type="text"
              placeholder="What is your main focus for this session? (Press Enter to lock in)"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition text-center shadow-sm"
              autoFocus={isEditingTask}
            />
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-200">
            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#42e425] flex-shrink-0 shadow-[0_0_6px_#42e425]" />
              <span className="truncate font-medium">{lockedTask}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setTaskInput(lockedTask);
                  setIsEditingTask(true);
                }}
                className="p-1 text-zinc-500 hover:text-zinc-200 rounded transition"
                title="Edit Task"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleClearTask}
                className="p-1 text-zinc-500 hover:text-zinc-200 rounded transition"
                title="Clear Task"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Free Flow Stopwatch Card */}
      <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center space-y-6 shadow-sm relative">
        {/* Header Row: Status Pill & Zen Button */}
        <div className="w-full flex items-center justify-between gap-3">
          {/* Top Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[11px] font-mono">
            {isRunning ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#42e425] animate-pulse shadow-[0_0_8px_#42e425]" />
                <span className="font-semibold text-[#42e425] tracking-wider">DEEP FOCUS ACTIVE</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <span className="text-zinc-400 tracking-wider font-medium">
                  {secondsElapsed > 0 ? "SESSION PAUSED" : "FREE FLOW STOPWATCH"}
                </span>
              </>
            )}
          </div>

          {/* Zen Button */}
          <button
            type="button"
            onClick={handleToggleZen}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono transition"
            title="Toggle Fullscreen Zen Focus"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Zen</span>
          </button>
        </div>

        {/* 3. Three-Column Count-Up Readout Display with Righteous Google Font */}
        <div className="w-full flex items-center justify-center gap-3 sm:gap-5 my-2 select-none">
          {/* HOURS Column */}
          <div className="flex flex-col items-center">
            <div className="font-righteous text-6xl sm:text-7xl md:text-8xl text-white tracking-tight tabular-nums drop-shadow-sm">
              {hours}
            </div>
            <span className="text-[10px] sm:text-xs font-mono tracking-widest text-zinc-500 uppercase mt-2 font-medium">
              HOURS
            </span>
          </div>

          {/* Vertical pair of circular separator dots */}
          <div className="flex flex-col items-center justify-center gap-2 pb-5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-700/80" />
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-700/80" />
          </div>

          {/* MINUTES Column */}
          <div className="flex flex-col items-center">
            <div className="font-righteous text-6xl sm:text-7xl md:text-8xl text-white tracking-tight tabular-nums drop-shadow-sm">
              {minutes}
            </div>
            <span className="text-[10px] sm:text-xs font-mono tracking-widest text-zinc-500 uppercase mt-2 font-medium">
              MINUTES
            </span>
          </div>

          {/* Vertical pair of circular separator dots */}
          <div className="flex flex-col items-center justify-center gap-2 pb-5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-700/80" />
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-700/80" />
          </div>

          {/* SECONDS Column (Dynamic Neon Green on running) */}
          <div className="flex flex-col items-center">
            <div
              className={`font-righteous text-6xl sm:text-7xl md:text-8xl tracking-tight tabular-nums transition-colors duration-200 ${
                isRunning
                  ? "text-[#42e425] drop-shadow-[0_0_20px_rgba(66,228,37,0.35)]"
                  : "text-white"
              }`}
            >
              {seconds}
            </div>
            <span className="text-[10px] sm:text-xs font-mono tracking-widest text-zinc-500 uppercase mt-2 font-medium">
              SECONDS
            </span>
          </div>
        </div>

        {/* 4. Action Bar (Pill Container with Neon Green Button & Text Link) */}
        <div className="w-full rounded-full bg-zinc-950 border border-zinc-800/90 p-1.5 flex items-center justify-between gap-3 shadow-inner">
          {/* Primary Action Button */}
          <button
            type="button"
            onClick={toggleStartPause}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-7 py-2.5 rounded-full bg-[#42e425] hover:bg-[#38cb1e] active:scale-[0.98] text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(66,228,37,0.25)]"
            title="Start / Pause (Spacebar)"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Get Started</span>
              </>
            )}
          </button>

          {/* Text Links & Action Controls */}
          <div className="flex items-center gap-3 pr-3 text-xs font-mono">
            <button
              type="button"
              onClick={handleCompleteAndLog}
              disabled={secondsElapsed === 0}
              className={`font-medium flex items-center gap-1 transition ${
                secondsElapsed > 0
                  ? "text-zinc-300 hover:text-white hover:underline cursor-pointer"
                  : "text-zinc-600 cursor-not-allowed"
              }`}
              title="Complete and log session"
            >
              <span>Complete &amp; Log</span>
              <span className={secondsElapsed > 0 ? "text-[#42e425]" : "text-zinc-600"}>&rarr;</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-zinc-500 hover:text-zinc-300 transition"
              title="Reset Timer back to 00:00:00"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Hotkey hint */}
        <div className="text-[10px] font-mono text-zinc-500 text-center">
          Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold">Space</kbd> to Start / Pause
        </div>
      </div>

      {/* 5. Bottom Card: Distraction Shield Row */}
      <div className="w-full bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-300 flex-shrink-0">
            <EyeOff className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-200">
                Distraction Shield
              </span>
              <span
                className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold border ${
                  isShieldActive
                    ? "bg-[#42e425]/10 text-[#42e425] border-[#42e425]/30"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {isShieldActive ? "SHIELD ON" : "SHIELD OFF"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Mutes desktop alerts and blocks distractions during active focus blocks
            </p>
          </div>
        </div>

        {/* Interactive Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isShieldActive}
          onClick={handleToggleShield}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isShieldActive ? "bg-[#42e425]" : "bg-zinc-800"
          }`}
          title="Toggle Distraction Shield"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
              isShieldActive ? "translate-x-5 bg-zinc-950" : "translate-x-0 bg-zinc-400"
            }`}
          />
        </button>
      </div>

      {/* 6. Sleek Inline Stats Bar */}
      <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-xl px-4 py-3 flex items-center justify-between text-xs font-mono text-zinc-400 shadow-sm">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-zinc-400" />
          <span>
            Today: <strong className="text-zinc-100">{todayHoursFormatted} hrs</strong> / 3h goal
          </span>
          <span className="text-[10px] text-zinc-500">({milestonePercent}%)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-zinc-400" />
          <span>
            Streak: <strong className="text-zinc-100">{streakDays}</strong> {streakDays === 1 ? "day" : "days"}
          </span>
        </div>
      </div>

      {/* Focus Soundscapes Dock */}
      <AudioDock isTimerRunning={isRunning} />

      {/* 3-Hour Milestone Celebration Alert */}
      <MilestoneBanner
        isOpen={showMilestoneBanner}
        onDismiss={() => setShowMilestoneBanner(false)}
      />
    </div>
  );
};

export default PomodoroControls;
