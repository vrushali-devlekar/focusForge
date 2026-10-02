"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Eye,
  EyeOff,
  X,
  Keyboard,
} from "lucide-react";
import { DistractionNote } from "@/types/studentHub";

interface DistractionPadProps {
  notes: DistractionNote[];
  onAddNote: (content: string) => void;
  onToggleResolve: (id: string) => void;
  onDeleteNote: (id: string) => void;
  isStudyPhase?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const DistractionPad: React.FC<DistractionPadProps> = ({
  notes,
  onAddNote,
  onToggleResolve,
  onDeleteNote,
  isStudyPhase = false,
  isOpen,
  onClose,
  onOpen,
}) => {
  const [inputVal, setInputVal] = useState("");
  const [hideNotesDuringFocus, setHideNotesDuringFocus] = useState(isStudyPhase);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isStudyPhase) {
      setHideNotesDuringFocus(true);
    } else {
      setHideNotesDuringFocus(false);
    }
  }, [isStudyPhase]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onAddNote(inputVal.trim());
    setInputVal("");
  };

  const activeNotes = notes.filter((n) => !n.resolved);
  const resolvedNotes = notes.filter((n) => n.resolved);

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 backdrop-blur-md shadow-lg text-zinc-300 hover:text-zinc-100 transition"
          title="Scratchpad (Alt + D)"
        >
          <div className="relative">
            <Brain className="w-3.5 h-3.5 text-zinc-400" />
            {activeNotes.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-zinc-700 text-[8px] font-bold text-zinc-200 flex items-center justify-center">
                {activeNotes.length}
              </span>
            )}
          </div>
          <span className="text-xs font-medium font-sans">Quick Capture</span>
          <kbd className="text-[9px] font-mono px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 hidden sm:inline">
            Alt+D
          </kbd>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-80 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-xl p-4 flex flex-col gap-3 max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-zinc-400" />
                <h4 className="text-xs font-medium text-zinc-200">
                  Scratchpad
                </h4>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setHideNotesDuringFocus(!hideNotesDuringFocus)}
                  className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-900 transition"
                  title={hideNotesDuringFocus ? "Reveal notes" : "Blur notes"}
                >
                  {hideNotesDuringFocus ? (
                    <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-900 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type stray thought &amp; press Enter..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="p-1.5 rounded-lg bg-zinc-100 text-zinc-950 hover:bg-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>

            <div
              className={`flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-52 ${
                hideNotesDuringFocus ? "filter blur-sm select-none pointer-events-none opacity-40" : ""
              }`}
            >
              {notes.length === 0 ? (
                <div className="text-center py-6 text-zinc-600 text-xs">
                  No stray thoughts captured.
                </div>
              ) : (
                <>
                  {activeNotes.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleResolve(item.id)}
                        className="flex items-center gap-2 text-left flex-1 text-zinc-300"
                      >
                        <Circle className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" />
                        <span>{item.content}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-zinc-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {resolvedNotes.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/60 space-y-1">
                      <div className="text-[10px] font-mono text-zinc-600 uppercase">
                        Cleared ({resolvedNotes.length})
                      </div>
                      {resolvedNotes.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-1.5 rounded bg-zinc-950 text-xs opacity-50"
                        >
                          <button
                            type="button"
                            onClick={() => onToggleResolve(item.id)}
                            className="flex items-center gap-1.5 text-left line-through text-zinc-500 flex-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>{item.content}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteNote(item.id)}
                            className="p-0.5 text-zinc-600 hover:text-zinc-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-600">
              <span className="flex items-center gap-1">
                <Keyboard className="w-3 h-3" /> Alt+D
              </span>
              <span>{activeNotes.length} pending</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DistractionPad;
