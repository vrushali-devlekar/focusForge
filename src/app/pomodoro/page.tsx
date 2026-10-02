import { Navbar } from "@/components/Navbar";
import { PomodoroControls } from "@/components/pomodoro/PomodoroControls";
import { FocusConstellation } from "@/components/dashboard/FocusConstellation";

export const metadata = {
  title: "Intelligent Pomodoro Engine | FocusForge",
  description: "Minimalist Pomodoro study engine with automatic phase switching, sound cues, desktop notifications, and 3-hour daily threshold milestone alert.",
};

export default function PomodoroPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-36 relative">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-8">
        <header className="text-center space-y-1 pb-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight">
            Pomodoro Study Engine
          </h1>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Focus sprints &bull; Rest intervals &bull; 3-Hour daily milestone alert
          </p>
        </header>

        <PomodoroControls />

        <FocusConstellation />
      </main>
    </div>
  );
}
