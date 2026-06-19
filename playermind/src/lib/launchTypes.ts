// PLAYERMIND – טיפוסים לישויות ההשקה

export type UserRole = "player" | "coach" | "admin";

export interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  source: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  user_id: string | null;
  type: string | null;
  rating: number | null;
  message: string;
  page: string | null;
  created_at: string;
}

export interface ErrorLog {
  id: string;
  user_id: string | null;
  message: string | null;
  stack: string | null;
  source: string | null;
  url: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface UsageEvent {
  id: string;
  user_id: string | null;
  event: string;
  path: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface CoachPlayer {
  id: string;
  coach_id: string;
  player_id: string;
  created_at: string;
}
