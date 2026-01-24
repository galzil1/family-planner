'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { X, Trash2, Loader2, RotateCcw, Bell } from 'lucide-react';
import type { Task, User, Category, DayOfWeek } from '@/types';
import { DAYS_OF_WEEK } from '@/types';

interface TaskFormProps {
  familyId: string;
  familyMembers: User[];
  categories: Category[];
  weekStart: string;
  dayOfWeek: DayOfWeek;
  task: Task | null;
  onClose: () => void;
  onCreated: (task: Task) => void;
  onUpdated: (task: Task) => void;
  onDeleted: (taskId: string) => void;
}

export default function TaskForm({
  familyId,
  familyMembers,
  categories,
  weekStart,
  dayOfWeek,
  task,
  onClose,
  onCreated,
  onUpdated,
  onDeleted,
}: TaskFormProps) {
  const supabase = createClient();
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || '');
  const [categoryId, setCategoryId] = useState(task?.category_id || '');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    (task?.day_of_week as DayOfWeek) ?? dayOfWeek
  );
  const [isRecurring, setIsRecurring] = useState(task?.is_recurring || false);
  const [reminderTime, setReminderTime] = useState(task?.reminder_time || '');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    const taskData = {
      family_id: familyId,
      title: title.trim(),
      notes: notes.trim() || null,
      assigned_to: assignedTo || null,
      category_id: categoryId || null,
      day_of_week: selectedDay,
      week_start: weekStart,
      is_recurring: isRecurring,
      reminder_time: reminderTime || null,
    };

    if (isEditing && task) {
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', task.id)
        .select()
        .single();

      if (!error && data) {
        // If marking as recurring, also create a template
        if (isRecurring && !task.is_recurring) {
          await supabase.from('recurring_templates').insert({
            family_id: familyId,
            title: title.trim(),
            notes: notes.trim() || null,
            assigned_to: assignedTo || null,
            category_id: categoryId || null,
            day_of_week: selectedDay,
            reminder_time: reminderTime || null,
            is_active: true,
          });
        }
        onUpdated(data);
      }
    } else {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, completed: false })
        .select()
        .single();

      if (!error && data) {
        // If recurring, also create a template
        if (isRecurring) {
          await supabase.from('recurring_templates').insert({
            family_id: familyId,
            title: title.trim(),
            notes: notes.trim() || null,
            assigned_to: assignedTo || null,
            category_id: categoryId || null,
            day_of_week: selectedDay,
            reminder_time: reminderTime || null,
            is_active: true,
          });
        }
        onCreated(data);
      }
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!task) return;

    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setLoading(true);

    await supabase.from('tasks').delete().eq('id', task.id);

    // If recurring, also delete the template
    if (task.is_recurring) {
      await supabase
        .from('recurring_templates')
        .delete()
        .eq('family_id', familyId)
        .eq('title', task.title)
        .eq('day_of_week', task.day_of_week);
    }

    onDeleted(task.id);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>

          {/* Day Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Day
            </label>
            <div className="grid grid-cols-7 gap-1">
              {DAYS_OF_WEEK.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(index as DayOfWeek)}
                  className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                    selectedDay === index
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Assigned To
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAssignedTo('')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  !assignedTo
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Anyone
              </button>
              {familyMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setAssignedTo(member.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    assignedTo === member.id
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: member.avatar_color }}
                  >
                    {member.display_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{member.display_name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryId('')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  !categoryId
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                None
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    categoryId === cat.id
                      ? 'text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                  style={
                    categoryId === cat.id
                      ? { backgroundColor: cat.color }
                      : undefined
                  }
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
              placeholder="Add any extra details..."
              rows={2}
            />
          </div>

          {/* Recurring & Reminder */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isRecurring
                  ? 'bg-violet-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Recurring
            </button>

            <div className="flex-1">
              <div className="relative">
                <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="Reminder"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  deleteConfirm
                    ? 'bg-red-500 text-white'
                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {deleteConfirm ? 'Confirm Delete' : 'Delete'}
              </button>
            )}

            <div className="flex-1" />

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
