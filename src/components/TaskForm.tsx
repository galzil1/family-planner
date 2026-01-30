'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { X, Trash2, Loader2, RotateCcw, Bell, Save, Plus, Calendar, ChevronDown, CheckSquare } from 'lucide-react';
import type { Task, User, Category, DayOfWeek, RecurrenceType, DaySelectionMode } from '@/types';
import { DAYS_OF_WEEK, DAYS_SHORT, RECURRENCE_LABELS, DAY_SELECTION_LABELS } from '@/types';

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

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

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

  const getInitialDaySelectionMode = (): DaySelectionMode => {
    if (!task) return 'single';
    const days = task.days_of_week || [task.day_of_week];
    if (days.length === 7) return 'all';
    if (days.length > 1) return 'multiple';
    return 'single';
  };

  const getInitialSelectedDays = (): number[] => {
    if (!task) return [dayOfWeek];
    return task.days_of_week || [task.day_of_week];
  };

  const [title, setTitle] = useState(task?.title || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || '');
  const [categoryId, setCategoryId] = useState(task?.category_id || '');
  const [reminderTime, setReminderTime] = useState(task?.reminder_time || '');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  const [daySelectionMode, setDaySelectionMode] = useState<DaySelectionMode>(getInitialDaySelectionMode());
  const [selectedDays, setSelectedDays] = useState<number[]>(getInitialSelectedDays());
  
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

  const handleDayModeChange = (mode: DaySelectionMode) => {
    setDaySelectionMode(mode);
    if (mode === 'all') {
      setSelectedDays([...ALL_DAYS]);
    } else if (mode === 'single' && selectedDays.length > 1) {
      setSelectedDays([selectedDays[0]]);
    }
  };

  const toggleDay = (day: number) => {
    if (daySelectionMode === 'single') {
      setSelectedDays([day]);
    } else if (daySelectionMode === 'multiple') {
      if (selectedDays.includes(day)) {
        if (selectedDays.length > 1) {
          setSelectedDays(selectedDays.filter(d => d !== day));
        }
      } else {
        setSelectedDays([...selectedDays, day].sort());
      }
    }
  };

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

  const getDaysSummary = (): string => {
    if (daySelectionMode === 'all') return 'כל השבוע';
    if (selectedDays.length === 1) return DAYS_OF_WEEK[selectedDays[0]];
    return selectedDays.map(d => DAYS_SHORT[d]).join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    const isRecurring = recurrenceType !== 'none';
    const daysToSave = daySelectionMode === 'all' ? ALL_DAYS : selectedDays;
    
    const taskData = {
      family_id: familyId,
      title: title.trim(),
      notes: notes.trim() || null,
      assigned_to: assignedTo || null,
      category_id: categoryId || null,
      day_of_week: daysToSave[0],
      days_of_week: daysToSave,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-slate-700 bg-slate-800 rounded-t-2xl">
          <h3 className="text-lg font-bold text-white">
            {isEditing ? 'עריכת משימה' : 'משימה חדשה'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              כותרת *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="מה צריך לעשות?"
              required
              autoFocus
            />
          </div>

          {/* Day Selection */}
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">ימים</span>
              <span className="text-xs text-slate-500">({getDaysSummary()})</span>
            </div>
            
            {/* Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 mb-2">
              {(Object.keys(DAY_SELECTION_LABELS) as DaySelectionMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleDayModeChange(mode)}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    daySelectionMode === mode
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {DAY_SELECTION_LABELS[mode]}
                </button>
              ))}
            </div>

            {/* Day Buttons */}
            <div className="grid grid-cols-7 gap-1">
              {DAYS_SHORT.map((day, index) => {
                const isSelected = selectedDays.includes(index);
                const isDisabled = daySelectionMode === 'all';
                
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index)}
                    disabled={isDisabled}
                    className={`py-2 text-xs font-bold rounded-md transition-colors ${
                      isSelected
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    } ${isDisabled ? 'cursor-not-allowed' : ''}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              אחראי
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setAssignedTo('')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !assignedTo
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                כולם
              </button>
              {familyMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setAssignedTo(member.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    assignedTo === member.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
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
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              קטגוריה
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCategoryId('')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !categoryId
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                ללא
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    categoryId === cat.id
                      ? 'text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
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
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              הערות
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              placeholder="פרטים נוספים..."
              rows={2}
            />
          </div>

          {/* Recurrence Section */}
          <div className="bg-slate-700/30 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRecurrenceOptions(!showRecurrenceOptions)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className={`w-4 h-4 ${recurrenceType !== 'none' ? 'text-violet-400' : 'text-slate-500'}`} />
                <span className={`text-sm font-medium ${recurrenceType !== 'none' ? 'text-violet-400' : 'text-slate-300'}`}>
                  {recurrenceType !== 'none' ? 'חזרה פעילה' : 'הגדרת חזרה'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showRecurrenceOptions ? 'rotate-180' : ''}`} />
            </button>

            {showRecurrenceOptions && (
              <div className="px-3 pb-3 space-y-3">
                {/* Recurrence Type */}
                <div className="grid grid-cols-5 gap-1">
                  {(Object.keys(RECURRENCE_LABELS) as RecurrenceType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRecurrenceType(type)}
                      className={`py-1.5 text-[10px] font-medium rounded-md transition-colors ${
                        recurrenceType === type
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {RECURRENCE_LABELS[type]}
                    </button>
                  ))}
                </div>

                {recurrenceType !== 'none' && (
                  <>
                    {/* Interval */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-300">כל</span>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <span className="text-sm text-slate-300">
                        {recurrenceType === 'daily' && (recurrenceInterval === 1 ? 'יום' : 'ימים')}
                        {recurrenceType === 'weekly' && (recurrenceInterval === 1 ? 'שבוע' : 'שבועות')}
                        {recurrenceType === 'monthly' && (recurrenceInterval === 1 ? 'חודש' : 'חודשים')}
                        {recurrenceType === 'custom' && (recurrenceInterval === 1 ? 'שבוע' : 'שבועות')}
                      </span>
                    </div>

                    {/* Custom Days */}
                    {recurrenceType === 'custom' && (
                      <div className="grid grid-cols-7 gap-1">
                        {DAYS_SHORT.map((day, index) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleRecurrenceDay(index)}
                            className={`py-1.5 text-xs font-bold rounded-md transition-colors ${
                              recurrenceDays.includes(index)
                                ? 'bg-violet-600 text-white'
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* End Date */}
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">תאריך סיום (אופציונלי)</label>
                      <input
                        type="date"
                        value={recurrenceEndDate}
                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        dir="ltr"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              תזכורת
            </label>
            <div className="relative">
              <Bell className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                dir="ltr"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  deleteConfirm
                    ? 'bg-red-600 text-white'
                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {deleteConfirm ? 'אישור' : 'מחק'}
              </button>
            )}

            <div className="flex-1" />

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors"
            >
              ביטול
            </button>

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-bold hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditing ? (
                <Save className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isEditing ? 'שמור' : 'צור'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
