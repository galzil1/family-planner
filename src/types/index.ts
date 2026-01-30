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

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Task {
  id: string;
  family_id: string;
  assigned_to: string | null;
  category_id: string | null;
  title: string;
  notes: string | null;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc. (legacy, for single day)
  days_of_week: number[] | null; // Array of days (0-6) for multi-day tasks
  week_start: string; // ISO date string of the Sunday of the week
  completed: boolean;
  is_recurring: boolean;
  recurrence_type: RecurrenceType;
  recurrence_interval: number; // e.g., every 2 weeks
  recurrence_days: number[] | null; // for custom recurrence: specific days of week
  recurrence_end_date: string | null; // optional end date
  parent_task_id: string | null; // links to parent recurring task
  reminder_time: string | null;
  created_at: string;
  updated_at: string;
}

// Day selection mode type
export type DaySelectionMode = 'single' | 'multiple' | 'all';

export const DAY_SELECTION_LABELS: Record<DaySelectionMode, string> = {
  single: 'יום אחד',
  multiple: 'מספר ימים',
  all: 'כל השבוע',
};

export interface TaskWithRelations extends Task {
  assigned_user?: User | null;
  category?: Category | null;
}

export interface RecurringTaskTemplate {
  id: string;
  family_id: string;
  assigned_to: string | null;
  category_id: string | null;
  title: string;
  notes: string | null;
  day_of_week: number;
  recurrence_type: RecurrenceType;
  recurrence_interval: number;
  recurrence_days: number[] | null;
  recurrence_end_date: string | null;
  reminder_time: string | null;
  is_active: boolean;
  created_at: string;
}

// Recurrence type labels in Hebrew
export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: 'ללא',
  daily: 'יומי',
  weekly: 'שבועי',
  monthly: 'חודשי',
  custom: 'מותאם אישית',
};

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
