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
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  week_start: string; // ISO date string of the Monday of the week
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

export interface RecurringTaskTemplate {
  id: string;
  family_id: string;
  assigned_to: string | null;
  category_id: string | null;
  title: string;
  notes: string | null;
  day_of_week: number;
  reminder_time: string | null;
  is_active: boolean;
  created_at: string;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

// Default categories with icons and colors
export const DEFAULT_CATEGORIES = [
  { name: 'Cleaning', color: '#10B981', icon: '🧹' },
  { name: 'Shopping', color: '#F59E0B', icon: '🛒' },
  { name: 'Cooking', color: '#EF4444', icon: '🍳' },
  { name: 'Kids', color: '#8B5CF6', icon: '👶' },
  { name: 'Work', color: '#3B82F6', icon: '💼' },
  { name: 'Health', color: '#EC4899', icon: '💪' },
  { name: 'Finance', color: '#14B8A6', icon: '💰' },
  { name: 'Other', color: '#6B7280', icon: '📌' },
] as const;

// Avatar colors for family members
export const AVATAR_COLORS = [
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EF4444', // Red
] as const;
