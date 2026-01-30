import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  parseISO,
  isToday,
  addDays,
} from 'date-fns';
import { he } from 'date-fns/locale';

// Week starts on Sunday (0) - Israeli week
const WEEK_START_DAY = 0; // 0 = Sunday, 1 = Monday

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: WEEK_START_DAY });
}

export function getWeekEnd(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: WEEK_START_DAY });
}

export function getWeekStartISO(date: Date = new Date()): string {
  return format(getWeekStart(date), 'yyyy-MM-dd');
}

export function getNextWeekStart(weekStart: string): string {
  const date = parseISO(weekStart);
  return format(addWeeks(date, 1), 'yyyy-MM-dd');
}

export function getPreviousWeekStart(weekStart: string): string {
  const date = parseISO(weekStart);
  return format(subWeeks(date, 1), 'yyyy-MM-dd');
}

export function formatWeekRange(weekStart: string): string {
  const start = parseISO(weekStart);
  const end = addDays(start, 6);
  
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, 'd', { locale: he })} - ${format(end, 'd בMMMM yyyy', { locale: he })}`;
  }
  
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'd בMMMM', { locale: he })} - ${format(end, 'd בMMMM yyyy', { locale: he })}`;
  }
  
  return `${format(start, 'd בMMMM yyyy', { locale: he })} - ${format(end, 'd בMMMM yyyy', { locale: he })}`;
}

export function getDayDate(weekStart: string, dayOfWeek: number): Date {
  const start = parseISO(weekStart);
  return addDays(start, dayOfWeek);
}

export function formatDayDate(weekStart: string, dayOfWeek: number): string {
  const date = getDayDate(weekStart, dayOfWeek);
  return format(date, 'd');
}

export function isDayToday(weekStart: string, dayOfWeek: number): boolean {
  const date = getDayDate(weekStart, dayOfWeek);
  return isToday(date);
}

export function isCurrentWeek(weekStart: string): boolean {
  const currentWeekStart = getWeekStartISO();
  return weekStart === currentWeekStart;
}

export function isPastWeek(weekStart: string): boolean {
  const currentWeekStart = getWeekStartISO();
  return weekStart < currentWeekStart;
}

export function formatDateForHistory(weekStart: string): string {
  const start = parseISO(weekStart);
  return format(start, 'd בMMMM yyyy', { locale: he });
}
