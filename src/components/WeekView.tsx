'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import {
  getWeekStartISO,
  getNextWeekStart,
  getPreviousWeekStart,
  formatWeekRange,
  formatDayDate,
  isDayToday,
  isCurrentWeek,
} from '@/lib/date-utils';
import type { Task, User, Family, Category, DayOfWeek } from '@/types';
import { DAYS_SHORT } from '@/types';

interface WeekViewProps {
  user: User;
  family: Family;
  initialTasks: Task[];
  familyMembers: User[];
  categories: Category[];
}

export default function WeekView({
  user,
  family,
  initialTasks,
  familyMembers,
  categories,
}: WeekViewProps) {
  const [weekStart, setWeekStart] = useState(getWeekStartISO());
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const goToNextWeek = () => {
    setWeekStart(getNextWeekStart(weekStart));
  };

  const goToPreviousWeek = () => {
    setWeekStart(getPreviousWeekStart(weekStart));
  };

  const goToCurrentWeek = () => {
    setWeekStart(getWeekStartISO());
  };

  const getTasksForDay = (day: DayOfWeek) => {
    return tasks.filter((task) => {
      if (task.week_start !== weekStart) return false;
      if (task.days_of_week && task.days_of_week.length > 0) {
        return task.days_of_week.includes(day);
      }
      return task.day_of_week === day;
    });
  };

  const handleAddTask = (day: DayOfWeek) => {
    setSelectedDay(day);
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedDay(task.day_of_week as DayOfWeek);
    setShowTaskForm(true);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
    setShowTaskForm(false);
    setSelectedDay(null);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setShowTaskForm(false);
    setEditingTask(null);
    setSelectedDay(null);
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setShowTaskForm(false);
    setEditingTask(null);
    setSelectedDay(null);
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed } : task
      )
    );
  };

  const weekTasks = tasks.filter(t => t.week_start === weekStart);
  const totalTasks = weekTasks.length;
  const completedTasks = weekTasks.filter(t => t.completed).length;

  return (
    <div className="flex flex-col h-full">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
        <div className="flex items-center gap-1">
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="שבוע הבא"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="שבוע קודם"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-base sm:text-lg font-bold text-white">
            {formatWeekRange(weekStart)}
          </h2>
          {totalTasks > 0 && (
            <p className="text-xs text-slate-400">
              {completedTasks}/{totalTasks} הושלמו
            </p>
          )}
        </div>

        {!isCurrentWeek(weekStart) ? (
          <button
            onClick={goToCurrentWeek}
            className="px-3 py-1.5 text-sm font-medium text-violet-400 hover:text-white bg-violet-500/10 hover:bg-violet-500/20 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            היום
          </button>
        ) : (
          <div className="w-16" />
        )}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 flex-1 min-h-0">
        {DAYS_SHORT.map((day, index) => {
          const dayTasks = getTasksForDay(index as DayOfWeek);
          const isToday = isDayToday(weekStart, index);
          const completedCount = dayTasks.filter(t => t.completed).length;

          return (
            <div
              key={day}
              className={`flex flex-col rounded-xl border transition-colors ${
                isToday
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : 'border-slate-700/50 bg-slate-800/30'
              }`}
            >
              {/* Day Header */}
              <div className={`px-2 py-2 sm:py-3 border-b ${isToday ? 'border-violet-500/30' : 'border-slate-700/30'}`}>
                <div className="text-center">
                  <div className={`text-xs font-bold mb-0.5 ${isToday ? 'text-violet-400' : 'text-slate-500'}`}>
                    {day}
                  </div>
                  <div className={`text-lg sm:text-xl font-bold ${isToday ? 'text-white' : 'text-slate-300'}`}>
                    {formatDayDate(weekStart, index)}
                  </div>
                  {dayTasks.length > 0 && (
                    <div className="mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        completedCount === dayTasks.length
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-700/50 text-slate-400'
                      }`}>
                        {completedCount}/{dayTasks.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks */}
              <div className="flex-1 p-1.5 sm:p-2 space-y-1.5 overflow-y-auto">
                {dayTasks.length === 0 ? (
                  <div className="text-center py-2">
                    <p className="text-[10px] text-slate-600">אין משימות</p>
                  </div>
                ) : (
                  dayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      familyMembers={familyMembers}
                      categories={categories}
                      onEdit={handleEditTask}
                      onToggleComplete={handleToggleComplete}
                    />
                  ))
                )}
              </div>

              {/* Add Task Button */}
              <div className="p-1.5 sm:p-2 pt-0">
                <button
                  onClick={() => handleAddTask(index as DayOfWeek)}
                  className={`w-full py-1.5 sm:py-2 rounded-lg border border-dashed transition-colors flex items-center justify-center ${
                    isToday
                      ? 'border-violet-500/50 hover:border-violet-400 text-violet-400 hover:bg-violet-500/10'
                      : 'border-slate-700 hover:border-slate-500 text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && selectedDay !== null && (
        <TaskForm
          familyId={family.id}
          familyMembers={familyMembers}
          categories={categories}
          weekStart={weekStart}
          dayOfWeek={selectedDay}
          task={editingTask}
          onClose={() => {
            setShowTaskForm(false);
            setSelectedDay(null);
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
