'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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
import type { Task, User, Category, DayOfWeek } from '@/types';
import { DAYS_SHORT } from '@/types';

interface WeekViewProps {
  initialTasks: Task[];
  familyMembers: User[];
  categories: Category[];
  familyId: string;
}

export default function WeekView({
  initialTasks,
  familyMembers,
  categories,
  familyId,
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
    return tasks.filter(
      (task) => task.day_of_week === day && task.week_start === weekStart
    );
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

  return (
    <div className="flex flex-col h-full">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-white">
          {formatWeekRange(weekStart)}
        </h2>

        {!isCurrentWeek(weekStart) && (
          <button
            onClick={goToCurrentWeek}
            className="px-3 py-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 rounded-lg transition-colors"
          >
            Today
          </button>
        )}
        {isCurrentWeek(weekStart) && <div className="w-16" />}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 flex-1 min-h-0">
        {DAYS_SHORT.map((day, index) => {
          const dayTasks = getTasksForDay(index as DayOfWeek);
          const isToday = isDayToday(weekStart, index);

          return (
            <div
              key={day}
              className={`flex flex-col rounded-xl border ${
                isToday
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : 'border-slate-800 bg-slate-800/30'
              }`}
            >
              {/* Day Header */}
              <div
                className={`px-2 sm:px-3 py-2 sm:py-3 border-b ${
                  isToday ? 'border-violet-500/30' : 'border-slate-800'
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-xs sm:text-sm font-medium ${
                      isToday ? 'text-violet-400' : 'text-slate-500'
                    }`}
                  >
                    {day}
                  </div>
                  <div
                    className={`text-lg sm:text-2xl font-bold ${
                      isToday ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {formatDayDate(weekStart, index)}
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="flex-1 p-1.5 sm:p-2 space-y-1.5 sm:space-y-2 overflow-y-auto">
                {dayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    familyMembers={familyMembers}
                    categories={categories}
                    onEdit={handleEditTask}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>

              {/* Add Task Button */}
              <div className="p-1.5 sm:p-2 pt-0">
                <button
                  onClick={() => handleAddTask(index as DayOfWeek)}
                  className="w-full py-1.5 sm:py-2 rounded-lg border border-dashed border-slate-700 hover:border-violet-500/50 text-slate-500 hover:text-violet-400 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Add</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && selectedDay !== null && (
        <TaskForm
          familyId={familyId}
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
