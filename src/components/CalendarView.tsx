'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { format, addDays, addWeeks, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday as isDateToday, parseISO, differenceInWeeks, differenceInMonths, getDate } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  getWeekStartISO,
  getWeekStart,
} from '@/lib/date-utils';
import type { Task, User, Family, Category, DayOfWeek, ViewMode, Helper } from '@/types';
import { DAYS_SHORT, VIEW_MODE_OPTIONS } from '@/types';

interface CalendarViewProps {
  user: User;
  family: Family;
  initialTasks: Task[];
  familyMembers: User[];
  helpers?: Helper[];
  categories: Category[];
  onTasksChange?: () => void;
}

export default function CalendarView({
  user,
  family,
  initialTasks,
  familyMembers,
  helpers = [],
  categories,
  onTasksChange,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Update tasks when initialTasks changes
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Navigation functions
  const goToNext = () => {
    switch (viewMode) {
      case 'daily':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'weekly':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'biweekly':
        setCurrentDate(addWeeks(currentDate, 2));
        break;
      case 'monthly':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const goToPrevious = () => {
    switch (viewMode) {
      case 'daily':
        setCurrentDate(addDays(currentDate, -1));
        break;
      case 'weekly':
        setCurrentDate(addWeeks(currentDate, -1));
        break;
      case 'biweekly':
        setCurrentDate(addWeeks(currentDate, -2));
        break;
      case 'monthly':
        setCurrentDate(addMonths(currentDate, -1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get the title based on view mode
  const getTitle = (): string => {
    switch (viewMode) {
      case 'daily':
        return format(currentDate, 'EEEE, d בMMMM', { locale: he });
      case 'weekly':
        const weekStart = getWeekStart(currentDate);
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'd', { locale: he })} - ${format(weekEnd, 'd בMMMM', { locale: he })}`;
      case 'biweekly':
        const biweekStart = getWeekStart(currentDate);
        const biweekEnd = addDays(biweekStart, 13);
        return `${format(biweekStart, 'd/M', { locale: he })} - ${format(biweekEnd, 'd/M', { locale: he })}`;
      case 'monthly':
        return format(currentDate, 'MMMM yyyy', { locale: he });
    }
  };

  // Get days to display based on view mode
  const getDaysToDisplay = (): Date[] => {
    const weekStart = getWeekStart(currentDate);
    
    switch (viewMode) {
      case 'daily':
        return [currentDate];
      case 'weekly':
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      case 'biweekly':
        return Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));
      case 'monthly':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return eachDayOfInterval({ start: monthStart, end: monthEnd });
    }
  };

  // Get tasks for a specific date, handling recurrence, sorted by time
  const getTasksForDate = (date: Date): Task[] => {
    const dayOfWeek = date.getDay();
    const weekStartStr = getWeekStartISO(date);
    const dateOfMonth = getDate(date);
    
    const filteredTasks = tasks.filter((task) => {
      const taskWeekStart = parseISO(task.week_start);
      const taskDateOfMonth = getDate(taskWeekStart) + task.day_of_week;
      
      // Non-recurring task: must match exact week and day
      if (!task.recurrence_type || task.recurrence_type === 'none') {
        return task.week_start === weekStartStr && task.day_of_week === dayOfWeek;
      }
      
      // Task must be on or after the original week
      if (date < taskWeekStart) {
        return false;
      }
      
      // Handle different recurrence types
      switch (task.recurrence_type) {
        case 'daily':
          return true;
          
        case 'weekly':
          return task.day_of_week === dayOfWeek;
          
        case 'biweekly':
          if (task.day_of_week !== dayOfWeek) return false;
          const weeksDiff = differenceInWeeks(getWeekStart(date), taskWeekStart);
          return weeksDiff >= 0 && weeksDiff % 2 === 0;
          
        case 'monthly':
          if (task.day_of_week !== dayOfWeek) return false;
          const monthsDiff = differenceInMonths(date, taskWeekStart);
          if (monthsDiff < 0) return false;
          const originalWeekOfMonth = Math.floor((getDate(taskWeekStart) + task.day_of_week - 1) / 7);
          const currentWeekOfMonth = Math.floor((dateOfMonth - 1) / 7);
          return originalWeekOfMonth === currentWeekOfMonth;
          
        default:
          return false;
      }
    });

    // Sort by time (tasks with time first, then by time, then tasks without time)
    return filteredTasks.sort((a, b) => {
      if (a.task_time && b.task_time) {
        return a.task_time.localeCompare(b.task_time);
      }
      if (a.task_time && !b.task_time) return -1;
      if (!a.task_time && b.task_time) return 1;
      return 0;
    });
  };

  const handleAddTask = (date: Date) => {
    setSelectedDate(date);
    setSelectedDay(date.getDay() as DayOfWeek);
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedDay(task.day_of_week as DayOfWeek);
    setSelectedDate(null);
    setShowTaskForm(true);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
    setShowTaskForm(false);
    setSelectedDay(null);
    setSelectedDate(null);
    onTasksChange?.();
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setShowTaskForm(false);
    setEditingTask(null);
    setSelectedDay(null);
    setSelectedDate(null);
    onTasksChange?.();
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setShowTaskForm(false);
    setEditingTask(null);
    setSelectedDay(null);
    setSelectedDate(null);
    onTasksChange?.();
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed } : task
      )
    );
  };

  const days = getDaysToDisplay();
  const isCurrentPeriod = days.some(d => isDateToday(d));

  // Calculate grid columns based on view mode
  const getGridCols = () => {
    switch (viewMode) {
      case 'daily':
        return 'grid-cols-1';
      case 'weekly':
        return 'grid-cols-7';
      case 'biweekly':
        return 'grid-cols-7';
      case 'monthly':
        return 'grid-cols-7';
    }
  };

  return (
    <div className="flex flex-col h-full pb-20 md:pb-0">
      {/* Header with View Mode Selector */}
      <div className="flex flex-col gap-3 mb-4">
        {/* Navigation Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={goToNext}
              className="p-3 sm:p-2 rounded-xl sm:rounded-lg bg-slate-700/50 hover:bg-slate-700 active:bg-slate-600 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToPrevious}
              className="p-3 sm:p-2 rounded-xl sm:rounded-lg bg-slate-700/50 hover:bg-slate-700 active:bg-slate-600 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white text-center flex-1 px-2">
            {getTitle()}
          </h2>

          {!isCurrentPeriod && (
            <button
              onClick={goToToday}
              className="px-3 py-2 text-sm font-medium text-violet-400 hover:text-white bg-violet-500/10 hover:bg-violet-500/20 active:bg-violet-500/30 rounded-xl sm:rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">היום</span>
            </button>
          )}
        </div>

        {/* View Mode Tabs - Scrollable on mobile */}
        <div className="flex gap-1.5 sm:gap-1 bg-slate-800/50 rounded-xl sm:rounded-lg p-1.5 sm:p-1 border border-slate-700/50 overflow-x-auto">
          {VIEW_MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setViewMode(option.value)}
              className={`flex-1 sm:flex-none px-4 sm:px-3 py-2.5 sm:py-1.5 text-sm font-medium rounded-lg sm:rounded-md transition-colors whitespace-nowrap ${
                viewMode === option.value
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white active:bg-slate-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Days Header for weekly/biweekly/monthly */}
      {viewMode !== 'daily' && (
        <div className={`grid ${getGridCols()} gap-1 mb-1`}>
          {DAYS_SHORT.map((day) => (
            <div key={day} className="text-center text-xs font-bold text-slate-500 py-1">
              {day}
            </div>
          ))}
        </div>
      )}

      {/* Calendar Grid - Horizontally scrollable on mobile for weekly/biweekly */}
      <div 
        className={`
          ${viewMode === 'daily' ? '' : 'overflow-x-auto sm:overflow-x-visible -mx-4 px-4 sm:mx-0 sm:px-0'}
          flex-1 min-h-0
        `}
      >
        <div 
          className={`
            grid ${getGridCols()} gap-1.5 
            ${viewMode === 'monthly' ? 'auto-rows-fr' : ''}
            ${viewMode === 'weekly' || viewMode === 'biweekly' ? 'min-w-[700px] sm:min-w-0' : ''}
          `}
        >
          {days.map((date, index) => {
            const dayTasks = getTasksForDate(date);
            const isToday = isDateToday(date);
            const completedCount = dayTasks.filter(t => t.completed).length;
            const dayOfWeek = date.getDay();

            // For monthly view, add empty cells for days before month starts
            if (viewMode === 'monthly' && index === 0) {
              const emptyDays = dayOfWeek;
              const emptyCells = Array.from({ length: emptyDays }, (_, i) => (
                <div key={`empty-${i}`} className="bg-slate-800/10 rounded-lg" />
              ));
              
              return (
                <>
                  {emptyCells}
                  <DayCell
                    key={date.toISOString()}
                    date={date}
                    isToday={isToday}
                    dayTasks={dayTasks}
                    completedCount={completedCount}
                    viewMode={viewMode}
                    familyMembers={familyMembers}
                    helpers={helpers}
                    categories={categories}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onToggleComplete={handleToggleComplete}
                  />
                </>
              );
            }

            return (
              <DayCell
                key={date.toISOString()}
                date={date}
                isToday={isToday}
                dayTasks={dayTasks}
                completedCount={completedCount}
                viewMode={viewMode}
                familyMembers={familyMembers}
                helpers={helpers}
                categories={categories}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onToggleComplete={handleToggleComplete}
              />
            );
          })}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && selectedDay !== null && (
        <TaskForm
          familyId={family.id}
          familyMembers={familyMembers}
          helpers={helpers}
          categories={categories}
          weekStart={selectedDate ? getWeekStartISO(selectedDate) : getWeekStartISO(currentDate)}
          dayOfWeek={selectedDay}
          task={editingTask}
          onClose={() => {
            setShowTaskForm(false);
            setSelectedDay(null);
            setSelectedDate(null);
            setEditingTask(null);
          }}
          onCreated={handleTaskCreated}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}

// Day Cell Component
interface DayCellProps {
  date: Date;
  isToday: boolean;
  dayTasks: Task[];
  completedCount: number;
  viewMode: ViewMode;
  familyMembers: User[];
  helpers: Helper[];
  categories: Category[];
  onAddTask: (date: Date) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}

function DayCell({
  date,
  isToday,
  dayTasks,
  completedCount,
  viewMode,
  familyMembers,
  helpers,
  categories,
  onAddTask,
  onEditTask,
  onToggleComplete,
}: DayCellProps) {
  const isCompact = viewMode === 'monthly' || viewMode === 'biweekly';

  return (
    <div
      className={`flex flex-col rounded-xl border transition-colors ${
        isToday
          ? 'border-violet-500/50 bg-violet-500/5'
          : 'border-slate-700/50 bg-slate-800/30'
      } ${isCompact ? 'min-h-[80px] sm:min-h-[80px]' : 'min-h-[120px] sm:min-h-0'}`}
    >
      {/* Day Header */}
      <div className={`px-2 py-2 sm:py-1.5 border-b ${isToday ? 'border-violet-500/30' : 'border-slate-700/30'}`}>
        <div className="flex items-center justify-between">
          <div className={`text-sm font-bold ${isToday ? 'text-violet-400' : 'text-slate-300'}`}>
            {format(date, 'd')}
            {viewMode === 'daily' && (
              <span className="text-slate-500 font-normal mr-2">
                {format(date, 'EEEE', { locale: he })}
              </span>
            )}
          </div>
          {dayTasks.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              completedCount === dayTasks.length
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-700/50 text-slate-400'
            }`}>
              {completedCount}/{dayTasks.length}
            </span>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className={`flex-1 p-1.5 space-y-1.5 sm:space-y-1 overflow-y-auto ${isCompact ? 'max-h-[100px]' : ''}`}>
        {dayTasks.length === 0 ? (
          <div className="text-center py-2 sm:py-1">
            <p className="text-xs sm:text-[10px] text-slate-600">אין משימות</p>
          </div>
        ) : (
          dayTasks.slice(0, isCompact ? 3 : undefined).map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              familyMembers={familyMembers}
              helpers={helpers}
              categories={categories}
              onEdit={onEditTask}
              onToggleComplete={onToggleComplete}
            />
          ))
        )}
        {isCompact && dayTasks.length > 3 && (
          <p className="text-[10px] text-slate-500 text-center">+{dayTasks.length - 3} עוד</p>
        )}
      </div>

      {/* Add Task Button */}
      <div className="p-1.5 pt-0">
        <button
          onClick={() => onAddTask(date)}
          className={`w-full py-2 sm:py-1 rounded-lg border border-dashed transition-colors flex items-center justify-center active:scale-95 ${
            isToday
              ? 'border-violet-500/50 hover:border-violet-400 active:border-violet-400 text-violet-400 hover:bg-violet-500/10 active:bg-violet-500/20'
              : 'border-slate-700 hover:border-slate-500 active:border-slate-500 text-slate-500 hover:text-slate-300 active:text-slate-300 hover:bg-slate-700/30 active:bg-slate-700/50'
          }`}
        >
          <Plus className="w-4 h-4 sm:w-3 sm:h-3" />
        </button>
      </div>
    </div>
  );
}
