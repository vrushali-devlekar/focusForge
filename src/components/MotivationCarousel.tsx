"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Sparkles } from "lucide-react";

interface MotivationSlide {
  id: string;
  category: "DEEP WORK DISCIPLINE" | "STUDY RHYTHM" | "FLOW STATE" | "VISION & CRAFT";
  quote: string;
  author: string;
  role?: string;
  image: string;
  tagColor?: string;
}

const SLIDES: MotivationSlide[] = [
  {
    id: "deep-work-1",
    category: "DEEP WORK DISCIPLINE",
    quote: "The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable in our economy.",
    author: "Cal Newport",
    role: "Author of Deep Work",
    image: "https://images.unsplash.com/photo-1507842229451-79b1be886a20?auto=format&fit=crop&w=1200&q=80", // Moody minimalist library
    tagColor: "#42e425",
  },
  {
    id: "flow-state-2",
    category: "FLOW STATE",
    quote: "Flow is being completely involved in an activity for its own sake. The ego falls away. Time flies. Every action, movement, and thought follows inevitably from the previous one.",
    author: "Mihaly Csikszentmihalyi",
    role: "Architect of Flow Psychology",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80", // Minimal aesthetic coding setup
    tagColor: "#38bdf8",
  },
  {
    id: "study-rhythm-3",
    category: "STUDY RHYTHM",
    quote: "We do not rise to the level of our goals. We fall to the level of our systems. Master the daily block of uninterrupted focus.",
    author: "James Clear",
    role: "Author of Atomic Habits",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80", // Moody brutalist architecture & calm shadows
    tagColor: "#f59e0b",
  },
  {
    id: "vision-craft-4",
    category: "VISION & CRAFT",
    quote: "Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
    role: "Inventor & Pioneer",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80", // Clean modern minimalist architecture
    tagColor: "#a855f7",
  },
];

export const MotivationCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 45;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-advance every 8s, pause on hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const current = SLIDES[currentIndex];

  return (
    <div
      className="w-full relative group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Modern dark glassmorphism card container */}
      <div className="relative rounded-3xl overflow-hidden bg-[#111315] border border-white/5 shadow-2xl transition-all duration-300">
        {/* Background Image with Cinematic Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.35, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${current.image})`,
              }}
            />
          </AnimatePresence>

          {/* Deep dark gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-[#111315]/80 to-[#111315]/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111315] via-[#111315]/50 to-transparent" />
        </div>

        {/* Card Content */}
        <div className="relative z-10 p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[220px] sm:min-h-[240px]">
          {/* Top Row: Category Pill & Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            {/* Category Tag Pill with Animated Glowing Dot */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/80 border border-white/10 backdrop-blur-md shadow-inner text-[10px] sm:text-xs font-mono tracking-wider text-zinc-300">
              <span
                className="w-2 h-2 rounded-full animate-pulse shadow-sm"
                style={{
                  backgroundColor: current.tagColor || "var(--accent-primary, #42e425)",
                  boxShadow: `0 0 8px ${current.tagColor || "var(--accent-primary, #42e425)"}`,
                }}
              />
              <span className="font-semibold">{current.category}</span>
            </div>

            {/* Navigation Controls: Pill Arrow Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevSlide}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition active:scale-95 shadow-sm"
                title="Previous quote"
                aria-label="Previous quote"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition active:scale-95 shadow-sm"
                title="Next quote"
                aria-label="Next quote"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Quote Display with AnimatePresence */}
          <div className="my-3 sm:my-4 relative">
            <Quote className="absolute -top-3 -left-2 w-8 h-8 text-white/5 -z-10 pointer-events-none" />
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="space-y-2.5"
              >
                <p className="text-sm sm:text-base md:text-lg font-medium text-zinc-100 tracking-tight leading-relaxed italic pr-2">
                  &ldquo;{current.quote}&rdquo;
                </p>

                <div className="flex items-center gap-2 pt-1 text-xs sm:text-sm font-sans">
                  <span className="font-semibold text-white tracking-wide">
                    {current.author}
                  </span>
                  {current.role && (
                    <>
                      <span className="text-zinc-600">&bull;</span>
                      <span className="text-zinc-400 text-xs font-mono">
                        {current.role}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Row: Interactive Dot Indicators & Auto-advance Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            {/* Interactive Dot Indicators */}
            <div className="flex items-center gap-1.5">
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? "w-6 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-zinc-600 hover:bg-zinc-400"
                  }`}
                  style={
                    idx === currentIndex
                      ? {
                          backgroundColor: current.tagColor || "var(--accent-primary, #42e425)",
                        }
                      : undefined
                  }
                  title={`Go to quote ${idx + 1}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Subtle auto-play indicator */}
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-zinc-500" />
              {isPaused ? "Paused" : "8s Rhythm"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationCarousel;
