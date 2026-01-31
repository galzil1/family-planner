'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Trash2, Loader2, UserPlus, X } from 'lucide-react';
import { AVATAR_COLORS } from '@/types';
import type { Helper } from '@/types';

interface HelperManagerProps {
  familyId: string;
  helpers: Helper[];
  onHelpersChange: (helpers: Helper[]) => void;
}

export default function HelperManager({
  familyId,
  helpers,
  onHelpersChange,
}: HelperManagerProps) {
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<string>(AVATAR_COLORS[0]);
  const [newNotes, setNewNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddHelper = async () => {
    if (!newName.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('helpers')
      .insert({
        family_id: familyId,
        name: newName.trim(),
        avatar_color: newColor,
        notes: newNotes.trim() || null,
      })
      .select()
      .single();

    if (!error && data) {
      onHelpersChange([...helpers, data]);
      setNewName('');
      setNewNotes('');
      setNewColor(AVATAR_COLORS[0]);
      setShowForm(false);
    }
    setLoading(false);
  };

  const handleDeleteHelper = async (id: string) => {
    if (deleteId !== id) {
      setDeleteId(id);
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('helpers').delete().eq('id', id);

    if (!error) {
      onHelpersChange(helpers.filter((h) => h.id !== id));
    }
    setDeleteId(null);
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-violet-400" />
          עוזרים
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 text-violet-400 hover:text-white hover:bg-violet-500/20 active:bg-violet-500/30 rounded-lg transition-colors"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      <p className="text-sm text-slate-400 mb-4">
        הוסף אנשים שיכולים להיות אחראים על משימות (סבא/סבתא, מטפלת, וכו׳)
      </p>

      {/* Add Helper Form */}
      {showForm && (
        <div className="mb-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              שם *
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="לדוגמא: סבתא רחל"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              צבע
            </label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    newColor === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              הערות (אופציונלי)
            </label>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="טלפון, כתובת, וכו׳"
            />
          </div>

          <button
            onClick={handleAddHelper}
            disabled={loading || !newName.trim()}
            className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-500 active:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            הוסף עוזר
          </button>
        </div>
      )}

      {/* Helpers List */}
      {helpers.length === 0 ? (
        <p className="text-slate-500 text-center py-4">
          אין עוזרים עדיין. לחץ על + להוספה.
        </p>
      ) : (
        <div className="space-y-2">
          {helpers.map((helper) => (
            <div
              key={helper.id}
              className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: helper.avatar_color }}
              >
                {helper.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{helper.name}</p>
                {helper.notes && (
                  <p className="text-xs text-slate-400 truncate">{helper.notes}</p>
                )}
              </div>
              <button
                onClick={() => handleDeleteHelper(helper.id)}
                disabled={loading}
                className={`p-2 rounded-lg transition-colors ${
                  deleteId === helper.id
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
