import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { C } from '@/lib/rooted-constants';
import { X, Loader2 } from 'lucide-react';

const MOODS = [
  { label: 'Calm', value: 'calm', emoji: '😊' },
  { label: 'Sad', value: 'sad', emoji: '😢' },
  { label: 'Anxious', value: 'anxious', emoji: '😰' },
  { label: 'Angry', value: 'angry', emoji: '😠' },
  { label: 'Dysregulated', value: 'dysregulated', emoji: '🌪️' },
];

export default function BehaviorLogForm({ onClose, onSuccess }) {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    entry_date: today,
    time: '',
    behavior_description: '',
    trigger: '',
    parent_response: '',
    outcome: '',
    child_mood: 'calm',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.behavior_description.trim()) return;

    setLoading(true);
    try {
      const created = await base44.entities.BehaviorLog.create(formData);
      onSuccess?.(created);
    } catch (error) {
      console.error('Error saving behavior log:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl p-4 border-b-4" style={{ background: C.white, borderColor: C.midGreen }}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>New Behavior Entry</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:opacity-70 transition"
          style={{ background: C.cream, border: 'none', cursor: 'pointer' }}
        >
          <X size={16} color={C.darkGreen} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Date and time */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold block mb-1" style={{ color: C.mutedText }}>DATE</label>
            <input
              type="date"
              value={formData.entry_date}
              onChange={(e) => setFormData(prev => ({ ...prev, entry_date: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm font-sans"
              style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1" style={{ color: C.mutedText }}>TIME</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm font-sans"
              style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
            />
          </div>
        </div>

        {/* Behavior description */}
        <div>
          <label className="text-xs font-bold block mb-1" style={{ color: C.mutedText }}>WHAT HAPPENED? *</label>
          <textarea
            value={formData.behavior_description}
            onChange={(e) => setFormData(prev => ({ ...prev, behavior_description: e.target.value }))}
            placeholder="Describe the behavior..."
            rows="2"
            className="w-full rounded-lg px-3 py-2 text-sm font-sans resize-none"
            style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>

        {/* Trigger */}
        <div>
          <label className="text-xs font-bold block mb-1" style={{ color: C.mutedText }}>WHAT TRIGGERED IT?</label>
          <textarea
            value={formData.trigger}
            onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value }))}
            placeholder="What happened before..."
            rows="2"
            className="w-full rounded-lg px-3 py-2 text-sm font-sans resize-none"
            style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>

        {/* Parent response */}
        <div>
          <label className="text-xs font-bold block mb-1" style={{ color: C.mutedText }}>YOUR RESPONSE</label>
          <textarea
            value={formData.parent_response}
            onChange={(e) => setFormData(prev => ({ ...prev, parent_response: e.target.value }))}
            placeholder="How did you respond..."
            rows="2"
            className="w-full rounded-lg px-3 py-2 text-sm font-sans resize-none"
            style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>

        {/* Outcome */}
        <div>
          <label className="text-xs font-bold block mb-1" style={{ color: C.mutedText }}>HOW IT RESOLVED</label>
          <textarea
            value={formData.outcome}
            onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
            placeholder="How did it end..."
            rows="2"
            className="w-full rounded-lg px-3 py-2 text-sm font-sans resize-none"
            style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>

        {/* Child mood */}
        <div>
          <label className="text-xs font-bold block mb-2" style={{ color: C.mutedText }}>CHILD'S MOOD</label>
          <div className="grid grid-cols-5 gap-1.5">
            {MOODS.map(mood => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, child_mood: mood.value }))}
                className="py-2.5 rounded-lg font-bold text-sm transition-all"
                style={{
                  background: formData.child_mood === mood.value ? C.midGreen : C.cream,
                  color: formData.child_mood === mood.value ? C.white : C.darkGreen,
                  border: `1.5px solid ${formData.child_mood === mood.value ? C.midGreen : C.cream}`,
                  cursor: 'pointer',
                }}
              >
                <div className="text-base">{mood.emoji}</div>
                <div className="text-[10px] mt-0.5">{mood.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !formData.behavior_description.trim()}
          className="w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
          style={{
            background: C.darkGreen,
            color: C.white,
            border: 'none',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Saving...</>
          ) : (
            '✓ Save Entry'
          )}
        </button>
      </form>
    </div>
  );
}