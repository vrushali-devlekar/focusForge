"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { subDays, format, isSameDay } from "date-fns";
import { Sparkles, Check } from "lucide-react";
import { formatDurationSummary } from "@/lib/utils";

export interface FocusConstellationProps {
  todayLiveSeconds?: number;
  todayPropSeconds?: number;
  dailyGoalSeconds?: number;
  className?: string;
}

export const FocusConstellation: React.FC<FocusConstellationProps> = ({
  todayLiveSeconds = 0,
  todayPropSeconds,
  dailyGoalSeconds = 3 * 3600, // 3-Hour daily threshold (10,800s)
  className = "",
}) => {
  const [persistedHistory, setPersistedHistory] = useState<Record<string, number>>({});
  const [localTodaySeconds, setLocalTodaySeconds] = useState<number>(0);

  // Restore history from localStorage
  const loadHistory = useCallback(() => {
    try {
      const historyMap: Record<string, number> = {};
      const todayStr = format(new Date(), "yyyy-MM-dd");

      // 1. Read all focus_total_YYYY-MM-DD keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("focus_total_")) {
          const datePart = key.replace("focus_total_", "");
          const val = Number(localStorage.getItem(key)) || 0;
          if (val > 0) {
            historyMap[datePart] = Math.max(historyMap[datePart] || 0, val);
          }
        }
      }

      // 2. Stopwatch storage fallback
      const stopwatchRaw = localStorage.getItem("focusforge_stopwatch_v1");
      if (stopwatchRaw) {
        const parsed = JSON.parse(stopwatchRaw);
        if (parsed.lastSavedDate && typeof parsed.todayFocusSeconds === "number") {
          historyMap[parsed.lastSavedDate] = Math.max(historyMap[parsed.lastSavedDate] || 0, parsed.todayFocusSeconds);
        }
      }

      // 3. Pomodoro minimal storage fallback
      const pomodoroRaw = localStorage.getItem("focusforge_pomodoro_minimal_v2");
      if (pomodoroRaw) {
        const parsed = JSON.parse(pomodoroRaw);
        if (parsed.lastSavedDate && typeof parsed.todayFocusSeconds === "number") {
          historyMap[parsed.lastSavedDate] = Math.max(historyMap[parsed.lastSavedDate] || 0, parsed.todayFocusSeconds);
        }
      }

      // 4. Timer V3 storage fallback
      const timerV3Raw = localStorage.getItem("focusforge_timer_minimal_v3");
      if (timerV3Raw) {
        const parsed = JSON.parse(timerV3Raw);
        if (parsed.lastSavedDate && typeof parsed.todayFocusSeconds === "number") {
          historyMap[parsed.lastSavedDate] = Math.max(historyMap[parsed.lastSavedDate] || 0, parsed.todayFocusSeconds);
        }
      }

      // 5. Timer V2 sessionHistory fallback
      const timerV2Raw = localStorage.getItem("focusforge_timer_data_v2");
      if (timerV2Raw) {
        const parsed = JSON.parse(timerV2Raw);
        if (Array.isArray(parsed.sessionHistory)) {
          parsed.sessionHistory.forEach((s: { date: string; duration: number }) => {
            if (s.date && typeof s.duration === "number") {
              historyMap[s.date] = (historyMap[s.date] || 0) + s.duration;
            }
          });
        }
      }

      // 6. Student Hub storage fallback
      const studentRaw = localStorage.getItem("focusforge_student_hub_v1");
      if (studentRaw) {
        const parsed = JSON.parse(studentRaw);
        if (Array.isArray(parsed.sessions)) {
          parsed.sessions.forEach((s: { date: string; studyDurationSeconds: number }) => {
            if (s.date && typeof s.studyDurationSeconds === "number") {
              historyMap[s.date] = (historyMap[s.date] || 0) + s.studyDurationSeconds;
            }
          });
        }
      }

      const todayVal = historyMap[todayStr] || 0;
      setLocalTodaySeconds(todayVal);
      setPersistedHistory(historyMap);
    } catch (e) {
      console.error("Failed to load constellation data", e);
    }
  }, []);

  useEffect(() => {
    loadHistory();

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("focus_total_") || e.key === "focusforge_stopwatch_v1") {
        loadHistory();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadHistory]);

  // Generate the past 30 days in chronological sequence (10 cols x 3 rows)
  const days = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => subDays(new Date(), 29 - i));
  }, []);

  return (
    <div
      className={`w-full bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4 ${className}`}
    >
      {/* 1. Header with title & legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
              30-Day Focus Constellation
            </h3>
          </div>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Liquid progression toward your daily targets
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 text-[10px] font-mono text-zinc-500 self-start sm:self-auto">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-950 border border-zinc-800" />
            0%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-700/80 border border-zinc-600" />
            50%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-100" />
            100% Met
          </span>
        </div>
      </div>

      {/* 2. 3-Row Grid of 30 Liquid Day Tiles */}
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 sm:gap-2.5 pt-1">
        {days.map((date, idx) => {
          const isToday = isSameDay(date, new Date());
          const dateKey = format(date, "yyyy-MM-dd");

          let totalSeconds = persistedHistory[dateKey] || 0;
          if (isToday) {
            if (typeof todayPropSeconds === "number") {
              totalSeconds = Math.max(totalSeconds, todayPropSeconds);
            } else {
              totalSeconds = Math.max(totalSeconds, localTodaySeconds) + todayLiveSeconds;
            }
          }

          const fillPercent = Math.min(
            Math.round((totalSeconds / dailyGoalSeconds) * 100),
            100
          );
          const isGoalMet = fillPercent >= 100;
          const minutes = Math.floor(totalSeconds / 60);

          return (
            <div
              key={idx}
              className="flex flex-col items-center group relative cursor-pointer"
            >
              {/* Tooltip on Hover */}
              <div className="absolute -top-11 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-40 pointer-events-none transition-all">
                <div className="bg-zinc-950 border border-zinc-700 text-zinc-200 text-[10px] py-1 px-2.5 rounded-lg shadow-2xl whitespace-nowrap font-mono flex items-center gap-1.5">
                  <span className="text-zinc-400">{format(date, "MMM d")}:</span>
                  <span className="font-semibold text-zinc-100">
                    {formatDurationSummary(minutes)}
                  </span>
                  <span className="text-zinc-500">({fillPercent}% goal)</span>
                </div>
                <div className="w-1.5 h-1.5 bg-zinc-950 border-r border-b border-zinc-700 rotate-45 -mt-1" />
              </div>

              {/* Liquid Wave Day Tile Container */}
              <div
                className={`w-full aspect-square max-w-[52px] rounded-xl relative overflow-hidden flex flex-col items-center justify-center transition-all duration-300 group-hover:border-zinc-600 bg-zinc-950/80 border ${
                  isToday
                    ? "ring-1 ring-zinc-300 border-zinc-400 shadow-sm"
                    : isGoalMet
                    ? "border-zinc-400/90 shadow-[0_0_12px_rgba(255,255,255,0.08)]"
                    : "border-zinc-800/80"
                }`}
              >
                {/* 1. Fluid Liquid Fill Level (z-0) */}
                <div
                  className="absolute bottom-0 left-0 right-0 z-0 overflow-hidden transition-[height] duration-700 ease-out pointer-events-none"
                  style={{
                    height: `${fillPercent}%`,
                    backgroundColor: isGoalMet
                      ? "#f4f4f5" // Stark off-white for 100% goal met
                      : fillPercent >= 50
                      ? "rgba(82, 82, 91, 0.75)" // zinc-600 translucent
                      : fillPercent > 0
                      ? "rgba(39, 39, 42, 0.9)" // zinc-800
                      : "transparent",
                  }}
                >
                  {/* Oscillating Sine Wave Crest Line (When fill is in progress < 100%) */}
                  {fillPercent > 0 && fillPercent < 100 && (
                    <div className="absolute -top-1.5 left-0 w-[200%] h-2.5 pointer-events-none liquid-wave-crest opacity-80">
                      <svg
                        viewBox="0 0 500 150"
                        preserveAspectRatio="none"
                        className="w-full h-full"
                      >
                        <path
                          d="M0.00,49.98 C150.00,150.00 349.81,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                          className="fill-zinc-600/90"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* 2. Centered Day Number & Checkmark (z-10) */}
                <span
                  className={`text-xs font-mono font-medium relative z-10 select-none transition-colors duration-200 ${
                    isGoalMet
                      ? "text-zinc-950 font-bold"
                      : fillPercent >= 50
                      ? "text-zinc-100 font-semibold"
                      : "text-zinc-400"
                  }`}
                >
                  {format(date, "d")}
                </span>

                {isGoalMet && (
                  <Check className="w-2.5 h-2.5 text-zinc-950 font-bold relative z-10 -mt-0.5" />
                )}
              </div>

              {/* Day of Week Initial */}
              <span className="text-[9px] font-mono text-zinc-500 mt-1 uppercase select-none">
                {format(date, "EEEEE")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FocusConstellation;
