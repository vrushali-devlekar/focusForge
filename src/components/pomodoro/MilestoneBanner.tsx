"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, X, Sparkles, Check, Coffee } from "lucide-react";

interface MilestoneBannerProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const MilestoneBanner: React.FC<MilestoneBannerProps> = ({
  isOpen,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 text-zinc-100 relative"
        >
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-100">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
                  3-Hour Daily Milestone
                </span>
              </div>
              <h3 className="text-base font-semibold text-zinc-100 tracking-tight">
                Deep Work Goal Achieved
              </h3>
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
            You have logged <strong className="text-zinc-100 font-mono font-semibold">3 full hours (10,800 seconds)</strong> of deep, focused work today. Outstanding cognitive endurance. Take time to step back, hydrate, and recharge!
          </div>

          {/* Action */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onDismiss}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Acknowledge &amp; Continue</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MilestoneBanner;
