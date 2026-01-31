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
  whatsapp_number: string | null;
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

// Helper - a person who can be assigned tasks but doesn't have an account
export interface Helper {
  id: string;
  family_id: string;
  name: string;
  avatar_color: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

export const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'ללא' },
  { value: 'daily', label: 'יומי' },
  { value: 'weekly', label: 'שבועי' },
  { value: 'biweekly', label: 'דו-שבועי' },
  { value: 'monthly', label: 'חודשי' },
];

export type ViewMode = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export const VIEW_MODE_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'daily', label: 'יום' },
  { value: 'weekly', label: 'שבוע' },
  { value: 'biweekly', label: 'שבועיים' },
  { value: 'monthly', label: 'חודש' },
];

export interface Task {
  id: string;
  family_id: string;
  assigned_to: string | null; // User ID
  helper_id: string | null; // Helper ID (non-user assignee)
  category_id: string | null;
  title: string;
  notes: string | null;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  week_start: string; // ISO date string of the Sunday of the week
  completed: boolean;
  is_recurring: boolean;
  recurrence_type: RecurrenceType | null;
  task_time: string | null; // Time for the task (HH:MM format)
  reminder_time: string | null;
  created_at: string;
  updated_at: string;
  // Deprecated - kept for backward compatibility with existing data
  days_of_week?: number[] | null;
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
