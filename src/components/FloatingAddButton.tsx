'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskForm from './TaskForm';
import { getWeekStartISO } from '@/lib/date-utils';
import type { User, Category, Task, DayOfWeek } from '@/types';

interface FloatingAddButtonProps {
  familyId: string;
  familyMembers: User[];
  categories: Category[];
  onTaskCreated: (task: Task) => void;
}

export default function FloatingAddButton({
  familyId,
  familyMembers,
  categories,
  onTaskCreated,
}: FloatingAddButtonProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const today = new Date().getDay() as DayOfWeek;
  const weekStart = getWeekStartISO();

  const handleTaskCreated = (task: Task) => {
    onTaskCreated(task);
    setShowTaskForm(false);
  };

  return (
    <>
      {/* Floating Action Button - positioned above bottom nav on mobile */}
      <button
        onClick={() => setShowTaskForm(true)}
        className="fixed bottom-24 md:bottom-6 left-4 md:left-6 z-40 w-14 h-14 md:w-14 md:h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 active:scale-95 md:hover:scale-110 transition-all flex items-center justify-center group"
        aria-label="הוסף משימה"
      >
        <Plus className="w-7 h-7 text-white md:group-hover:rotate-90 transition-transform" />
      </button>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          familyId={familyId}
          familyMembers={familyMembers}
          categories={categories}
          weekStart={weekStart}
          dayOfWeek={today}
          task={null}
          onClose={() => setShowTaskForm(false)}
          onCreated={handleTaskCreated}
          onUpdated={() => {}}
          onDeleted={() => {}}
        />
      )}
    </>
  );
}
