// PLAYERMIND – טיפוסי הנתונים (תואמים לסכמת Supabase)

export interface PlayerProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  strong_foot: string | null;
  shirt_number: number | null;
  team: string | null;
  league: string | null;
  main_position: string | null;
  secondary_position: string | null;
  personal_goals: string | null;
  professional_goals: string | null;
  physical_goals: string | null;
  mental_goals: string | null;
  team_goals: string | null;
  role: "player" | "coach" | "admin";
  onboarded: boolean;
  updated_at: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  log_date: string;
  sleep_hours: number | null;
  sleep_quality: string | null;
  wake_feeling: string | null;
  body_feeling: string | null;
  mood: string | null;
  pain_level: string | null;
  today_type: string | null;
  daily_goal: string | null;
  created_at: string;
}

export interface TrainingSession {
  id: string;
  user_id: string;
  log_date: string;
  phase: "pre" | "post";
  arrival_state: string | null;
  focus_today: string | null;
  ate: boolean | null;
  drank: boolean | null;
  pro_goal: string | null;
  mental_goal: string | null;
  what_was_good: string | null;
  what_learned: string | null;
  what_improve: string | null;
  challenging_moment: string | null;
  how_handled: string | null;
  load_level: string | null;
  pain_after: string | null;
  created_at: string;
}

export interface Match {
  id: string;
  user_id: string;
  log_date: string;
  phase: "pre" | "post";
  arrival_state: string | null;
  goal: string | null;
  in_control: string | null;
  first_action: string | null;
  minutes_played: number | null;
  what_worked: string | null;
  what_less_worked: string | null;
  take_to_next: string | null;
  lost_focus_moment: string | null;
  how_recovered: string | null;
  created_at: string;
}

export interface RecoveryLog {
  id: string;
  user_id: string;
  log_date: string;
  stretching: boolean;
  walking: boolean;
  massage: boolean;
  foam_roll: boolean;
  ice: boolean;
  breathing: boolean;
  early_sleep: boolean;
  post_meal: boolean;
  hydration: boolean;
  created_at: string;
}

export interface LifeBalanceLog {
  id: string;
  user_id: string;
  log_date: string;
  family_time: string | null;
  met_friends: string | null;
  did_enjoyable: string | null;
  week_feeling: string | null;
  good_moment: string | null;
  created_at: string;
}

export interface SuccessJournalEntry {
  id: string;
  user_id: string;
  log_date: string;
  did_well: string | null;
  proud_of: string | null;
  what_advanced: string | null;
  learned_about_self: string | null;
  created_at: string;
}

export interface InjuryRecord {
  id: string;
  user_id: string;
  title: string;
  body_part: string | null;
  injury_date: string | null;
  status: string | null;
  note: string | null;
  created_at: string;
}

export interface PlayerGoal {
  id: string;
  user_id: string;
  category: string;
  title: string;
  is_active: boolean;
  created_at: string;
}

export type InsightCategory =
  | "שינה" | "התאוששות" | "עומס" | "מנטלי" | "חיים" | "כללי";

export interface Insight {
  id?: string;
  user_id?: string;
  period: string;
  category: InsightCategory;
  title: string;
  detected: string;
  why: string;
  action: string;
  created_at?: string;
}

export interface MemoryItem {
  id: string;
  user_id: string;
  kind: string; // מטרה / פציעה / הרגל / קושי / חוזקה / דפוס
  content: string;
  weight: number;
  updated_at: string;
  created_at: string;
}

export interface WeeklyReportContent {
  period: string;
  what_worked: string[];
  what_improved: string[];
  needs_attention: string[];
  trends: string[];
  habits: string[];
  next_week_action: string;
}

export interface MonthlyReportContent {
  period: string;
  sleep: string;
  recovery: string;
  load: string;
  mental: string;
  life: string;
  goals: string;
  performance: string;
}
