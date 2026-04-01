import { useState } from 'react';
import { COLORS } from '../data/tagConfig';

function tagColor(tagConfig, label) {
  const tag = tagConfig?.eventFormats?.find(t => t.label === label);
  return COLORS[tag?.colorId] || COLORS.gray;
}

const TODAY = new Date('2026-04-01T00:00:00');
const FOUR_WEEKS = 28 * 24 * 60 * 60 * 1000;
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
const SPEAKER_STATUSES = ['Confirmed', 'Pending', 'Potential', 'Unknown'];

function hasConfirmedSpeaker(event) {
  return event.speakers?.some(s => s.status === 'Confirmed');
}

function daysUntil(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((d - TODAY) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${diff}d`;
}

function speakerNote(event) {
  if (!event.speakers || event.speakers.length === 0) return 'No speaker yet';
  const statuses = event.speakers.map(s => s.status);
  if (statuses.every(s => s === 'Potential')) return 'Potential only';
  if (statuses.includes('Pending')) return 'Pending';
  return 'Unconfirmed';
}

function EditableBrief({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  function save() {
    if (!draft.trim()) return;
    onChange(draft.trim());
    setEditing(false);
  }

  return (
    <div onClick={e => e.stopPropagation()}>
      {editing ? (
        <div className="space-y-1.5">
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') setEditing(false); }}
            placeholder="Paste or write the brief..."
            rows={3}
            className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
          <div className="flex gap-1.5">
            <button
              onClick={save}
              className="text-[10px] font-semibold bg-gray-900 text-white px-3 py-1 rounded-lg hover:bg-black transition-colors"
            >Save brief</button>
            <button
              onClick={() => setEditing(false)}
              className="text-[10px] text-gray-400 hover:text-gray-600 px-2 py-1"
            >Cancel</button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => { setDraft(''); setEditing(true); }}
          className={`text-xs rounded-lg px-2.5 py-1.5 cursor-text min-h-[32px] border transition-colors ${
            value
              ? 'border-gray-200 text-gray-700 bg-white hover:border-gray-300'
              : 'border-dashed border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-500'
          }`}
        >
          {value || '+ Add brief'}
        </div>
      )}
    </div>
  );
}

function CompactSpeakerEditor({ event, onUpdateField }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Potential');
  const [editingNameIdx, setEditingNameIdx] = useState(null);
  const speakers = event.speakers || [];

  function updateStatus(idx, newStatus) {
    onUpdateField(event.id, 'speakers', speakers.map((s, i) => i === idx ? { ...s, status: newStatus } : s));
  }

  function updateName(idx, newName) {
    onUpdateField(event.id, 'speakers', speakers.map((s, i) => i === idx ? { ...s, name: newName } : s));
    setEditingNameIdx(null);
  }

  function removeSpeaker(idx) {
    onUpdateField(event.id, 'speakers', speakers.filter((_, i) => i !== idx));
  }

  function addSpeaker() {
    if (!name.trim()) return;
    onUpdateField(event.id, 'speakers', [...speakers, { name: name.trim(), status, bio: '' }]);
    setName(''); setStatus('Potential'); setAdding(false);
  }

  return (
    <div onClick={e => e.stopPropagation()} className="space-y-1.5">
      {speakers.length === 0 && !adding && (
        <div className="text-xs text-gray-400">No speaker assigned</div>
      )}
      {speakers.map((s, i) => (
        <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
          {editingNameIdx === i ? (
            <input
              autoFocus
              type="text"
              defaultValue={s.name}
              onBlur={ev => updateName(i, ev.target.value || s.name)}
              onKeyDown={ev => { if (ev.key === 'Enter') updateName(i, ev.target.value || s.name); if (ev.key === 'Escape') setEditingNameIdx(null); }}
              className="text-xs flex-1 border-b border-gray-300 focus:outline-none bg-transparent"
            />
          ) : (
            <span
              className="text-xs font-medium text-gray-800 flex-1 truncate cursor-pointer hover:text-black"
              onClick={() => setEditingNameIdx(i)}
            >{s.name}</span>
          )}
          <select
            value={s.status || 'Unknown'}
            onChange={e => updateStatus(i, e.target.value)}
            className={`text-[10px] rounded-full px-2 py-0.5 font-semibold border focus:outline-none cursor-pointer flex-shrink-0 ${
              s.status === 'Confirmed' ? 'bg-lime-100 text-lime-800 border-lime-200' :
              s.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
              'bg-gray-100 text-gray-500 border-gray-200'
            }`}
          >
            {SPEAKER_STATUSES.map(st => <option key={st}>{st}</option>)}
          </select>
          <button
            onClick={() => removeSpeaker(i)}
            className="text-gray-300 hover:text-red-400 text-sm leading-none flex-shrink-0 transition-colors"
            title="Remove speaker"
          >×</button>
        </div>
      ))}
      {adding ? (
        <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200">
          <input
            autoFocus type="text" value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addSpeaker(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="Speaker name..."
            className="text-xs flex-1 focus:outline-none bg-transparent"
          />
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="text-[10px] border border-gray-200 rounded px-1 py-0.5 focus:outline-none">
            {SPEAKER_STATUSES.map(st => <option key={st}>{st}</option>)}
          </select>
          <button onClick={addSpeaker} className="text-[10px] font-bold text-black hover:text-gray-600">Add</button>
          <button onClick={() => setAdding(false)} className="text-gray-400 hover:text-gray-600 text-sm leading-none">×</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="text-xs text-gray-400 hover:text-black border border-dashed border-gray-200 hover:border-gray-400 rounded-lg px-2.5 py-1 transition-colors w-full">
          + Add speaker
        </button>
      )}
    </div>
  );
}

export default function UpcomingAttention({ onSelectEvent, eventData, onUpdateEventData, localEvents, updateEventField, fullPage, tagConfig }) {
  if (!localEvents) return null;

  const actionMap = new Map();

  localEvents.forEach(e => {
    if (e.event !== 'Webinar' && e.event !== 'Workshop') return;
    const d = new Date(e.date + 'T00:00:00');
    if (d < TODAY || d > new Date(TODAY.getTime() + FOUR_WEEKS)) return;
    if (hasConfirmedSpeaker(e)) return;
    actionMap.set(e.id, { ...actionMap.get(e.id), needsSpeaker: true });
  });

  localEvents.forEach(e => {
    if (e.event !== 'Webinar') return;
    const d = new Date(e.date + 'T00:00:00');
    if (d < TODAY || d > new Date(TODAY.getTime() + TWO_WEEKS)) return;
    if (eventData?.[e.id]?.brief) return;
    actionMap.set(e.id, { ...actionMap.get(e.id), needsBrief: true });
  });

  if (actionMap.size === 0) {
    if (!fullPage) return null;
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-14 h-14 rounded-full bg-lime-100 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-gray-900 font-semibold text-lg">All clear!</p>
        <p className="text-sm text-gray-400 mt-1">No events need attention right now.</p>
      </div>
    );
  }

  const attentionEvents = localEvents
    .filter(e => actionMap.has(e.id))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className={fullPage ? '' : 'px-6 pt-5 pb-3'}>
      {/* Section header — only shown when embedded in CalendarView */}
      {!fullPage && (
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Action needed</span>
          </div>
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">{attentionEvents.length} event{attentionEvents.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {fullPage && (
        <p className="text-xs text-gray-400 mb-4">{attentionEvents.length} event{attentionEvents.length !== 1 ? 's' : ''} need attention</p>
      )}

      {/* Cards row */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {attentionEvents.map(e => {
          const actions = actionMap.get(e.id);
          const countdown = daysUntil(e.date);
          const isUrgent = countdown === 'Today' || countdown === 'Tomorrow' || parseInt(countdown) <= 7;

          return (
            <div
              key={e.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card top bar — color coded by urgency */}
              <div className={`h-1 w-full ${isUrgent ? 'bg-amber-400' : 'bg-gray-200'}`} />

              <div className="p-4">
                {/* Header row */}
                <button className="w-full text-left group" onClick={() => onSelectEvent(e)}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {(() => { const c = tagColor(tagConfig, e.event); return (
                          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                            {e.event}
                          </span>
                        ); })()}
                        <span className="text-[10px] text-gray-400">
                          {new Date(e.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-black">
                        {e.title || <span className="italic text-gray-400">Untitled</span>}
                      </p>
                    </div>
                    {/* Countdown badge */}
                    <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                      countdown === 'Today' ? 'bg-red-500 text-white' :
                      countdown === 'Tomorrow' ? 'bg-orange-400 text-white' :
                      isUrgent ? 'bg-amber-400 text-white' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {countdown === 'Today' || countdown === 'Tomorrow' ? countdown : countdown}
                    </span>
                  </div>
                </button>

                {/* Action tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {actions.needsSpeaker && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full text-gray-900" style={{ backgroundColor: '#e7abff' }}>
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Confirm speaker
                      <span className="opacity-60 font-normal">· {speakerNote(e)}</span>
                    </span>
                  )}
                  {actions.needsBrief && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-lime-300 text-gray-900">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Upload brief
                    </span>
                  )}
                </div>

                {/* Editable fields */}
                <div className="space-y-2.5">
                  {actions.needsSpeaker && (
                    <CompactSpeakerEditor event={e} onUpdateField={updateEventField} />
                  )}
                  {actions.needsBrief && (
                    <EditableBrief
                      value={eventData?.[e.id]?.brief ?? ''}
                      onChange={v => onUpdateEventData(e.id, 'brief', v)}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
