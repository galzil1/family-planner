'use client';

import { createClient } from '@/lib/supabase';
import { Check, RotateCcw } from 'lucide-react';
import type { Task, User, Category } from '@/types';

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
    
    // Optimistic update
    onToggleComplete(task.id, newCompleted);

    // Update in database
    await supabase
      .from('tasks')
      .update({ completed: newCompleted })
      .eq('id', task.id);
  };

  return (
    <div
      className={`group relative rounded-xl p-2.5 sm:p-3 cursor-pointer transition-all ${
        task.completed
          ? 'bg-slate-800/20 opacity-60 hover:opacity-80'
          : 'bg-slate-800/50 hover:bg-slate-700/50 shadow-sm hover:shadow-md'
      }`}
      onClick={() => onEdit(task)}
    >
      {/* Category indicator - on the right for RTL */}
      {category && (
        <div
          className="absolute top-0 right-0 w-1 h-full rounded-r-xl"
          style={{ backgroundColor: category.color }}
        />
      )}

      <div className="flex items-start gap-2.5">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/30'
              : 'border-slate-600 hover:border-violet-500 hover:bg-violet-500/10'
          }`}
        >
          {task.completed && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {category && (
              <span className="text-sm sm:text-base">{category.icon}</span>
            )}
            <p
              className={`text-xs sm:text-sm font-medium leading-tight ${
                task.completed ? 'text-slate-500 line-through' : 'text-white'
              }`}
            >
              {task.title}
            </p>
          </div>

          {/* Assignee */}
          {assignedUser && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: assignedUser.avatar_color }}
              >
                {assignedUser.display_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400 truncate">
                {assignedUser.display_name}
              </span>
            </div>
          )}

          {/* Recurring indicator */}
          {task.is_recurring && (
            <div className="flex items-center gap-1 mt-1.5">
              <RotateCcw className="w-3 h-3 text-violet-400" />
              <span className="text-[10px] sm:text-xs text-violet-400">חוזר</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
