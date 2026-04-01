import { useState } from 'react';

const DEFAULT_SPEAKERS = ['Joana Rocha', 'Roxanne Taku', 'Helena Rattova'];
const SPEAKER_STATUSES = ['Confirmed', 'Pending', 'Potential', 'Unknown'];

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

  const [customSpeaker, setCustomSpeaker] = useState('');

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  function addSpeaker(name) {
    if (form.speakers.find(s => s.name === name)) return;
    set('speakers', [...form.speakers, { name, status: 'Potential', bio: '' }]);
  }

  function removeSpeaker(idx) {
    set('speakers', form.speakers.filter((_, i) => i !== idx));
  }

  function updateSpeakerStatus(idx, status) {
    set('speakers', form.speakers.map((s, i) => i === idx ? { ...s, status } : s));
  }

  function addCustomSpeaker() {
    if (!customSpeaker.trim()) return;
    addSpeaker(customSpeaker.trim());
    setCustomSpeaker('');
  }

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

            {/* Speakers */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">Speakers</label>

              {/* Added speakers */}
              {form.speakers.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {form.speakers.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                      <span className="text-sm text-gray-800 flex-1">{s.name}</span>
                      <select
                        value={s.status}
                        onChange={e => updateSpeakerStatus(i, e.target.value)}
                        className="text-xs border border-gray-200 rounded-full px-2 py-0.5 focus:outline-none bg-white"
                      >
                        {SPEAKER_STATUSES.map(st => <option key={st}>{st}</option>)}
                      </select>
                      <button type="button" onClick={() => removeSpeaker(i)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Default speaker quick-add */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {DEFAULT_SPEAKERS.filter(n => !form.speakers.find(s => s.name === n)).map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => addSpeaker(name)}
                    className="text-xs px-2.5 py-1 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-800 transition-colors"
                  >+ {name}</button>
                ))}
              </div>

              {/* Custom speaker input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSpeaker}
                  onChange={e => setCustomSpeaker(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSpeaker(); } }}
                  placeholder="Add other speaker..."
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                  type="button"
                  onClick={addCustomSpeaker}
                  className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                >Add</button>
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
