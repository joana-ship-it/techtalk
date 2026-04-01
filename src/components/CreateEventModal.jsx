import { useState } from 'react';

export default function CreateEventModal({ date, tagConfig, onSave, onClose }) {
  const eventFormats = tagConfig?.eventFormats || [];
  const audienceTypes = tagConfig?.audienceTypes || [];
  const statuses = tagConfig?.statuses || [];
  const owners = tagConfig?.owners || [];

  const [form, setForm] = useState({
    title: '',
    date: date,
    time: '18:00',
    event: eventFormats[0]?.label || 'Webinar',
    type: audienceTypes[0]?.label || 'Job Seeker',
    status: statuses.find(s => s.label === 'Not started')?.label || statuses[0]?.label || 'Not started',
    owner: owners[0]?.label || 'Roxanne',
    pillar: '',
    notes: '',
    speakers: [],
  });

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ id: Date.now(), ...form, title: form.title.trim() });
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[460px] max-h-[90vh] overflow-y-auto"
        style={{ zIndex: 60 }}
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={submit}>
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">New Event</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          <div className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Title *</label>
              <input
                autoFocus
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Event title..."
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Date + Time */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div className="w-28">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={e => set('time', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {/* Format + Audience */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Format</label>
                <select
                  value={form.event}
                  onChange={e => set('event', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {eventFormats.map(t => <option key={t.label}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Audience</label>
                <select
                  value={form.type}
                  onChange={e => set('type', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {audienceTypes.map(t => <option key={t.label}>{t.label}</option>)}
                </select>
              </div>
            </div>

            {/* Status + Owner */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {statuses.map(t => <option key={t.label}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Owner</label>
                <select
                  value={form.owner}
                  onChange={e => set('owner', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {owners.map(t => <option key={t.label}>{t.label}</option>)}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Optional notes..."
                rows={2}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          <div className="px-6 pb-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-700 font-semibold"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
