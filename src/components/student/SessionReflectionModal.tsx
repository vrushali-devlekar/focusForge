"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { SessionOutcome } from "@/types/studentHub";
import { formatDurationLabel } from "@/hooks/useFocusTimer";

interface SessionReflectionModalProps {
  isOpen: boolean;
  taskObjective: string;
  durationSeconds: number;
  onSaveReflection: (outcome: SessionOutcome, note: string) => void;
  onSkip: () => void;
}

export const SessionReflectionModal: React.FC<SessionReflectionModalProps> = ({
  isOpen,
  taskObjective,
  durationSeconds,
  onSaveReflection,
  onSkip,
}) => {
  const [selectedOutcome, setSelectedOutcome] = useState<SessionOutcome>("COMPLETED");
  const [reflectionNote, setReflectionNote] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveReflection(selectedOutcome, reflectionNote.trim());
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 text-zinc-100"
        >
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">
              <Sparkles className="w-3 h-3" />
              <span>Session Logged ({formatDurationLabel(durationSeconds)})</span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 tracking-tight pt-1">
              Session Reflection
            </h3>
            <p className="text-xs text-zinc-500">
              Record outcome before moving to rest.
            </p>
          </div>

          {/* Contract Recap */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-500">Target Objective:</span>
            <p className="text-xs font-medium text-zinc-200">
              &ldquo;{taskObjective}&rdquo;
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 block">
                Did you finish your target?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOutcome("COMPLETED")}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                    selectedOutcome === "COMPLETED"
                      ? "bg-zinc-800 border-zinc-500 text-zinc-100"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Finished</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOutcome("PARTIALLY_COMPLETED")}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                    selectedOutcome === "PARTIALLY_COMPLETED"
                      ? "bg-zinc-800 border-zinc-500 text-zinc-100"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Partial</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOutcome("BLOCKED")}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                    selectedOutcome === "BLOCKED"
                      ? "bg-zinc-800 border-zinc-500 text-zinc-100"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Blocked</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400 block">
                Output summary / next step (optional):
              </label>
              <input
                type="text"
                placeholder="e.g., Finished questions 1-12"
                value={reflectionNote}
                onChange={(e) => setReflectionNote(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={onSkip}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Skip
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition"
              >
                <span>Save</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SessionReflectionModal;
