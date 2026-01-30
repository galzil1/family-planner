'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { X, Trash2, Loader2, RotateCcw, Bell, Save, Plus, Calendar, ChevronDown } from 'lucide-react';
import type { Task, User, Category, DayOfWeek, RecurrenceType } from '@/types';
import { DAYS_OF_WEEK, DAYS_SHORT, RECURRENCE_LABELS } from '@/types';

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
  const [reminderTime, setReminderTime] = useState(task?.reminder_time || '');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  // Recurrence state
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    task?.recurrence_type || 'none'
  );
  const [recurrenceInterval, setRecurrenceInterval] = useState(
    task?.recurrence_interval || 1
  );
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>(
    task?.recurrence_days || [dayOfWeek]
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    task?.recurrence_end_date || ''
  );
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(
    task?.recurrence_type !== 'none' && task?.recurrence_type !== undefined
  );

  const toggleRecurrenceDay = (day: number) => {
    if (recurrenceDays.includes(day)) {
      if (recurrenceDays.length > 1) {
        setRecurrenceDays(recurrenceDays.filter(d => d !== day));
      }
    } else {
      setRecurrenceDays([...recurrenceDays, day].sort());
    }
  };

  const getRecurrenceSummary = (): string => {
    if (recurrenceType === 'none') return '';
    
    let summary = '';
    const interval = recurrenceInterval > 1 ? `כל ${recurrenceInterval} ` : 'כל ';
    
    switch (recurrenceType) {
      case 'daily':
        summary = recurrenceInterval === 1 ? 'כל יום' : `כל ${recurrenceInterval} ימים`;
        break;
      case 'weekly':
        summary = recurrenceInterval === 1 ? 'כל שבוע' : `${interval}שבועות`;
        summary += ` ביום ${DAYS_OF_WEEK[selectedDay]}`;
        break;
      case 'monthly':
        summary = recurrenceInterval === 1 ? 'כל חודש' : `${interval}חודשים`;
        break;
      case 'custom':
        const days = recurrenceDays.map(d => DAYS_SHORT[d]).join(', ');
        summary = `בימים: ${days}`;
        if (recurrenceInterval > 1) {
          summary += ` (כל ${recurrenceInterval} שבועות)`;
        }
        break;
    }
    
    if (recurrenceEndDate) {
      summary += ` עד ${new Date(recurrenceEndDate).toLocaleDateString('he-IL')}`;
    }
    
    return summary;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    const isRecurring = recurrenceType !== 'none';
    
    const taskData = {
      family_id: familyId,
      title: title.trim(),
      notes: notes.trim() || null,
      assigned_to: assignedTo || null,
      category_id: categoryId || null,
      day_of_week: selectedDay,
      week_start: weekStart,
      is_recurring: isRecurring,
      recurrence_type: recurrenceType,
      recurrence_interval: recurrenceInterval,
      recurrence_days: recurrenceType === 'custom' ? recurrenceDays : null,
      recurrence_end_date: recurrenceEndDate || null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900 rounded-t-3xl">
          <h3 className="text-xl font-bold text-white">
            {isEditing ? 'עריכת משימה' : 'משימה חדשה'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              כותרת *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              placeholder="מה צריך לעשות?"
              required
              autoFocus
            />
          </div>

          {/* Day Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              יום
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(index as DayOfWeek)}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                    selectedDay === index
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              אחראי
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAssignedTo('')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  !assignedTo
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                כולם
              </button>
              {familyMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setAssignedTo(member.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    assignedTo === member.id
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
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
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              קטגוריה
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryId('')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  !categoryId
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                ללא
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    categoryId === cat.id
                      ? 'text-white shadow-lg'
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
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              הערות
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
              placeholder="פרטים נוספים..."
              rows={2}
            />
          </div>

          {/* Recurrence Section */}
          <div className="border border-slate-700/50 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRecurrenceOptions(!showRecurrenceOptions)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <RotateCcw className={`w-5 h-5 ${recurrenceType !== 'none' ? 'text-violet-400' : 'text-slate-500'}`} />
                <div className="text-right">
                  <span className={`font-medium ${recurrenceType !== 'none' ? 'text-violet-400' : 'text-slate-300'}`}>
                    {recurrenceType !== 'none' ? 'חזרה פעילה' : 'הגדרת חזרה'}
                  </span>
                  {recurrenceType !== 'none' && (
                    <p className="text-xs text-slate-400 mt-0.5">{getRecurrenceSummary()}</p>
                  )}
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showRecurrenceOptions ? 'rotate-180' : ''}`} />
            </button>

            {showRecurrenceOptions && (
              <div className="p-4 space-y-4 bg-slate-800/20">
                {/* Recurrence Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">
                    סוג חזרה
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(Object.keys(RECURRENCE_LABELS) as RecurrenceType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRecurrenceType(type)}
                        className={`py-2 text-xs font-medium rounded-lg transition-all ${
                          recurrenceType === type
                            ? 'bg-violet-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {RECURRENCE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>

                {recurrenceType !== 'none' && (
                  <>
                    {/* Interval */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">
                        תדירות
                      </label>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-300 text-sm">כל</span>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={recurrenceInterval}
                          onChange={(e) => setRecurrenceInterval(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                        <span className="text-slate-300 text-sm">
                          {recurrenceType === 'daily' && (recurrenceInterval === 1 ? 'יום' : 'ימים')}
                          {recurrenceType === 'weekly' && (recurrenceInterval === 1 ? 'שבוע' : 'שבועות')}
                          {recurrenceType === 'monthly' && (recurrenceInterval === 1 ? 'חודש' : 'חודשים')}
                          {recurrenceType === 'custom' && (recurrenceInterval === 1 ? 'שבוע' : 'שבועות')}
                        </span>
                      </div>
                    </div>

                    {/* Custom Days Selection */}
                    {recurrenceType === 'custom' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2">
                          בחר ימים
                        </label>
                        <div className="grid grid-cols-7 gap-1.5">
                          {DAYS_SHORT.map((day, index) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleRecurrenceDay(index)}
                              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                                recurrenceDays.includes(index)
                                  ? 'bg-violet-500 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* End Date */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">
                        תאריך סיום (אופציונלי)
                      </label>
                      <div className="relative">
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="date"
                          value={recurrenceEndDate}
                          onChange={(e) => setRecurrenceEndDate(e.target.value)}
                          className="w-full pr-10 pl-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              תזכורת
            </label>
            <div className="relative">
              <Bell className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                dir="ltr"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  deleteConfirm
                    ? 'bg-red-500 text-white'
                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {deleteConfirm ? 'אישור מחיקה' : 'מחק'}
              </button>
            )}

            <div className="flex-1" />

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all"
            >
              ביטול
            </button>

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-bold hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-violet-500/25"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditing ? (
                <Save className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isEditing ? 'שמור' : 'צור משימה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
