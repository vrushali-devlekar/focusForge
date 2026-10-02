"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Headphones,
  CloudRain,
  Radio,
  ChevronUp,
  ChevronDown,
  Link2,
} from "lucide-react";
import soundSynthesizer from "@/lib/soundSynthesizer";
import { StudyPhase } from "@/types/studentHub";

interface StudentSoundDockProps {
  phase: StudyPhase;
  isRunning: boolean;
}

export const StudentSoundDock: React.FC<StudentSoundDockProps> = ({
  phase,
  isRunning,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<"rain" | "lofi" | "spotify" | "youtube">("lofi");
  const [isRainOn, setIsRainOn] = useState(false);
  const [autoPauseOnBreak, setAutoPauseOnBreak] = useState(true);

  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState(
    "https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0"
  );
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState(
    "https://www.youtube.com/embed/jfKfPfyJRdk"
  );

  useEffect(() => {
    if (autoPauseOnBreak) {
      if (phase === "break" || !isRunning) {
        if (isRainOn) {
          soundSynthesizer.stopAmbientRain();
          setIsRainOn(false);
        }
      }
    }
  }, [phase, isRunning, autoPauseOnBreak, isRainOn]);

  const toggleRain = () => {
    if (isRainOn) {
      soundSynthesizer.stopAmbientRain();
      setIsRainOn(false);
    } else {
      soundSynthesizer.startAmbientRain(0.35);
      setIsRainOn(true);
      setActiveMode("rain");
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customInput.trim();
    if (!val) return;

    if (val.includes("spotify.com")) {
      let embed = val;
      if (!val.includes("/embed/")) {
        embed = val.replace("open.spotify.com/", "open.spotify.com/embed/");
      }
      setSpotifyEmbedUrl(embed);
      setActiveMode("spotify");
    } else if (val.includes("youtube.com") || val.includes("youtu.be")) {
      let videoId = val;
      if (val.includes("v=")) {
        videoId = val.split("v=")[1].split("&")[0];
      } else if (val.includes("youtu.be/")) {
        videoId = val.split("youtu.be/")[1].split("?")[0];
      }
      setYoutubeEmbedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
      setActiveMode("youtube");
    }
    setCustomInput("");
    setShowCustomInput(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 backdrop-blur-md shadow-lg text-zinc-300 hover:text-zinc-100 transition"
            title="Focus Audio"
          >
            <Headphones className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-medium font-sans">Audio</span>
            {isRainOn && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Rain
              </span>
            )}
            <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="w-[90vw] sm:w-80 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Headphones className="w-3.5 h-3.5 text-zinc-400" />
                <h4 className="text-xs font-medium text-zinc-200">
                  Study Audio
                </h4>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAutoPauseOnBreak(!autoPauseOnBreak)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${
                    autoPauseOnBreak
                      ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500"
                  }`}
                  title="Auto-pause on break"
                >
                  Break Sync
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-900"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={toggleRain}
                className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition ${
                  isRainOn
                    ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">Rain</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode("lofi");
                  if (isRainOn) toggleRain();
                }}
                className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition ${
                  activeMode === "lofi" && !isRainOn
                    ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">Lo-Fi</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition ${
                  showCustomInput
                    ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">Custom</span>
              </button>
            </div>

            {!isRainOn && (
              <div className="rounded-lg overflow-hidden bg-black border border-zinc-800">
                {activeMode === "spotify" || activeMode === "lofi" ? (
                  <iframe
                    src={spotifyEmbedUrl}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title="Spotify"
                    className="w-full h-[80px]"
                  />
                ) : (
                  <iframe
                    src={youtubeEmbedUrl}
                    width="100%"
                    height="100"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube"
                    className="w-full h-[100px]"
                  />
                )}
              </div>
            )}

            {showCustomInput && (
              <form onSubmit={handleApplyCustom} className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="Paste URL..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-zinc-200"
                >
                  Load
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentSoundDock;
