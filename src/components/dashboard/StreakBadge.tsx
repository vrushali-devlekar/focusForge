"use client";

import React from "react";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StreakBadgeProps {
  streakCount: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streakCount }) => {
  return (
    <Card className="flex flex-col justify-between bg-zinc-900/60 border-zinc-800/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-medium text-zinc-200">Daily Streak</h3>
            <p className="text-xs text-zinc-500">Unbroken momentum</p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
          {streakCount > 0 ? "Active" : "Idle"}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold font-mono text-zinc-100 tabular-nums">
          {streakCount}
        </span>
        <span className="text-xs text-zinc-500 font-mono">
          {streakCount === 1 ? "day active" : "days active"}
        </span>
      </div>
    </Card>
  );
};
