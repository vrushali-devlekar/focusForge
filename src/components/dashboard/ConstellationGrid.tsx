"use client";

import React from "react";
import { subDays, format, isSameDay, parseISO } from "date-fns";
import { DailyStatItem } from "@/types";
import { formatDurationSummary } from "@/lib/utils";
import { Sparkles, Flame } from "lucide-react";

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

  const getDayData = (date: Date) => {
    return history.find((stat) => {
      try {
        const statDate = typeof stat.date === "string" ? parseISO(stat.date) : new Date(stat.date);
        return isSameDay(statDate, date);
      } catch {
        return false;
      }
    });
  };

  return (
    <div className="w-full bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <h3 className="text-xs font-medium text-zinc-200">
              30-Day Activity History
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Focus progression toward daily targets
          </p>
        </div>

        {/* Grayscale Legend */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-800/80 border border-zinc-700/40" />
            0%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-600" />
            50%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-100" />
            100%
          </span>
        </div>
      </div>

      {/* 30-Day Grid */}
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

          // Monochrome Fill Color Calculation
          let cellBgClass = "bg-zinc-800/40 text-zinc-500";
          if (fillPercentage >= 100) {
            cellBgClass = "bg-zinc-100 text-zinc-950 font-bold";
          } else if (fillPercentage >= 70) {
            cellBgClass = "bg-zinc-400 text-zinc-950 font-semibold";
          } else if (fillPercentage >= 35) {
            cellBgClass = "bg-zinc-600 text-zinc-200";
          } else if (fillPercentage > 0) {
            cellBgClass = "bg-zinc-800 text-zinc-300";
          }

          return (
            <div
              key={idx}
              className="flex flex-col items-center group relative cursor-pointer"
            >
              {/* Tooltip */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                <div className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-[10px] py-1 px-2 rounded-md shadow-xl whitespace-nowrap font-mono">
                  {format(date, "MMM d")}: {formatDurationSummary(minutes)} ({fillPercentage}%)
                </div>
                <div className="w-1.5 h-1.5 bg-zinc-900 border-r border-b border-zinc-700 rotate-45 -mt-0.5" />
              </div>

              {/* Minimal Day Cube */}
              <div
                className={`w-full aspect-square max-w-[52px] rounded-xl relative flex flex-col items-center justify-center transition border ${
                  isToday
                    ? "border-zinc-300 ring-1 ring-zinc-400"
                    : "border-zinc-800/80"
                } ${cellBgClass}`}
              >
                <span className="text-xs font-mono">
                  {format(date, "d")}
                </span>
                {isGoalMet && (
                  <Flame className="w-2.5 h-2.5 mt-0.5" />
                )}
              </div>

              {/* Day of Week Label */}
              <span className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">
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
