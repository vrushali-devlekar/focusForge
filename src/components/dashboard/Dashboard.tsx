"use client";

import React from "react";
import { PomodoroControls } from "@/components/pomodoro/PomodoroControls";
import { FocusConstellation } from "@/components/dashboard/FocusConstellation";

export interface DashboardProps {
  className?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ className = "" }) => {
  return (
    <div className={`w-full max-w-xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-36 space-y-8 ${className}`}>
      {/* 1. Core Minimalist Pomodoro Timer */}
      <PomodoroControls />

      {/* 2. 30-Day Focus Constellation Grid */}
      <FocusConstellation />
    </div>
  );
};

export default Dashboard;
