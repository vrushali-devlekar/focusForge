export type CadenceType = "deep-solve" | "active-recall" | "exam-sim" | "free-flow";

export interface CadencePreset {
  id: CadenceType;
  name: string;
  tagline: string;
  studyMinutes: number;
  breakMinutes: number;
  iconName: string;
  recommendedFor: string;
}

export type StudyPhase = "pre-contract" | "studying" | "break" | "reflection";

export type SessionOutcome = "COMPLETED" | "PARTIALLY_COMPLETED" | "BLOCKED";

export interface StudentSession {
  id: string;
  taskObjective: string;
  cadence: CadenceType;
  studyDurationSeconds: number; // actual seconds studied
  plannedStudySeconds: number;
  breakDurationSeconds: number;
  outcome?: SessionOutcome;
  reflectionNote?: string;
  distractionCount: number;
  startedAt: string; // ISO String
  endedAt: string; // ISO String
  date: string; // YYYY-MM-DD
}

export interface DistractionNote {
  id: string;
  content: string;
  createdAt: string;
  sessionId?: string;
  resolved: boolean;
}

export interface StudentHubState {
  todayTargetMinutes: number;
  streakDays: number;
  sessions: StudentSession[];
  distractionNotes: DistractionNote[];
}
