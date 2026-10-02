"use client";

import React, { useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  BookOpen,
  Flame,
  Target,
  Layers,
} from "lucide-react";
import { StudentSession } from "@/types/studentHub";
import { formatDurationLabel } from "@/hooks/useFocusTimer";

interface StudyAnalyticsProps {
  sessions: StudentSession[];
  todayTargetMinutes: number;
  streakDays: number;
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export const StudyAnalytics: React.FC<StudyAnalyticsProps> = ({
  sessions,
  todayTargetMinutes,
  streakDays,
}) => {
  const today = getTodayDateString();

  const todaySessions = useMemo(() => {
    return sessions.filter((s) => s.date === today);
  }, [sessions, today]);

  const todayTotalSeconds = useMemo(() => {
    return todaySessions.reduce((acc, s) => acc + s.studyDurationSeconds, 0);
  }, [todaySessions]);

  const targetSeconds = todayTargetMinutes * 60;
  const progressPercent = Math.min(
    Math.round((todayTotalSeconds / targetSeconds) * 100),
    100
  );
  const isTargetAchieved = todayTotalSeconds >= targetSeconds;

  return (
    <div className="space-y-4">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1 */}
        <div className="rounded-2xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-400">
                Today&apos;s Goal
              </span>
            </div>
            <span
              className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${
                isTargetAchieved
                  ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                  : "text-zinc-500 bg-zinc-950"
              }`}
            >
              {progressPercent}%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-2xl font-semibold text-zinc-100 tabular-nums">
                {formatDurationLabel(todayTotalSeconds)}
              </span>
              <span className="text-xs text-zinc-500">
                / {formatDurationLabel(targetSeconds)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-zinc-100 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Completed Sessions */}
        <div className="rounded-2xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400">
              Focus Blocks
            </span>
          </div>

          <div className="text-2xl font-semibold font-mono text-zinc-100 tabular-nums">
            {todaySessions.length} {todaySessions.length === 1 ? "Block" : "Blocks"}
          </div>

          <p className="text-[11px] text-zinc-500">
            {todaySessions.length > 0
              ? `Avg ${formatDurationLabel(Math.round(todayTotalSeconds / todaySessions.length))} per block`
              : "No sessions recorded yet today"}
          </p>
        </div>

        {/* Metric 3: Streak */}
        <div className="rounded-2xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-400">
                Study Streak
              </span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              Active
            </span>
          </div>

          <div className="text-2xl font-semibold font-mono text-zinc-100 tabular-nums">
            {streakDays} {streakDays === 1 ? "Day" : "Days"}
          </div>

          <p className="text-[11px] text-zinc-500">
            Consecutive study cadence logged.
          </p>
        </div>
      </div>

      {/* Completed Tasks Feed */}
      <div className="rounded-2xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 p-5 space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <h3 className="text-xs font-medium text-zinc-200">
              Completed Tasks &amp; Output Feed
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {todaySessions.length} {todaySessions.length === 1 ? "Block" : "Blocks"}
          </span>
        </div>

        {todaySessions.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {todaySessions.map((session) => (
              <div
                key={session.id}
                className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-medium text-zinc-200">
                      {session.taskObjective}
                    </span>

                    <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-zinc-600" />
                      <span>{new Date(session.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>&bull;</span>
                      <span className="text-zinc-400">
                        {formatDurationLabel(session.studyDurationSeconds)}
                      </span>
                    </div>
                  </div>

                  {session.outcome && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {session.outcome === "COMPLETED" ? "Finished" : session.outcome === "PARTIALLY_COMPLETED" ? "Partial" : "Blocked"}
                    </span>
                  )}
                </div>

                {session.reflectionNote && (
                  <div className="text-xs text-zinc-400 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800 italic">
                    &ldquo;{session.reflectionNote}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-xs text-zinc-500 italic">
            No study sessions logged yet today.
          </p>
        )}
      </div>
    </div>
  );
};

export default StudyAnalytics;
