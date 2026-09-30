"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Flame,
  Target,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { FocusTimer } from "@/components/dashboard/FocusTimer";
import { ConstellationGrid } from "@/components/dashboard/ConstellationGrid";
import { MediaDock } from "@/components/media/MediaDock";
import { ThemeSettingsModal } from "@/components/profile/ThemeSettingsModal";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { DashboardStatsResponse } from "@/types";
import { formatDurationSummary } from "@/lib/utils";
import { computePurity } from "@/hooks/useDistractionShield";
import { toDayKey } from "@/lib/day";

interface DashboardClientProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "USER" | "ADMIN";
    isBlocked?: boolean;
    blockedReason?: string | null;
  };
}

function DashboardContent({ user }: DashboardClientProps) {
  const { currentTheme } = useTheme();
  const [statsData, setStatsData] = useState<DashboardStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Live avatar state
  const [userAvatar, setUserAvatar] = useState<string | null>(user.image || null);

  // Live timer ticks
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions?day=${toDayKey()}`);
      if (res.ok) {
        const data: DashboardStatsResponse = await res.json();
        setStatsData(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const todayStats = statsData?.todayStats ?? {
    totalSeconds: 0,
    targetSeconds: 7200,
    streakCount: 0,
    progressPercentage: 0,
    isGoalMet: false,
  };

  const cumulativeTodaySeconds = todayStats.totalSeconds + activeTimerSeconds;
  const targetSeconds = todayStats.targetSeconds || 7200;
  const currentProgressPercent = Math.min(
    Math.round((cumulativeTodaySeconds / targetSeconds) * 100),
    100
  );
  const isGoalAchieved = cumulativeTodaySeconds >= targetSeconds;

  // Average Distraction Shield purity across recent shielded sessions
  const shieldedSessions = (statsData?.recentSessions ?? []).filter(
    (s) => s.distractionCount !== null
  );
  const averagePurity =
    shieldedSessions.length > 0
      ? Math.round(
          shieldedSessions.reduce(
            (sum, s) => sum + computePurity(s.duration, s.awaySeconds ?? 0),
            0
          ) / shieldedSessions.length
        )
      : null;

  const todayMinutes = Math.floor(cumulativeTodaySeconds / 60);
  const targetMinutes = Math.floor(targetSeconds / 60);

  return (
    <div
      style={{
        color: "var(--text-primary)",
      }}
      className="min-h-screen flex flex-col justify-between transition-colors duration-250"
    >
      {/* 2. Floating White/Glass Capsule Navbar */}
      <Navbar
        user={{
          ...user,
          image: userAvatar,
        }}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-36 space-y-12">
        {/* 3. Hero Focus Stopwatch with Dual-Pill Action Capsule */}
        <section className="flex flex-col items-center justify-center">
          <FocusTimer
            onSessionLogged={fetchStats}
            onActiveSecondsChange={(sec) => setActiveTimerSeconds(sec)}
          />
        </section>

        {/* 4. Secondary Dashboard Metrics & Constellation Grid */}
        <section className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Today's Target Progress Card */}
            <div
              className="theme-card p-5 sm:p-6 space-y-3.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    style={{ color: "var(--accent-color, var(--accent-primary))" }}
                    className="p-2 rounded-xl bg-white/[0.03]"
                  >
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold tracking-tight font-sans">
                    Today&apos;s Target
                  </h3>
                </div>

                {isGoalAchieved ? (
                  <span
                    style={{
                      color: "var(--accent-color, var(--accent-primary))",
                      borderColor: "color-mix(in srgb, var(--accent-color, var(--accent-primary)) 30%, transparent)",
                      backgroundColor: "color-mix(in srgb, var(--accent-color, var(--accent-primary)) 12%, transparent)",
                    }}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Achieved
                  </span>
                ) : (
                  <span
                    style={{ color: "var(--text-secondary)" }}
                    className="text-xs font-mono font-bold"
                  >
                    {currentProgressPercent}%
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="h-2 w-full rounded-full overflow-hidden bg-white/[0.04] p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${currentProgressPercent}%`,
                      background: isGoalAchieved
                        ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                        : "var(--accent-gradient, var(--accent-color, #74EA2E))",
                      boxShadow: isGoalAchieved
                        ? "0 0 10px rgba(16, 185, 129, 0.5)"
                        : "var(--accent-glow, 0 0 12px rgba(116, 234, 46, 0.5))",
                    }}
                  />
                </div>

                <div
                  style={{ color: "var(--text-secondary)" }}
                  className="flex justify-between text-xs font-sans"
                >
                  <span>{formatDurationSummary(todayMinutes)} completed</span>
                  <span>Goal: {formatDurationSummary(targetMinutes)}</span>
                </div>
              </div>
            </div>

            {/* Current Streak Card */}
            <div
              className="theme-card p-5 sm:p-6 flex flex-col justify-between gap-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/[0.03] text-amber-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold tracking-tight font-sans">
                    Current Streak
                  </h3>
                </div>

                <span
                  style={{
                    color: "var(--accent-color, var(--accent-primary))",
                    borderColor: "color-mix(in srgb, var(--accent-color, var(--accent-primary)) 30%, transparent)",
                    backgroundColor: "color-mix(in srgb, var(--accent-color, var(--accent-primary)) 12%, transparent)",
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-sm"
                >
                  <span>🔥</span>
                  <span>
                    {todayStats.streakCount}{" "}
                    {todayStats.streakCount === 1 ? "Day Active" : "Days Active"}
                  </span>
                </span>
              </div>

              <p
                style={{ color: "var(--text-secondary)" }}
                className="text-xs font-sans leading-relaxed"
              >
                Consistency ignites mastery. Log at least one uninterrupted focus block daily to protect your flame.
              </p>
            </div>
          </div>

          {/* 30-Day Activity Constellation Grid */}
          <div id="constellation">
            <ConstellationGrid
              history={statsData?.recentHistory ?? []}
              todayLiveSeconds={activeTimerSeconds}
              dailyTargetSeconds={targetSeconds}
            />
          </div>

          {/* Recent Forge Sessions Ledger */}
          <div
            className="theme-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <Clock
                  style={{ color: "var(--accent-color, var(--accent-primary))" }}
                  className="w-4 h-4"
                />
                <h3 className="text-sm font-bold tracking-tight font-sans">
                  Recent Forge Sessions
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {averagePurity !== null && (
                  <span
                    style={{ color: "var(--text-secondary)" }}
                    className="hidden sm:flex items-center gap-1 text-xs font-mono"
                    title="Average Distraction Shield purity of recent sessions"
                  >
                    <ShieldCheck
                      style={{ color: "var(--accent-color, var(--accent-primary))" }}
                      className="w-3 h-3"
                    />
                    <span>Avg purity {averagePurity}%</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={fetchStats}
                  style={{ color: "var(--text-secondary)" }}
                  className="flex items-center gap-1 text-xs hover:text-white transition font-mono"
                  title="Refresh sessions"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync</span>
                </button>
              </div>
            </div>

            {statsData?.recentSessions && statsData.recentSessions.length > 0 ? (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {statsData.recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs transition hover:bg-white/[0.03]"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-white/90">
                        Focus Block
                      </span>
                      <span
                        style={{ color: "var(--text-secondary)" }}
                        className="text-[10px]"
                      >
                        {new Date(session.startedAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        &bull;{" "}
                        {new Date(session.startedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.distractionCount !== null && (
                        <span
                          style={{
                            color:
                              session.distractionCount === 0
                                ? "var(--accent-color, var(--accent-primary))"
                                : "#FBBF24",
                          }}
                          className="flex items-center gap-1 font-mono text-[10px] font-semibold"
                          title={
                            session.distractionCount === 0
                              ? "Shield intact: zero distractions"
                              : `${session.distractionCount} ${
                                  session.distractionCount === 1 ? "break" : "breaks"
                                } · ${formatDurationSummary(
                                  Math.floor((session.awaySeconds ?? 0) / 60)
                                )} away`
                          }
                        >
                          {session.distractionCount === 0 ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <ShieldAlert className="w-3 h-3" />
                          )}
                          <span>
                            {computePurity(session.duration, session.awaySeconds ?? 0)}%
                          </span>
                        </span>
                      )}
                      <span
                        style={{
                          color: "var(--accent-color, var(--accent-primary))",
                          borderColor: "color-mix(in srgb, var(--accent-color, var(--accent-primary)) 30%, transparent)",
                          backgroundColor: "color-mix(in srgb, var(--accent-color, var(--accent-primary)) 12%, transparent)",
                        }}
                        className="font-mono font-semibold text-xs px-2.5 py-0.5 rounded-full border shadow-sm"
                      >
                        {formatDurationSummary(Math.floor(session.duration / 60))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{ color: "var(--text-secondary)" }}
                className="text-xs italic py-4 text-center"
              >
                No sessions recorded yet today. Start the stopwatch above to forge your first block.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* Floating Focus Soundscapes Media Dock */}
      <MediaDock />

      {/* Theme Settings & Profile Modal */}
      <ThemeSettingsModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        user={{
          ...user,
          image: userAvatar,
        }}
        onAvatarUpdated={(newImg) => {
          setUserAvatar(newImg);
        }}
      />
    </div>
  );
}

export function DashboardClient({ user }: DashboardClientProps) {
  return (
    <ThemeProvider>
      <DashboardContent user={user} />
    </ThemeProvider>
  );
}

export default DashboardClient;
