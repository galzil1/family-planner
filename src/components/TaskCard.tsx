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
      className={`group relative rounded-lg p-2 sm:p-2.5 cursor-pointer transition-all ${
        task.completed
          ? 'bg-slate-800/30 opacity-60'
          : 'bg-slate-800/50 hover:bg-slate-800'
      }`}
      onClick={() => onEdit(task)}
    >
      {/* Category indicator */}
      {category && (
        <div
          className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
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
          className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-green-500 border-green-500'
              : 'border-slate-600 hover:border-violet-500'
          }`}
        >
          {task.completed && <Check className="w-3 h-3 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {category && (
              <span className="text-xs sm:text-sm">{category.icon}</span>
            )}
            <p
              className={`text-xs sm:text-sm font-medium truncate ${
                task.completed ? 'text-slate-500 line-through' : 'text-white'
              }`}
            >
              {task.title}
            </p>
          </div>

          {/* Assignee */}
          {assignedUser && (
            <div className="flex items-center gap-1.5 mt-1">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                style={{ backgroundColor: assignedUser.avatar_color }}
              >
                {assignedUser.display_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] sm:text-xs text-slate-500 truncate">
                {assignedUser.display_name}
              </span>
            </div>
          )}

          {/* Recurring indicator */}
          {task.is_recurring && (
            <div className="flex items-center gap-1 mt-1">
              <RotateCcw className="w-3 h-3 text-violet-400" />
              <span className="text-[10px] text-violet-400">Recurring</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
