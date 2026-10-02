"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
  Brain,
} from "lucide-react";
import {
  StudentSession,
  DistractionNote,
  SessionOutcome,
  CadenceType,
} from "@/types/studentHub";
import { TimerEngine } from "@/components/student/TimerEngine";
import { FocusModeOverlay } from "@/components/student/FocusModeOverlay";
import { DistractionPad } from "@/components/student/DistractionPad";
import { StudyAnalytics } from "@/components/student/StudyAnalytics";
import { StudentSoundDock } from "@/components/student/StudentSoundDock";
import { SessionReflectionModal } from "@/components/student/SessionReflectionModal";
import { FocusConstellation } from "@/components/dashboard/FocusConstellation";
import { Navbar } from "@/components/Navbar";

const STORAGE_KEY_STUDENT = "focusforge_student_hub_v1";

export const StudentHub: React.FC = () => {
  const [sessions, setSessions] = useState<StudentSession[]>([]);
  const [distractionNotes, setDistractionNotes] = useState<DistractionNote[]>([]);
  const [todayTargetMinutes, setTodayTargetMinutes] = useState<number>(240);
  const [streakDays, setStreakDays] = useState<number>(1);

  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isFocusOverlayOpen, setIsFocusOverlayOpen] = useState<boolean>(false);

  const [pendingReflectionSession, setPendingReflectionSession] = useState<{
    taskObjective: string;
    cadence: CadenceType;
    studyDurationSeconds: number;
    plannedStudySeconds: number;
    breakDurationSeconds: number;
    startedAt: string;
    endedAt: string;
  } | null>(null);

  // Hoisted Live Stopwatch State (Wall-Clock Based)
  const [liveObjective, setLiveObjective] = useState<string>("");
  const [liveSecondsElapsed, setLiveSecondsElapsed] = useState<number>(0);
  const [liveAccumulatedSeconds, setLiveAccumulatedSeconds] = useState<number>(0);
  const [liveIsRunning, setLiveIsRunning] = useState<boolean>(false);
  const startTimeRef = React.useRef<number | null>(null);

  // Active continuous stopwatch interval with wall-clock calculation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const updateElapsed = () => {
      if (startTimeRef.current) {
        const now = Date.now();
        const segment = Math.max(0, Math.floor((now - startTimeRef.current) / 1000));
        setLiveSecondsElapsed(liveAccumulatedSeconds + segment);
      }
    };

    if (liveIsRunning) {
      updateElapsed();
      interval = setInterval(updateElapsed, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [liveIsRunning, liveAccumulatedSeconds]);

  // Tab visibility & focus catch-up
  useEffect(() => {
    const handleVis = () => {
      if (document.visibilityState === "visible" && liveIsRunning && startTimeRef.current) {
        const segment = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
        setLiveSecondsElapsed(liveAccumulatedSeconds + segment);
      }
    };
    document.addEventListener("visibilitychange", handleVis);
    window.addEventListener("focus", handleVis);
    return () => {
      document.removeEventListener("visibilitychange", handleVis);
      window.removeEventListener("focus", handleVis);
    };
  }, [liveIsRunning, liveAccumulatedSeconds]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.sessions)) setSessions(parsed.sessions);
        if (Array.isArray(parsed.distractionNotes)) setDistractionNotes(parsed.distractionNotes);
        if (typeof parsed.todayTargetMinutes === "number") setTodayTargetMinutes(parsed.todayTargetMinutes);
        if (typeof parsed.streakDays === "number") setStreakDays(parsed.streakDays);
      }
    } catch (e) {
      console.error("Failed to load StudentHub state from localStorage", e);
    }
  }, []);

  const persistState = useCallback(
    (
      newSessions: StudentSession[],
      newNotes: DistractionNote[],
      newTarget: number,
      newStreak: number
    ) => {
      try {
        const payload = {
          sessions: newSessions,
          distractionNotes: newNotes,
          todayTargetMinutes: newTarget,
          streakDays: newStreak,
        };
        localStorage.setItem(STORAGE_KEY_STUDENT, JSON.stringify(payload));
      } catch (e) {
        console.error("Failed to save StudentHub state", e);
      }
    },
    []
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        setIsScratchpadOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAddNote = (content: string) => {
    const newNote: DistractionNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      content,
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    const updated = [newNote, ...distractionNotes];
    setDistractionNotes(updated);
    persistState(sessions, updated, todayTargetMinutes, streakDays);
  };

  const handleToggleResolveNote = (id: string) => {
    const updated = distractionNotes.map((n) =>
      n.id === id ? { ...n, resolved: !n.resolved } : n
    );
    setDistractionNotes(updated);
    persistState(sessions, updated, todayTargetMinutes, streakDays);
  };

  const handleDeleteNote = (id: string) => {
    const updated = distractionNotes.filter((n) => n.id !== id);
    setDistractionNotes(updated);
    persistState(sessions, updated, todayTargetMinutes, streakDays);
  };

  const handleToggleTimer = () => {
    const now = Date.now();
    if (!liveIsRunning) {
      startTimeRef.current = now;
      setLiveIsRunning(true);
    } else {
      const segment = startTimeRef.current ? Math.max(0, Math.floor((now - startTimeRef.current) / 1000)) : 0;
      const total = liveAccumulatedSeconds + segment;
      startTimeRef.current = null;
      setLiveAccumulatedSeconds(total);
      setLiveSecondsElapsed(total);
      setLiveIsRunning(false);
    }
  };

  const handleResetTimer = () => {
    startTimeRef.current = null;
    setLiveAccumulatedSeconds(0);
    setLiveSecondsElapsed(0);
    setLiveIsRunning(false);
  };

  const handleSessionComplete = (sessionData: {
    taskObjective: string;
    cadence: CadenceType;
    studyDurationSeconds: number;
    plannedStudySeconds: number;
    breakDurationSeconds: number;
    startedAt: string;
    endedAt: string;
  }) => {
    // Accumulate to focus_total_YYYY-MM-DD
    const todayStr = new Date().toISOString().split("T")[0];
    const todayKey = `focus_total_${todayStr}`;
    const prevVal = Number(localStorage.getItem(todayKey) || 0);
    localStorage.setItem(todayKey, String(prevVal + sessionData.studyDurationSeconds));

    setIsFocusOverlayOpen(false);
    startTimeRef.current = null;
    setLiveAccumulatedSeconds(0);
    setLiveSecondsElapsed(0);
    setLiveIsRunning(false);
    setPendingReflectionSession(sessionData);
  };

  const handleSaveReflection = (outcome: SessionOutcome, note: string) => {
    if (!pendingReflectionSession) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const newSession: StudentSession = {
      id: `student_sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      taskObjective: pendingReflectionSession.taskObjective,
      cadence: pendingReflectionSession.cadence,
      studyDurationSeconds: pendingReflectionSession.studyDurationSeconds,
      plannedStudySeconds: pendingReflectionSession.plannedStudySeconds,
      breakDurationSeconds: pendingReflectionSession.breakDurationSeconds,
      startedAt: pendingReflectionSession.startedAt,
      endedAt: pendingReflectionSession.endedAt,
      outcome,
      reflectionNote: note.trim() || undefined,
      distractionCount: distractionNotes.filter((n) => !n.resolved).length,
      date: todayStr,
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setPendingReflectionSession(null);

    const todaySessions = updatedSessions.filter((s) => s.date === todayStr);
    const todayStudySeconds = todaySessions.reduce((acc, s) => acc + s.studyDurationSeconds, 0);
    const targetMet = todayStudySeconds >= todayTargetMinutes * 60;
    const newStreak = targetMet ? Math.max(streakDays, 1) : streakDays;
    setStreakDays(newStreak);

    persistState(updatedSessions, distractionNotes, todayTargetMinutes, newStreak);
  };

  const handleSkipReflection = () => {
    handleSaveReflection("COMPLETED", "");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-36 relative">
      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">
                  Student Deep-Work Hub
                </h1>
              </div>
              <p className="text-xs text-zinc-500">
                Single-tasking study sprints &amp; distraction capture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsScratchpadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono transition"
            >
              <Brain className="w-3.5 h-3.5 text-zinc-400" />
              <span>Scratchpad</span>
              <kbd className="text-[9px] text-zinc-500 ml-0.5">Alt+D</kbd>
            </button>
          </div>
        </header>

        {/* SECTION 1: Pre-Session Contract & Adaptive Timer */}
        <section className="space-y-6">
          <TimerEngine
            onSessionComplete={handleSessionComplete}
            onOpenFocusOverlay={() => setIsFocusOverlayOpen(true)}
            onOpenScratchpad={() => setIsScratchpadOpen(true)}
            distractionCount={distractionNotes.filter((n) => !n.resolved).length}
            secondsElapsed={liveSecondsElapsed}
            isRunning={liveIsRunning}
            onToggleTimer={handleToggleTimer}
            onResetTimer={handleResetTimer}
            lockedTask={liveObjective}
            onSetLockedTask={setLiveObjective}
          />
          <FocusConstellation
            todayLiveSeconds={liveIsRunning ? liveSecondsElapsed : 0}
          />
        </section>

        {/* SECTION 2: Daily Study Analytics & Tasks Feed */}
        <section className="pt-2 border-t border-zinc-800/80">
          <StudyAnalytics
            sessions={sessions}
            todayTargetMinutes={todayTargetMinutes}
            streakDays={streakDays}
          />
        </section>
      </div>

      {/* Zen Focus Mode Overlay */}
      <FocusModeOverlay
        isOpen={isFocusOverlayOpen}
        onExit={() => setIsFocusOverlayOpen(false)}
        taskObjective={liveObjective || "Deep Study Session"}
        secondsElapsed={liveSecondsElapsed}
        isRunning={liveIsRunning}
        onToggleTimer={handleToggleTimer}
        onOpenScratchpad={() => setIsScratchpadOpen(true)}
        distractionCount={distractionNotes.filter((n) => !n.resolved).length}
      />

      {/* Distraction Scratchpad Drawer */}
      <DistractionPad
        notes={distractionNotes}
        onAddNote={handleAddNote}
        onToggleResolve={handleToggleResolveNote}
        onDeleteNote={handleDeleteNote}
        isStudyPhase={liveIsRunning}
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        onOpen={() => setIsScratchpadOpen(true)}
      />

      {/* Focus Sound Dock */}
      <StudentSoundDock phase="studying" isRunning={liveIsRunning} />

      {/* Post-Session Reflection Modal */}
      {pendingReflectionSession && (
        <SessionReflectionModal
          isOpen={!!pendingReflectionSession}
          taskObjective={pendingReflectionSession.taskObjective}
          durationSeconds={pendingReflectionSession.studyDurationSeconds}
          onSaveReflection={handleSaveReflection}
          onSkip={handleSkipReflection}
        />
      )}
    </div>
  );
};

export default StudentHub;
