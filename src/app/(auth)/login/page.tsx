"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { FlameIcon } from "@/components/FlameIcon";
import { Flame, Clock, Shield } from "lucide-react";
import { ThemeProvider } from "@/context/ThemeContext";

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090a0d] text-white flex flex-col justify-between px-4 py-8 sm:py-10 relative overflow-hidden select-none">
      {/* Background Subtle Radial Spotlight Gradient & Light Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 15%, rgba(66, 228, 37, 0.07), transparent 60%),
            radial-gradient(circle at 50% 70%, rgba(255, 255, 255, 0.02), transparent 70%),
            radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 24px 24px",
        }}
      />

      {/* Top Header Logo */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5 group">
          <FlameIcon size="sm" containerVariant="navbar" />
          <span className="font-bold text-base sm:text-lg tracking-tight text-white">
            FocusForge
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <div className="relative z-10 max-w-md w-full mx-auto my-auto py-8">
        <div className="rounded-[28px] bg-[#111317]/90 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl p-7 sm:p-10 text-center relative overflow-hidden">
          {/* Top Icon Emblem with Radial Heat Glow */}
          <FlameIcon size="lg" containerVariant="card" />

          {/* Heading & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2.5">
            Enter FocusForge
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-8 max-w-sm mx-auto font-sans">
            A high-focus deep work workspace, streak engine, and ambient soundscapes companion.
          </p>

          {/* "Continue with Google" Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-full bg-white text-zinc-950 font-semibold text-sm transition-all duration-200 shadow-lg hover:scale-[1.01] active:scale-[0.99] hover:bg-zinc-100 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <span className="text-xs font-mono">Connecting...</span>
            ) : (
              <>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* 3 Bottom Feature Micro-Cards */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-3 gap-2.5 text-center">
            {/* Micro Card 1: Zero-Drift */}
            <div className="rounded-xl bg-zinc-900/60 border border-white/[0.06] p-2.5 flex flex-col items-center gap-1 transition-colors hover:border-white/10">
              <div className="w-6 h-6 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-[#42e425]" />
              </div>
              <span className="text-xs font-medium text-zinc-200 leading-tight">Zero-Drift</span>
              <span className="text-[10px] text-zinc-500 font-mono">Stopwatch</span>
            </div>

            {/* Micro Card 2: Daily Streaks */}
            <div className="rounded-xl bg-zinc-900/60 border border-white/[0.06] p-2.5 flex flex-col items-center gap-1 transition-colors hover:border-white/10">
              <div className="w-6 h-6 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300">
                <Flame className="w-3.5 h-3.5 text-[#42e425]" />
              </div>
              <span className="text-xs font-medium text-zinc-200 leading-tight">Streaks</span>
              <span className="text-[10px] text-zinc-500 font-mono">30d Grid</span>
            </div>

            {/* Micro Card 3: Deep Flow */}
            <div className="rounded-xl bg-zinc-900/60 border border-white/[0.06] p-2.5 flex flex-col items-center gap-1 transition-colors hover:border-white/10">
              <div className="w-6 h-6 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300">
                <Shield className="w-3.5 h-3.5 text-[#42e425]" />
              </div>
              <span className="text-xs font-medium text-zinc-200 leading-tight">Shield</span>
              <span className="text-[10px] text-zinc-500 font-mono">Zen Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-md w-full mx-auto text-center text-xs font-mono text-zinc-500">
        <p>FocusForge &bull; Dedicated to the craft of uninterrupted flow</p>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <LoginContent />
    </ThemeProvider>
  );
}
