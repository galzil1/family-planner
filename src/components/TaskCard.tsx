'use client';

import { createClient } from '@/lib/supabase';
import { Check, Clock, RotateCcw } from 'lucide-react';
import type { Task, User, Category, Helper } from '@/types';
import { RECURRENCE_OPTIONS } from '@/types';

interface TaskCardProps {
  task: Task;
  familyMembers: User[];
  helpers?: Helper[];
  categories: Category[];
  /** When in a day cell, the date of that cell (for recurrence scope when editing) */
  occurrenceDate?: Date | null;
  onEdit: (task: Task, occurrenceDate?: Date | null) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}

export default function TaskCard({
  task,
  familyMembers,
  helpers = [],
  categories,
  occurrenceDate = null,
  onEdit,
  onToggleComplete,
}: TaskCardProps) {
  const supabase = createClient();
  const assignedUser = familyMembers.find((m) => m.id === task.assigned_to);
  const assignedHelper = helpers.find((h) => h.id === task.helper_id);
  const category = categories.find((c) => c.id === task.category_id);

  // Get assignee info (either user or helper)
  const assignee = assignedUser 
    ? { name: assignedUser.display_name, color: assignedUser.avatar_color, isHelper: false }
    : assignedHelper 
    ? { name: assignedHelper.name, color: assignedHelper.avatar_color, isHelper: true }
    : null;

  const handleToggle = async () => {
    const newCompleted = !task.completed;
    onToggleComplete(task.id, newCompleted);
    await supabase
      .from('tasks')
      .update({ completed: newCompleted })
      .eq('id', task.id);
  };

  return (
    <div
      className={`group relative rounded-lg p-2 cursor-pointer transition-colors ${
        task.completed
          ? 'bg-slate-700/20 opacity-50'
          : 'bg-slate-700/40 hover:bg-slate-700/60'
      }`}
      onClick={() => onEdit(task, occurrenceDate)}
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
            
            {/* Assignee (user or helper) */}
            {assignee && (
              <div className="flex items-center gap-1">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${
                    assignee.isHelper ? 'ring-1 ring-amber-400' : ''
                  }`}
                  style={{ backgroundColor: assignee.color }}
                >
                  {assignee.name.charAt(0).toUpperCase()}
                </div>
                <span className={`text-[10px] truncate ${
                  assignee.isHelper ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {assignee.name}
                </span>
              </div>
            )}
          </div>

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
