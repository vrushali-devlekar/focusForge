"use client";

import React from "react";
import { subDays, format, isSameDay } from "date-fns";
import { DailyStatItem } from "@/types";
import { formatDurationSummary } from "@/lib/utils";
import { toDayKey, dayKeyOfStoredDate } from "@/lib/day";
import { Flame, Sparkles } from "lucide-react";

interface ConstellationGridProps {
  history: DailyStatItem[];
  todayLiveSeconds?: number;
  dailyTargetSeconds?: number;
}

export const ConstellationGrid: React.FC<ConstellationGridProps> = ({
  history,
  todayLiveSeconds = 0,
  dailyTargetSeconds = 7200,
}) => {
  const days = Array.from({ length: 30 }).map((_, i) => subDays(new Date(), 29 - i));

  // Stored dates are UTC-midnight calendar days; compare by day key, not local time
  const getDayData = (date: Date) => {
    const key = toDayKey(date);
    return history.find((stat) => dayKeyOfStoredDate(stat.date) === key);
  };

  return (
    <div
      className="theme-card w-full p-5 sm:p-6 transition-all duration-300"
    >
      {/* Header */}
      <div
        style={{ borderColor: "var(--border-subtle)" }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b"
      >
        <div>
          <div className="flex items-center gap-2">
            <Sparkles
              style={{ color: "var(--accent-color, var(--accent-primary))" }}
              className="w-4 h-4"
            />
            <h3
              style={{ color: "var(--text-primary)" }}
              className="text-sm font-bold tracking-tight font-display"
            >
              30-Day Focus Constellation
            </h3>
          </div>
          <p
            style={{ color: "var(--text-secondary)" }}
            className="text-[11px] font-sans mt-0.5"
          >
            Liquid progression toward your daily targets
          </p>
        </div>

        {/* Legend */}
        <div
          style={{ color: "var(--text-secondary)" }}
          className="flex items-center gap-2 text-[10px] font-medium font-mono"
        >
          <span className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-sm bg-white/10"
            />
            0%
          </span>
          <span className="flex items-center gap-1">
            <span
              style={{ backgroundColor: "var(--accent-color, var(--accent-primary))", opacity: 0.5 }}
              className="w-2.5 h-2.5 rounded-sm"
            />
            50%
          </span>
          <span className="flex items-center gap-1">
            <span
              style={{ backgroundColor: "var(--accent-color, var(--accent-primary))" }}
              className="w-2.5 h-2.5 rounded-sm shadow-sm"
            />
            100% Met
          </span>
        </div>
      </div>

      {/* 30-Day Compact Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 sm:gap-2.5">
        {days.map((date, idx) => {
          const isToday = isSameDay(date, new Date());
          const stat = getDayData(date);

          let totalSeconds = stat?.totalSeconds ?? 0;
          if (isToday) {
            totalSeconds += todayLiveSeconds;
          }

          const target = stat?.targetSeconds ?? dailyTargetSeconds;
          const fillPercentage = Math.min(Math.round((totalSeconds / target) * 100), 100);
          const isGoalMet = fillPercentage >= 100;
          const minutes = Math.floor(totalSeconds / 60);

          return (
            <div
              key={idx}
              className="flex flex-col items-center group relative cursor-pointer"
            >
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                <div className="bg-black/95 text-white text-[10px] py-1 px-2 rounded-md shadow-xl whitespace-nowrap font-sans font-medium">
                  {format(date, "MMM d")}: {formatDurationSummary(minutes)} ({fillPercentage}%)
                </div>
                <div className="w-1.5 h-1.5 bg-black/95 rotate-45 -mt-0.5" />
              </div>

              {/* Compact Liquid Day Cube (Borderless) */}
              <div
                style={
                  isToday
                    ? {
                        outline: "2px solid var(--accent-color, var(--accent-primary))",
                        outlineOffset: "2px",
                      }
                    : undefined
                }
                className={`w-full aspect-square max-w-[56px] rounded-xl relative overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${
                  isGoalMet ? "flame-glow-effect" : "bg-white/[0.04]"
                }`}
              >
                <div className="absolute inset-0 bg-white/[0.02]" />

                {/* Liquid Water Fill */}
                {fillPercentage > 0 && (
                  <div
                    className="absolute bottom-0 left-0 right-0 transition-all duration-500 overflow-hidden"
                    style={{
                      height: `${fillPercentage}%`,
                      backgroundColor: "var(--accent-color, var(--accent-primary))",
                    }}
                  >
                    {fillPercentage < 100 && (
                      <div className="absolute -top-2 left-0 w-[200%] h-3 pointer-events-none water-wave opacity-75">
                        <svg
                          viewBox="0 0 500 150"
                          preserveAspectRatio="none"
                          className="w-full h-full"
                        >
                          <path
                            d="M0.00,49.98 C150.00,150.00 349.81,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                            style={{ stroke: "none", fill: "var(--accent-color, var(--accent-primary))" }}
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                )}

                {/* Day Number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <span
                    className={`text-[11px] font-bold font-mono transition-colors duration-200 ${
                      fillPercentage > 50 ? "text-black drop-shadow-sm font-extrabold" : "opacity-90"
                    }`}
                  >
                    {format(date, "d")}
                  </span>

                  {isGoalMet && (
                    <Flame className="w-2.5 h-2.5 text-black fill-black drop-shadow-sm -mt-0.5 animate-bounce" />
                  )}
                </div>
              </div>

              {/* Day of Week Label */}
              <span
                style={{ color: "var(--text-secondary)" }}
                className="text-[9px] font-medium mt-1 uppercase tracking-wider font-sans opacity-70"
              >
                {format(date, "EEEEE")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConstellationGrid;
