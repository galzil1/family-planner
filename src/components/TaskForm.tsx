'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { X, Trash2, Loader2, Clock, Save, Plus, RotateCcw } from 'lucide-react';
import type { Task, User, Category, DayOfWeek, RecurrenceType } from '@/types';
import { DAYS_SHORT, RECURRENCE_OPTIONS } from '@/types';

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
  const [taskTime, setTaskTime] = useState(task?.task_time || '');
  const [recurrence, setRecurrence] = useState<RecurrenceType>(task?.recurrence_type || 'none');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(task?.day_of_week ?? dayOfWeek);

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
      is_recurring: recurrence !== 'none',
      recurrence_type: recurrence,
      task_time: taskTime || null,
    };

    if (isEditing && task) {
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', task.id)
        .select()
        .single();

      if (!error && data) {
        onUpdated(data);
      }
    } else {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, completed: false })
        .select()
        .single();

      if (!error && data) {
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
    onDeleted(task.id);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Full screen on mobile, centered modal on desktop */}
      <div className="w-full sm:max-w-md bg-slate-800 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[95vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-slate-700 bg-slate-800 rounded-t-3xl sm:rounded-t-2xl">
          <h3 className="text-lg font-bold text-white">
            {isEditing ? 'עריכת משימה' : 'משימה חדשה'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 active:bg-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              כותרת *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="מה צריך לעשות?"
              required
              autoFocus
            />
          </div>

          {/* Day Selection - Single Select */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              יום
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_SHORT.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(index)}
                  className={`py-3 text-sm font-bold rounded-xl transition-colors active:scale-95 ${
                    selectedDay === index
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              שעה
            </label>
            <div className="relative">
              <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="time"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                className="w-full pr-12 pl-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                dir="ltr"
              />
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <RotateCcw className="w-4 h-4 inline ml-1" />
              חזרה
            </label>
            <div className="flex flex-wrap gap-2">
              {RECURRENCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRecurrence(option.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors active:scale-95 ${
                    recurrence === option.value
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              אחראי
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAssignedTo('')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors active:scale-95 ${
                  !assignedTo
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                }`}
              >
                כולם
              </button>
              {familyMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setAssignedTo(member.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors active:scale-95 ${
                    assignedTo === member.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: member.avatar_color }}
                  >
                    {member.display_name.charAt(0).toUpperCase()}
                  </div>
                  {member.display_name}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              קטגוריה
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryId('')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors active:scale-95 ${
                  !categoryId
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                }`}
              >
                ללא
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors active:scale-95 ${
                    categoryId === cat.id
                      ? 'text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                  }`}
                  style={categoryId === cat.id ? { backgroundColor: cat.color } : undefined}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              הערות
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              placeholder="פרטים נוספים..."
              rows={3}
            />
          </div>
        </form>

        {/* Actions - Fixed at bottom */}
        <div className="sticky bottom-0 flex gap-3 p-5 pt-4 border-t border-slate-700 bg-slate-800 safe-area-pb">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 active:scale-95 ${
                deleteConfirm
                  ? 'bg-red-600 text-white'
                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 active:bg-red-500/30'
              }`}
            >
              <Trash2 className="w-5 h-5" />
              {deleteConfirm ? 'אישור מחיקה' : 'מחק'}
            </button>
          )}

          <div className="flex-1" />

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-600 active:bg-slate-500 transition-colors active:scale-95"
          >
            ביטול
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="px-6 py-3 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-500 active:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isEditing ? (
              <Save className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {isEditing ? 'שמור' : 'צור'}
          </button>
        </div>
      </div>
    </div>
  );
}
