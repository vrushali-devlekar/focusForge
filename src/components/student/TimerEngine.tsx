"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  Edit2,
  X,
} from "lucide-react";
import {
  CadenceType,
} from "@/types/studentHub";
import soundSynthesizer from "@/lib/soundSynthesizer";

interface TimerEngineProps {
  onSessionComplete: (sessionData: {
    taskObjective: string;
    cadence: CadenceType;
    studyDurationSeconds: number;
    plannedStudySeconds: number;
    breakDurationSeconds: number;
    startedAt: string;
    endedAt: string;
  }) => void;
  onOpenFocusOverlay: () => void;
  onOpenScratchpad?: () => void;
  distractionCount?: number;
  secondsElapsed: number;
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  lockedTask: string;
  onSetLockedTask: (task: string) => void;
}

function formatThreeColumns(totalSeconds: number) {
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

export const TimerEngine: React.FC<TimerEngineProps> = ({
  onSessionComplete,
  onOpenFocusOverlay,
  secondsElapsed,
  isRunning,
  onToggleTimer,
  onResetTimer,
  lockedTask,
  onSetLockedTask,
}) => {
  // 1. Streamlined Single Task Input local editing state
  const [taskInput, setTaskInput] = useState<string>("");
  const [isEditingTask, setIsEditingTask] = useState<boolean>(false);

  const handleFinishAndReflect = useCallback(() => {
    soundSynthesizer.playChime("complete");

    const finalStudySeconds = Math.max(secondsElapsed, 1);
    onSessionComplete({
      taskObjective: lockedTask || "Deep Focus Block",
      cadence: "deep-solve",
      studyDurationSeconds: finalStudySeconds,
      plannedStudySeconds: finalStudySeconds,
      breakDurationSeconds: 0,
      startedAt: new Date(Date.now() - finalStudySeconds * 1000).toISOString(),
      endedAt: new Date().toISOString(),
    });

    onResetTimer();
  }, [secondsElapsed, lockedTask, onSessionComplete, onResetTimer]);

  // Task lock-in handlers
  const handleLockTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    onSetLockedTask(taskInput.trim());
    setTaskInput("");
    setIsEditingTask(false);
  };

  const handleClearTask = () => {
    onSetLockedTask("");
    setIsEditingTask(false);
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
        onToggleTimer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleTimer]);

  const { hours, minutes, seconds } = formatThreeColumns(secondsElapsed);

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">
      {/* 1. Streamlined Task Input */}
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
            onClick={onOpenFocusOverlay}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono transition"
            title="Zen Mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Zen</span>
          </button>
        </div>

        {/* 3. Three-Column Count-Up Readout Display with Righteous Google Font */}
        <div className="w-full flex items-center justify-center gap-3 sm:gap-5 my-2 select-none">
          {/* HOURS Column */}
          <div className="flex flex-col items-center">
            <div className="font-righteous text-6xl sm:text-7xl md:text-8xl text-white tracking-tight tabular-nums">
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
            <div className="font-righteous text-6xl sm:text-7xl md:text-8xl text-white tracking-tight tabular-nums">
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
                isRunning ? "text-[#42e425]" : "text-white"
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
            onClick={onToggleTimer}
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
              onClick={handleFinishAndReflect}
              disabled={secondsElapsed === 0}
              className={`font-medium flex items-center gap-1 transition ${
                secondsElapsed > 0
                  ? "text-zinc-300 hover:text-white hover:underline cursor-pointer"
                  : "text-zinc-600 cursor-not-allowed"
              }`}
              title="Finish session and save reflection"
            >
              <span>Complete &amp; Log</span>
              <span className={secondsElapsed > 0 ? "text-[#42e425]" : "text-zinc-600"}>&rarr;</span>
            </button>
            <button
              type="button"
              onClick={onResetTimer}
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
    </div>
  );
};

export default TimerEngine;
