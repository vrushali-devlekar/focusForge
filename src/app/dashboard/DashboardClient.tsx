"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { FocusTimer } from "@/components/dashboard/FocusTimer";
import { FocusConstellation } from "@/components/dashboard/FocusConstellation";
import { AudioDock } from "@/components/dashboard/AudioDock";
import { ThemeSettingsModal } from "@/components/profile/ThemeSettingsModal";
import { ThemeProvider } from "@/context/ThemeContext";

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
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(user.image || null);
  const [liveSeconds, setLiveSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [todayDailyTotal, setTodayDailyTotal] = useState<number>(0);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-between font-sans relative pb-36">
      <Navbar
        user={{
          ...user,
          image: userAvatar,
        }}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Main Focus Workspace */}
      <main className="flex-1 max-w-2xl sm:max-w-3xl w-full mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-12 space-y-8">
        <FocusTimer
          onActiveSecondsChange={(secs, running, dailyTotal) => {
            setLiveSeconds(secs);
            setIsTimerRunning(running);
            setTodayDailyTotal(dailyTotal);
          }}
        />
        <FocusConstellation
          todayLiveSeconds={isTimerRunning ? liveSeconds : 0}
          todayPropSeconds={todayDailyTotal + (isTimerRunning ? liveSeconds : 0)}
        />
      </main>

      {/* Collapsed Bottom Soundscapes Drawer */}
      <AudioDock />

      {/* Profile / Settings Modal */}
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
