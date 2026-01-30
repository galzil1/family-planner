export interface Family {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface User {
  id: string;
  family_id: string;
  email: string;
  display_name: string;
  avatar_color: string;
  created_at: string;
}

export interface Category {
  id: string;
  family_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface Task {
  id: string;
  family_id: string;
  assigned_to: string | null;
  category_id: string | null;
  title: string;
  notes: string | null;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc. (legacy)
  days_of_week: number[] | null; // Array of days (0-6) for multi-day tasks
  week_start: string; // ISO date string of the Sunday of the week
  completed: boolean;
  is_recurring: boolean;
  reminder_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskWithRelations extends Task {
  assigned_user?: User | null;
  category?: Category | null;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Hebrew days - Sunday first (Israeli week)
export const DAYS_OF_WEEK = [
  'ראשון',
  'שני',
  'שלישי',
  'רביעי',
  'חמישי',
  'שישי',
  'שבת',
] as const;

export const DAYS_SHORT = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'] as const;

// Default categories with icons and colors (Hebrew)
export const DEFAULT_CATEGORIES = [
  { name: 'ילדים', color: '#8B5CF6', icon: '👶' },
  { name: 'ספורט', color: '#10B981', icon: '⚽' },
  { name: 'מטלות בית', color: '#F59E0B', icon: '🏠' },
  { name: 'אחר', color: '#6B7280', icon: '📌' },
] as const;

// Avatar colors for family members
export const AVATAR_COLORS = [
  '#3B82F6', // כחול
  '#EC4899', // ורוד
  '#10B981', // ירוק
  '#F59E0B', // כתום
  '#8B5CF6', // סגול
  '#EF4444', // אדום
] as const;
