"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Headphones,
  Radio,
  Youtube,
  ChevronUp,
  ChevronDown,
  Link2,
  Volume2,
  VolumeX,
  ExternalLink,
  Check,
} from "lucide-react";

export interface AudioDockProps {
  isTimerRunning?: boolean;
  onAudioSyncChange?: (enabled: boolean) => void;
  className?: string;
}

interface PresetItem {
  id: string;
  name: string;
  tag: string;
  url: string;
  externalUrl: string;
}

const SPOTIFY_PRESETS: PresetItem[] = [
  {
    id: "lofi-beats",
    name: "Lofi Beats",
    tag: "Chilled Beats",
    url: "https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0",
    externalUrl: "https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM",
  },
  {
    id: "synthwave",
    name: "Synthwave / Cyber Chill",
    tag: "Retro Electronic",
    url: "https://open.spotify.com/embed/playlist/37i9dQZF1DXd9rSD9Q66tB?utm_source=generator&theme=0",
    externalUrl: "https://open.spotify.com/playlist/37i9dQZF1DXd9rSD9Q66tB",
  },
  {
    id: "deep-focus",
    name: "Deep Focus",
    tag: "Ambient Flow",
    url: "https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0",
    externalUrl: "https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS",
  },
  {
    id: "peaceful-piano",
    name: "Peaceful Piano",
    tag: "Acoustic Solo",
    url: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0",
    externalUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
  },
];

const YOUTUBE_PRESETS: PresetItem[] = [
  {
    id: "lofi-girl",
    name: "Lofi Girl (Live 24/7)",
    tag: "Live Stream",
    url: "https://www.youtube.com/embed/jfKfPfyJRdk",
    externalUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  },
  {
    id: "rain-thunder",
    name: "Rain & Thunderstorm",
    tag: "Nature Ambience",
    url: "https://www.youtube.com/embed/lTRiuFIWV54",
    externalUrl: "https://www.youtube.com/watch?v=lTRiuFIWV54",
  },
  {
    id: "binaural-beats",
    name: "Binaural Beats 40Hz / Alpha",
    tag: "Cognitive Focus",
    url: "https://www.youtube.com/embed/WPni755-Krg",
    externalUrl: "https://www.youtube.com/watch?v=WPni755-Krg",
  },
  {
    id: "synthwave-live",
    name: "Synthwave / Chill Radio",
    tag: "Cyber Ambient",
    url: "https://www.youtube.com/embed/4xDzrJKXOOY",
    externalUrl: "https://www.youtube.com/watch?v=4xDzrJKXOOY",
  },
];

const STORAGE_KEY_AUDIODOCK = "focusforge_audiodock_state";

export const AudioDock: React.FC<AudioDockProps> = ({
  isTimerRunning = false,
  onAudioSyncChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"spotify" | "youtube">("spotify");
  const [autoSync, setAutoSync] = useState<boolean>(true);

  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState<string>(SPOTIFY_PRESETS[0].url);
  const [selectedSpotifyId, setSelectedSpotifyId] = useState<string>(SPOTIFY_PRESETS[0].id);
  const [customSpotifyInput, setCustomSpotifyInput] = useState<string>("");

  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState<string>(YOUTUBE_PRESETS[0].url);
  const [selectedYoutubeId, setSelectedYoutubeId] = useState<string>(YOUTUBE_PRESETS[0].id);
  const [customYoutubeInput, setCustomYoutubeInput] = useState<string>("");

  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const [playbackKey, setPlaybackKey] = useState<number>(0);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(true);

  const prevRunningRef = useRef<boolean>(isTimerRunning);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIODOCK);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeTab === "spotify" || parsed.activeTab === "youtube") {
          setActiveTab(parsed.activeTab);
        }
        if (typeof parsed.autoSync === "boolean") {
          setAutoSync(parsed.autoSync);
        }
        if (parsed.spotifyEmbedUrl) {
          setSpotifyEmbedUrl(parsed.spotifyEmbedUrl);
          setSelectedSpotifyId(parsed.selectedSpotifyId || "custom");
        }
        if (parsed.youtubeEmbedUrl) {
          setYoutubeEmbedUrl(parsed.youtubeEmbedUrl);
          setSelectedYoutubeId(parsed.selectedYoutubeId || "custom");
        }
      }
    } catch (e) {
      console.error("Failed to restore AudioDock settings", e);
    }
  }, []);

  const persistAudioSettings = (updates: Record<string, unknown>) => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY_AUDIODOCK);
      const parsed = existing ? JSON.parse(existing) : {};
      const next = { ...parsed, ...updates };
      localStorage.setItem(STORAGE_KEY_AUDIODOCK, JSON.stringify(next));
    } catch (e) {
      console.error("Failed to save AudioDock settings", e);
    }
  };

  useEffect(() => {
    if (autoSync) {
      if (isTimerRunning && !prevRunningRef.current) {
        setIsAudioActive(true);
        setPlaybackKey((k) => k + 1);
      } else if (!isTimerRunning && prevRunningRef.current) {
        setIsAudioActive(false);
      }
    }
    prevRunningRef.current = isTimerRunning;
  }, [isTimerRunning, autoSync]);

  const handleTabChange = (tab: "spotify" | "youtube") => {
    setActiveTab(tab);
    persistAudioSettings({ activeTab: tab });
  };

  const handleToggleAutoSync = () => {
    const next = !autoSync;
    setAutoSync(next);
    persistAudioSettings({ autoSync: next });
    if (onAudioSyncChange) onAudioSyncChange(next);
  };

  const handleSelectSpotifyPreset = (preset: PresetItem) => {
    setSpotifyEmbedUrl(preset.url);
    setSelectedSpotifyId(preset.id);
    setIsAudioActive(true);
    persistAudioSettings({
      spotifyEmbedUrl: preset.url,
      selectedSpotifyId: preset.id,
    });
  };

  const handleSelectYoutubePreset = (preset: PresetItem) => {
    setYoutubeEmbedUrl(preset.url);
    setSelectedYoutubeId(preset.id);
    setIsAudioActive(true);
    persistAudioSettings({
      youtubeEmbedUrl: preset.url,
      selectedYoutubeId: preset.id,
    });
  };

  const handleApplyCustomSpotify = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const input = customSpotifyInput.trim();
    if (!input) return;

    let embed = input;
    try {
      if (input.includes("open.spotify.com/")) {
        if (!input.includes("/embed/")) {
          embed = input.replace("open.spotify.com/", "open.spotify.com/embed/");
        }
        if (!embed.includes("utm_source=")) {
          embed += (embed.includes("?") ? "&" : "?") + "utm_source=generator&theme=0";
        }
      } else if (input.startsWith("spotify:")) {
        const parts = input.split(":");
        if (parts.length >= 3) {
          embed = `https://open.spotify.com/embed/${parts[1]}/${parts[2]}?utm_source=generator&theme=0`;
        }
      } else {
        setInputError("Please enter a valid Spotify playlist, track, or album link.");
        return;
      }

      setSpotifyEmbedUrl(embed);
      setSelectedSpotifyId("custom");
      setIsAudioActive(true);
      persistAudioSettings({
        spotifyEmbedUrl: embed,
        selectedSpotifyId: "custom",
      });
      setCustomSpotifyInput("");
      setShowCustomModal(false);
    } catch {
      setInputError("Failed to parse Spotify link.");
    }
  };

  const handleApplyCustomYoutube = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const input = customYoutubeInput.trim();
    if (!input) return;

    let videoId = "";
    try {
      if (input.includes("v=")) {
        videoId = input.split("v=")[1].split("&")[0];
      } else if (input.includes("youtu.be/")) {
        videoId = input.split("youtu.be/")[1].split("?")[0];
      } else if (input.includes("embed/")) {
        videoId = input.split("embed/")[1].split("?")[0];
      } else if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
        videoId = input;
      }

      if (!videoId) {
        setInputError("Please enter a valid YouTube link or video ID.");
        return;
      }

      const embed = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
      setYoutubeEmbedUrl(embed);
      setSelectedYoutubeId("custom");
      setIsAudioActive(true);
      persistAudioSettings({
        youtubeEmbedUrl: embed,
        selectedYoutubeId: "custom",
      });
      setCustomYoutubeInput("");
      setShowCustomModal(false);
    } catch {
      setInputError("Failed to parse YouTube link.");
    }
  };

  const currentYoutubeSrc = `${youtubeEmbedUrl}${
    youtubeEmbedUrl.includes("?") ? "&" : "?"
  }enablejsapi=1&autoplay=${autoSync && !isTimerRunning ? "0" : "1"}`;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none ${className}`}>
      <div className="pointer-events-auto relative max-w-3xl w-[94vw] sm:w-[88vw] md:w-auto">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            /* Collapsed Floating Pill Dock */
            <motion.button
              key="collapsed-dock"
              layoutId="audio-dock-container"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 15, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 backdrop-blur-md shadow-lg text-zinc-300 hover:text-zinc-100 transition duration-150 mx-auto"
              title="Expand Soundscapes"
            >
              <Headphones className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-medium font-sans">
                Soundscapes
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                {activeTab}
              </span>
              <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
            </motion.button>
          ) : (
            /* Expanded Monochrome Drawer */
            <motion.div
              key="expanded-dock"
              layoutId="audio-dock-container"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 15, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full max-w-3xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3.5"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Headphones className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-200">
                    Focus Audio
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleTabChange("spotify")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      activeTab === "spotify"
                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Radio className="w-3 h-3 text-zinc-400" />
                    <span>Spotify</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("youtube")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      activeTab === "youtube"
                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Youtube className="w-3 h-3 text-zinc-400" />
                    <span>YouTube</span>
                  </button>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleAutoSync}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono border transition ${
                      autoSync
                        ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-500"
                    }`}
                    title="Auto-sync audio with timer"
                  >
                    {autoSync ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                    <span>Sync</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Embed Frame & Presets */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
                <div className="md:col-span-6 bg-zinc-900 rounded-xl border border-zinc-800/80 overflow-hidden">
                  {activeTab === "spotify" ? (
                    <iframe
                      key={`${spotifyEmbedUrl}-${playbackKey}`}
                      src={spotifyEmbedUrl}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      title="Spotify Player"
                      className="w-full h-full rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-[152px] bg-black">
                      <iframe
                        key={`${youtubeEmbedUrl}-${playbackKey}`}
                        src={currentYoutubeSrc}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube Player"
                        className="w-full h-full rounded-xl"
                      />
                    </div>
                  )}
                </div>

                {/* Presets List */}
                <div className="md:col-span-6 flex flex-col justify-between h-full space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
                    <span>Presets</span>
                    <button
                      type="button"
                      onClick={() => setShowCustomModal(!showCustomModal)}
                      className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200"
                    >
                      <Link2 className="w-3 h-3" />
                      <span>Custom URL</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {activeTab === "spotify"
                      ? SPOTIFY_PRESETS.map((preset) => {
                          const isSelected = selectedSpotifyId === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectSpotifyPreset(preset)}
                              className={`flex flex-col text-left p-2 rounded-lg border transition ${
                                isSelected
                                  ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-xs font-medium truncate">
                                  {preset.name}
                                </span>
                                {isSelected && <Check className="w-3 h-3 text-zinc-200 ml-1 flex-shrink-0" />}
                              </div>
                              <span className="text-[10px] text-zinc-500 truncate">
                                {preset.tag}
                              </span>
                            </button>
                          );
                        })
                      : YOUTUBE_PRESETS.map((preset) => {
                          const isSelected = selectedYoutubeId === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectYoutubePreset(preset)}
                              className={`flex flex-col text-left p-2 rounded-lg border transition ${
                                isSelected
                                  ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-xs font-medium truncate">
                                  {preset.name}
                                </span>
                                {isSelected && <Check className="w-3 h-3 text-zinc-200 ml-1 flex-shrink-0" />}
                              </div>
                              <span className="text-[10px] text-zinc-500 truncate">
                                {preset.tag}
                              </span>
                            </button>
                          );
                        })}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                    <span>{autoSync ? "Synced with timer state" : "Manual playback"}</span>
                    <a
                      href={
                        activeTab === "spotify"
                          ? SPOTIFY_PRESETS.find((p) => p.id === selectedSpotifyId)?.externalUrl || "https://open.spotify.com"
                          : YOUTUBE_PRESETS.find((p) => p.id === selectedYoutubeId)?.externalUrl || "https://youtube.com"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200"
                    >
                      <span>Open External</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Custom Input */}
              {showCustomModal && (
                <form
                  onSubmit={activeTab === "spotify" ? handleApplyCustomSpotify : handleApplyCustomYoutube}
                  className="flex items-center gap-2 pt-2 border-t border-zinc-800"
                >
                  <input
                    type="text"
                    placeholder={`Paste ${activeTab === "spotify" ? "Spotify URL" : "YouTube URL"}...`}
                    value={activeTab === "spotify" ? customSpotifyInput : customYoutubeInput}
                    onChange={(e) =>
                      activeTab === "spotify"
                        ? setCustomSpotifyInput(e.target.value)
                        : setCustomYoutubeInput(e.target.value)
                    }
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-zinc-200"
                  >
                    Load
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AudioDock;
