"use client";

import React from "react";
import { format, subDays, isSameDay, parseISO } from "date-fns";
import { Card } from "@/components/ui/Card";
import { DailyLogData } from "@/types";
import { formatDurationSummary } from "@/lib/utils";

interface WeeklyHeatmapProps {
  history: DailyLogData[];
}

export const WeeklyHeatmap: React.FC<WeeklyHeatmapProps> = ({ history }) => {
  const last7Days = Array.from({ length: 7 })
    .map((_, i) => subDays(new Date(), 6 - i));

  const getDayData = (date: Date) => {
    return history.find((log) => {
      try {
        const logDate = parseISO(log.date);
        return isSameDay(logDate, date);
      } catch {
        return false;
      }
    });
  };

  const getIntensityClass = (durationSeconds: number) => {
    const mins = Math.floor(durationSeconds / 60);
    if (mins === 0) return "bg-zinc-800/40 border-zinc-800 text-zinc-500";
    if (mins < 30) return "bg-zinc-800 border-zinc-700 text-zinc-300";
    if (mins < 60) return "bg-zinc-600 border-zinc-500 text-zinc-100";
    if (mins < 120) return "bg-zinc-400 border-zinc-300 text-zinc-950 font-semibold";
    return "bg-zinc-100 text-zinc-950 font-bold border-white";
  };

  return (
    <Card className="flex flex-col justify-between bg-zinc-900/60 border-zinc-800/80">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-medium text-zinc-200">7-Day Heatmap</h3>
          <p className="text-xs text-zinc-500">Weekly activity</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {last7Days.map((date, idx) => {
          const dayLog = getDayData(date);
          const duration = dayLog ? (dayLog.totalSeconds ?? (dayLog as any).totalDuration ?? 0) : 0;
          const mins = Math.floor(duration / 60);
          const dayLabel = format(date, "EEE");
          const dateNum = format(date, "d");
          const isToday = isSameDay(date, new Date());

          return (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-500">{dayLabel}</span>
              <div
                title={`${format(date, "MMM dd")}: ${formatDurationSummary(mins)}`}
                className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center border transition ${getIntensityClass(
                  duration
                )} ${isToday ? "ring-1 ring-zinc-300" : ""}`}
              >
                <span className="text-xs font-mono">{dateNum}</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">
                {mins > 0 ? `${mins}m` : "-"}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
