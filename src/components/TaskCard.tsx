'use client';

import { createClient } from '@/lib/supabase';
import { Check, Layers, Clock, RotateCcw } from 'lucide-react';
import type { Task, User, Category } from '@/types';
import { DAYS_SHORT, RECURRENCE_OPTIONS } from '@/types';

interface TaskCardProps {
  task: Task;
  familyMembers: User[];
  categories: Category[];
  onEdit: (task: Task) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}

export default function TaskCard({
  task,
  familyMembers,
  categories,
  onEdit,
  onToggleComplete,
}: TaskCardProps) {
  const supabase = createClient();
  const assignedUser = familyMembers.find((m) => m.id === task.assigned_to);
  const category = categories.find((c) => c.id === task.category_id);

  const handleToggle = async () => {
    const newCompleted = !task.completed;
    onToggleComplete(task.id, newCompleted);
    await supabase
      .from('tasks')
      .update({ completed: newCompleted })
      .eq('id', task.id);
  };

  // Check if this is a multi-day task
  const isMultiDay = task.days_of_week && task.days_of_week.length > 1;
  const multiDayLabel = isMultiDay
    ? task.days_of_week!.length === 7
      ? 'כל השבוע'
      : task.days_of_week!.map(d => DAYS_SHORT[d]).join(' ')
    : null;

  return (
    <div
      className={`group relative rounded-lg p-2 cursor-pointer transition-colors ${
        task.completed
          ? 'bg-slate-700/20 opacity-50'
          : 'bg-slate-700/40 hover:bg-slate-700/60'
      }`}
      onClick={() => onEdit(task)}
    >
      {/* Category indicator */}
      {category && (
        <div
          className="absolute top-0 right-0 w-1 h-full rounded-r-lg"
          style={{ backgroundColor: category.color }}
        />
      )}

      <div className="flex items-start gap-2">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-slate-500 hover:border-violet-400'
          }`}
        >
          {task.completed && <Check className="w-3 h-3 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium leading-tight ${
            task.completed ? 'text-slate-500 line-through' : 'text-white'
          }`}>
            {category && <span className="ml-1">{category.icon}</span>}
            {task.title}
          </p>

          {/* Time & Assignee row */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Time */}
            {task.task_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-amber-400 font-medium" dir="ltr">
                  {task.task_time}
                </span>
              </div>
            )}
            
            {/* Assignee */}
            {assignedUser && (
              <div className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ backgroundColor: assignedUser.avatar_color }}
                >
                  {assignedUser.display_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  {assignedUser.display_name}
                </span>
              </div>
            )}
          </div>

          {/* Multi-day indicator */}
          {multiDayLabel && (
            <div className="flex items-center gap-1 mt-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] text-cyan-400">{multiDayLabel}</span>
            </div>
          )}

          {/* Recurrence indicator */}
          {task.recurrence_type && task.recurrence_type !== 'none' && (
            <div className="flex items-center gap-1 mt-1">
              <RotateCcw className="w-3 h-3 text-violet-400" />
              <span className="text-[10px] text-violet-400">
                {RECURRENCE_OPTIONS.find(o => o.value === task.recurrence_type)?.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
