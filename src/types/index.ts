export type UserRole = "USER" | "ADMIN";

export interface UserProfileData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  isBlocked: boolean;
  blockedReason?: string | null;
  createdAt: string;
  totalFocusSeconds?: number;
  activeStreak?: number;
}

export interface DailyStatItem {
  id: string;
  userId: string;
  date: string; // ISO date string YYYY-MM-DD
  totalSeconds: number;
  targetSeconds: number;
  streakCount: number;
}

export interface FocusSessionItem {
  id: string;
  userId: string;
  duration: number;
  startedAt: string;
  endedAt: string;
  createdAt: string;
  distractionCount: number | null;
  awaySeconds: number | null;
}

export interface ShieldStats {
  distractionCount: number;
  awaySeconds: number;
}

export type AudioProvider = "spotify" | "youtube" | "custom" | "none";

export type DailyLogData = DailyStatItem;

export interface DashboardStatsResponse {
  todayStats: {
    totalSeconds: number;
    targetSeconds: number;
    streakCount: number;
    progressPercentage: number;
    isGoalMet: boolean;
  };
  userProfile?: UserProfileData;
  recentHistory: DailyStatItem[];
  recentSessions: FocusSessionItem[];
}

