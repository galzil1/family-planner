'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Tags, Plus, Trash2, Loader2 } from 'lucide-react';
import type { Category } from '@/types';

interface CategoryManagerProps {
  familyId: string;
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
}

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#6B7280', // Gray
];

const PRESET_ICONS = [
  // Home & Chores
  '🏠', '🧹', '🧺', '🛏️', '🚿', '🗑️',
  // Shopping & Food
  '🛒', '🍳', '🍽️', '🥗', '☕', '🍕',
  // Family & Kids
  '👶', '👧', '👦', '👨‍👩‍👧', '🎒', '🏫',
  // Work & Finance
  '💼', '💻', '📊', '💰', '📋', '✏️',
  // Health & Fitness
  '💪', '🏃', '⚽', '🧘', '💊', '🏥',
  // Transport & Travel
  '🚗', '🚌', '✈️', '🚲', '🏖️', '🗺️',
  // Hobbies & Fun
  '🎮', '📚', '🎨', '🎵', '🎬', '📷',
  // Nature & Pets
  '🌱', '🐕', '🐈', '🌸', '☀️', '🌙',
  // Events & Celebrations
  '🎂', '🎉', '🎁', '💝', '📅', '⏰',
  // General
  '📌', '⭐', '❤️', '✅', '🔔', '💡',
];

export default function CategoryManager({
  familyId,
  categories,
  onCategoriesChange,
}: CategoryManagerProps) {
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(PRESET_ICONS[0]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('categories')
      .insert({
        family_id: familyId,
        name: name.trim(),
        color,
        icon,
      })
      .select()
      .single();

    if (!error && data) {
      onCategoriesChange([...categories, data]);
      setName('');
      setColor(PRESET_COLORS[0]);
      setIcon(PRESET_ICONS[0]);
      setShowForm(false);
    }

    setLoading(false);
  };

  const handleDelete = async (categoryId: string) => {
    setDeleting(categoryId);

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (!error) {
      onCategoriesChange(categories.filter((c) => c.id !== categoryId));
    }

    setDeleting(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Tags className="w-5 h-5 text-violet-400" />
          Categories
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              placeholder="Category name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Icon
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    icon === i
                      ? 'bg-violet-500/30 ring-2 ring-violet-500'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Category
            </button>
          </div>
        </form>
      )}

      {/* Category List */}
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: category.color + '30' }}
              >
                {category.icon}
              </div>
              <span className="text-white font-medium">{category.name}</span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </div>
            <button
              onClick={() => handleDelete(category.id)}
              disabled={deleting === category.id}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting === category.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}

        {categories.length === 0 && (
          <p className="text-center text-slate-500 py-4">
            No categories yet. Add one to organize your tasks!
          </p>
        )}
      </div>
    </div>
  );
}
