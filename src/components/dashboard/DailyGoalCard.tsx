"use client";

import React from "react";
import { Target, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDurationSummary } from "@/lib/utils";

interface DailyGoalCardProps {
  todaySeconds: number;
  dailyGoalMins: number;
  onEditGoal?: () => void;
}

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({
  todaySeconds,
  dailyGoalMins,
}) => {
  const goalSeconds = dailyGoalMins * 60;
  const progressPercent = Math.min(Math.round((todaySeconds / goalSeconds) * 100), 100);
  const isCompleted = todaySeconds >= goalSeconds;
  const currentMins = Math.floor(todaySeconds / 60);

  return (
    <Card className="flex flex-col justify-between bg-zinc-900/60 border-zinc-800/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-medium text-zinc-200">Daily Target</h3>
            <p className="text-xs text-zinc-500 font-mono">Goal: {formatDurationSummary(dailyGoalMins)}</p>
          </div>
        </div>

        {isCompleted ? (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-100 border border-zinc-700 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Target Hit</span>
          </div>
        ) : (
          <div className="px-2.5 py-0.5 rounded-full bg-zinc-800/60 text-zinc-400 border border-zinc-800 text-xs font-mono">
            <span>{progressPercent}%</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-zinc-400">
          <span>{formatDurationSummary(currentMins)} focused</span>
          <span className="text-zinc-500">{Math.max(0, dailyGoalMins - currentMins)}m remaining</span>
        </div>

        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-zinc-100 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </Card>
  );
};
