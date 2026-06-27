// PLAYERMIND – מאגר אייקונים מקצועי (Lucide). ללא אימוג'י בכל המוצר.
import {
  Moon, Sun, RefreshCw, Zap, Brain, Scale, Sparkles, Target, Droplet,
  Footprints, Hand, Cylinder, Snowflake, Wind, Utensils, Activity,
  Bandage, Sprout, CloudRain, Dumbbell, Repeat, CheckCircle2, TrendingUp,
  Eye, Trophy, Settings, MessageSquare, Wrench, BarChart3, Users,
  CalendarCheck, ClipboardList, Star, X, Check, ChevronLeft, Plus, Home,
  BookOpen, NotebookPen, Compass, Shield, Leaf, Apple, HeartPulse,
  Crosshair, RotateCcw, Bed, Salad, GlassWater, ShieldCheck, Flame,
  Gauge, ListChecks, ArrowLeft, NotebookText, MessagesSquare, Lightbulb,
  AlertTriangle, type LucideIcon as LucideIconType,
} from "lucide-react";

export const ICONS: Record<string, LucideIconType> = {
  // תחומים / קטגוריות
  sleep: Moon,
  recovery: RefreshCw,
  load: Zap,
  mental: Brain,
  life: Scale,
  insight: Sparkles,
  goals: Target,
  nutrition: Salad,
  hydration: Droplet,
  psychology: Brain,
  "pre-match": Crosshair,
  mistakes: RotateCcw,
  leadership: Compass,
  confidence: Dumbbell,
  "injury-prevention": Shield,
  "mental-health": Leaf,
  "life-balance": Scale,
  performance: Trophy,
  // checklist התאוששות
  stretching: Activity,
  walking: Footprints,
  massage: Hand,
  foam_roll: Cylinder,
  ice: Snowflake,
  breathing: Wind,
  early_sleep: Bed,
  post_meal: Utensils,
  // זיכרון
  memory_goal: Target,
  memory_injury: Bandage,
  memory_habit: Sprout,
  memory_difficulty: CloudRain,
  memory_strength: Dumbbell,
  memory_pattern: Repeat,
  // דוחות
  worked: CheckCircle2,
  improved: TrendingUp,
  attention: Eye,
  trends: Repeat,
  habits: Sprout,
  // ניווט / פעולות
  home: Home,
  plus: Plus,
  check: Check,
  close: X,
  star: Star,
  chevron: ChevronLeft,
  back: ArrowLeft,
  settings: Settings,
  feedback: MessageSquare,
  chat: MessagesSquare,
  admin: Wrench,
  analytics: BarChart3,
  users: Users,
  calendar: CalendarCheck,
  clipboard: ClipboardList,
  book: BookOpen,
  journal: NotebookPen,
  coach: Compass,
  shield: ShieldCheck,
  flame: Flame,
  gauge: Gauge,
  checklist: ListChecks,
  notebook: NotebookText,
  idea: Lightbulb,
  warning: AlertTriangle,
  sun: Sun,
  apple: Apple,
  water: GlassWater,
  pulse: HeartPulse,
};

export type IconName = keyof typeof ICONS;

export function Icon({
  name, size = 20, className, strokeWidth = 1.9,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = ICONS[name] ?? Sparkles;
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} />;
}
