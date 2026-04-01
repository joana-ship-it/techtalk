import { useState } from 'react';
import { COLORS } from '../data/tagConfig';

function EditableField({ label, value, onChange, placeholder }) {
  const [editing, setEditing] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        {!editing && (
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {editing ? (
        <textarea
          autoFocus
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          placeholder={placeholder}
          rows={3}
          className="w-full text-sm text-gray-700 border border-indigo-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      ) : (
        <div
          onClick={() => setEditing(true)}
          className={`text-sm rounded-lg px-3 py-2 cursor-text min-h-[40px] border transition-colors ${
            value
              ? 'text-gray-700 border-gray-200 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/30'
              : 'text-gray-400 italic border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/20'
          }`}
        >
          {value || placeholder}
        </div>
      )}
    </div>
  );
}

function InlineEdit({ value, onChange, placeholder, className }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    onChange(draft.trim() || value);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
        className={`bg-transparent border-b-2 border-indigo-400 focus:outline-none ${className}`}
      />
    );
  }
  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`cursor-text border-b border-transparent hover:border-gray-300 transition-colors ${className}`}
      title="Click to edit"
    >
      {value || <span className="italic text-gray-400">{placeholder}</span>}
    </span>
  );
}

const SPEAKER_STATUSES = ['Confirmed', 'Pending', 'Unknown', 'Potential'];

function tagColor(list, label) {
  const tag = list?.find(t => t.label === label);
  return COLORS[tag?.colorId] || COLORS.gray;
}

export default function EventDetailPanel({ event, onClose, brief, easterEgg, onUpdateBrief, onUpdateEasterEgg, onUpdateField, onDelete, tagConfig }) {
  const [newSpeakerName, setNewSpeakerName] = useState('');
  const [newSpeakerStatus, setNewSpeakerStatus] = useState('Potential');
  const [addingNewSpeaker, setAddingNewSpeaker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!event) return null;

  const dateObj = new Date(event.date + 'T12:00:00');
  const formatted = dateObj.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const speakers = event.speakers || [];

  const eventFormats = tagConfig?.eventFormats || [];
  const audienceTypes = tagConfig?.audienceTypes || [];
  const statuses = tagConfig?.statuses || [];
  const owners = tagConfig?.owners || [];

  const fmtColor = tagColor(eventFormats, event.event);
  const audColor = tagColor(audienceTypes, event.type);
  const stColor = tagColor(statuses, event.status);
  const ownColor = tagColor(owners, event.owner);

  function updateSpeaker(idx, field, value) {
    const updated = speakers.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    onUpdateField('speakers', updated);
  }

  function removeSpeaker(idx) {
    onUpdateField('speakers', speakers.filter((_, i) => i !== idx));
  }

  function addSpeaker() {
    if (!newSpeakerName.trim()) return;
    onUpdateField('speakers', [...speakers, { name: newSpeakerName.trim(), status: newSpeakerStatus, bio: '' }]);
    setNewSpeakerName('');
    setNewSpeakerStatus('Potential');
    setAddingNewSpeaker(false);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[480px] bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header — editable title */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1 pr-4">
            <InlineEdit
              value={event.title || ''}
              onChange={v => onUpdateField('title', v)}
              placeholder="Untitled event"
              className="text-xl font-bold text-gray-900 leading-tight w-full block"
            />
            {/* Editable date + time */}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <input
                type="date"
                value={event.date || ''}
                onChange={e => onUpdateField('date', e.target.value)}
                className="text-xs text-gray-500 border-b border-transparent hover:border-gray-300 focus:border-indigo-400 focus:outline-none bg-transparent cursor-pointer"
              />
              <input
                type="time"
                value={event.time || ''}
                onChange={e => onUpdateField('time', e.target.value)}
                className="text-xs text-gray-500 border-b border-transparent hover:border-gray-300 focus:border-indigo-400 focus:outline-none bg-transparent cursor-pointer w-20"
              />
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0 mt-0.5">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Tags row */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tags</div>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={event.event}
                onChange={e => onUpdateField('event', e.target.value)}
                className={`text-xs rounded-full px-2 py-0.5 font-medium border focus:outline-none cursor-pointer ${fmtColor.bg} ${fmtColor.text} ${fmtColor.border}`}
              >
                {eventFormats.map(t => <option key={t.label}>{t.label}</option>)}
              </select>

              <select
                value={event.type}
                onChange={e => onUpdateField('type', e.target.value)}
                className={`text-xs rounded-full px-2 py-0.5 font-medium border focus:outline-none cursor-pointer ${audColor.bg} ${audColor.text} ${audColor.border}`}
              >
                {audienceTypes.map(t => <option key={t.label}>{t.label}</option>)}
              </select>

              <select
                value={event.status}
                onChange={e => onUpdateField('status', e.target.value)}
                className={`text-xs rounded-full px-2 py-0.5 font-medium border focus:outline-none cursor-pointer ${stColor.bg} ${stColor.text} ${stColor.border}`}
              >
                {statuses.map(t => <option key={t.label}>{t.label}</option>)}
              </select>

              <select
                value={event.owner}
                onChange={e => onUpdateField('owner', e.target.value)}
                className={`text-xs rounded-full px-2 py-0.5 font-medium border focus:outline-none cursor-pointer ${ownColor.bg} ${ownColor.text} ${ownColor.border}`}
              >
                {owners.map(t => <option key={t.label}>{t.label}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Pillar:</span>
              <input
                type="text"
                value={event.pillar && event.pillar !== 'Accepted on date & time' ? event.pillar : ''}
                onChange={e => onUpdateField('pillar', e.target.value)}
                placeholder="Add pillar..."
                className="text-xs text-gray-600 border-b border-transparent hover:border-gray-300 focus:border-indigo-400 focus:outline-none bg-transparent flex-1 py-0.5"
              />
            </div>
          </div>

          {/* Confirmation status */}
          {event.confirmationStatus && event.confirmationStatus !== 'Accepted on date & time' && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Confirmation</div>
              <div className="text-sm text-gray-700">{event.confirmationStatus}</div>
            </div>
          )}

          {/* Notes */}
          <EditableField
            label="Notes"
            value={event.notes || ''}
            onChange={v => onUpdateField('notes', v)}
            placeholder="Add notes..."
          />

          {/* Speakers */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Speakers ({speakers.length})
            </div>
            <div className="space-y-2">
              {speakers.map((sp, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={sp.name}
                      onChange={e => updateSpeaker(i, 'name', e.target.value)}
                      className="text-sm font-medium text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-400 focus:outline-none w-full"
                    />
                    {sp.bio && <div className="text-xs text-gray-500 mt-0.5">{sp.bio}</div>}
                  </div>
                  <select
                    value={sp.status || 'Unknown'}
                    onChange={e => updateSpeaker(i, 'status', e.target.value)}
                    className={`text-xs rounded-full px-2 py-0.5 font-medium border focus:outline-none cursor-pointer flex-shrink-0 ${
                      sp.status === 'Confirmed' ? 'bg-green-100 text-green-800 border-green-200' :
                      sp.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {SPEAKER_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => removeSpeaker(i)}
                    className="text-gray-300 hover:text-red-400 text-lg leading-none flex-shrink-0 transition-colors"
                  >×</button>
                </div>
              ))}

              {addingNewSpeaker ? (
                <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2 border border-indigo-200">
                  <input
                    autoFocus
                    type="text"
                    value={newSpeakerName}
                    onChange={e => setNewSpeakerName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addSpeaker(); if (e.key === 'Escape') setAddingNewSpeaker(false); }}
                    placeholder="Speaker name..."
                    className="text-sm text-gray-800 bg-transparent flex-1 focus:outline-none"
                  />
                  <select
                    value={newSpeakerStatus}
                    onChange={e => setNewSpeakerStatus(e.target.value)}
                    className="text-xs rounded-full px-2 py-0.5 border border-gray-200 bg-white focus:outline-none cursor-pointer"
                  >
                    {SPEAKER_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={addSpeaker} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">Add</button>
                  <button onClick={() => setAddingNewSpeaker(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingNewSpeaker(true)}
                  className="w-full text-xs text-indigo-500 hover:text-indigo-700 border border-dashed border-indigo-200 hover:border-indigo-400 rounded-lg py-1.5 transition-colors"
                >
                  + Add speaker
                </button>
              )}
            </div>
          </div>

          {/* Brief + Easter egg */}
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <EditableField label="Brief" value={brief} onChange={onUpdateBrief} placeholder="Click to add a brief..." />
            <EditableField label="Easter egg" value={easterEgg} onChange={onUpdateEasterEgg} placeholder="Click to add an easter egg..." />
          </div>
        </div>

        {/* Footer — delete */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">Permanent action — cannot be undone</span>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >Cancel</button>
              <button
                onClick={onDelete}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >Yes, delete</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete event
            </button>
          )}
        </div>
      </div>
    </>
  );
}
