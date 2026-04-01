import { useState } from 'react';
import { COLORS } from '../data/tagConfig';

const SPEAKER_STATUSES = ['Confirmed', 'Pending', 'Potential', 'Unknown'];

function InlineSpeakerEditor({ speakers, onUpdate, onClose }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStatus, setNewStatus] = useState('Potential');
  const [editingNameIdx, setEditingNameIdx] = useState(null);

  function updateStatus(idx, status) {
    onUpdate(speakers.map((s, i) => i === idx ? { ...s, status } : s));
  }

  function updateName(idx, name) {
    onUpdate(speakers.map((s, i) => i === idx ? { ...s, name } : s));
    setEditingNameIdx(null);
  }

  function removeSpeaker(idx) {
    onUpdate(speakers.filter((_, i) => i !== idx));
  }

  function addSpeaker() {
    if (!newName.trim()) return;
    onUpdate([...speakers, { name: newName.trim(), status: newStatus, bio: '' }]);
    setNewName(''); setNewStatus('Potential'); setAdding(false);
  }

  return (
    <div onClick={ev => ev.stopPropagation()} className="space-y-1 py-0.5 min-w-[220px]">
      {speakers.length === 0 && !adding && (
        <span className="text-xs text-gray-400">No speaker</span>
      )}
      {speakers.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
          {editingNameIdx === i ? (
            <input
              autoFocus
              type="text"
              defaultValue={s.name}
              onBlur={ev => updateName(i, ev.target.value || s.name)}
              onKeyDown={ev => { if (ev.key === 'Enter') updateName(i, ev.target.value || s.name); if (ev.key === 'Escape') setEditingNameIdx(null); }}
              onClick={ev => ev.stopPropagation()}
              className="text-xs flex-1 border-b border-gray-300 focus:outline-none bg-transparent"
            />
          ) : (
            <span
              className="text-xs text-gray-800 flex-1 truncate cursor-pointer hover:text-black"
              onClick={() => setEditingNameIdx(i)}
            >{s.name}</span>
          )}
          <select
            value={s.status || 'Unknown'}
            onChange={ev => updateStatus(i, ev.target.value)}
            onClick={ev => ev.stopPropagation()}
            className={`text-[10px] rounded-full px-1.5 py-0.5 font-semibold border focus:outline-none cursor-pointer flex-shrink-0 ${
              s.status === 'Confirmed' ? 'bg-lime-100 text-lime-800 border-lime-200' :
              s.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
              'bg-gray-100 text-gray-500 border-gray-200'
            }`}
          >
            {SPEAKER_STATUSES.map(st => <option key={st}>{st}</option>)}
          </select>
          <button
            onClick={ev => { ev.stopPropagation(); removeSpeaker(i); }}
            className="text-gray-300 hover:text-red-400 text-sm leading-none flex-shrink-0"
          >×</button>
        </div>
      ))}
      {adding ? (
        <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 border border-gray-200">
          <input
            autoFocus type="text" value={newName}
            onChange={ev => setNewName(ev.target.value)}
            onKeyDown={ev => { if (ev.key === 'Enter') addSpeaker(); if (ev.key === 'Escape') setAdding(false); }}
            onClick={ev => ev.stopPropagation()}
            placeholder="Name..."
            className="text-xs flex-1 focus:outline-none bg-transparent"
          />
          <select value={newStatus} onChange={ev => setNewStatus(ev.target.value)}
            onClick={ev => ev.stopPropagation()}
            className="text-[10px] border border-gray-200 rounded px-1 py-0.5 focus:outline-none">
            {SPEAKER_STATUSES.map(st => <option key={st}>{st}</option>)}
          </select>
          <button onClick={ev => { ev.stopPropagation(); addSpeaker(); }} className="text-[10px] font-bold text-gray-900 hover:text-black">✓</button>
          <button onClick={ev => { ev.stopPropagation(); setAdding(false); }} className="text-gray-400 text-sm leading-none">×</button>
        </div>
      ) : (
        <button
          onClick={ev => { ev.stopPropagation(); setAdding(true); }}
          className="text-[10px] text-gray-400 hover:text-gray-700 border border-dashed border-gray-200 hover:border-gray-300 rounded px-2 py-0.5 w-full transition-colors"
        >+ add speaker</button>
      )}
      <button
        onClick={ev => { ev.stopPropagation(); onClose(); }}
        className="text-[10px] text-gray-400 hover:text-gray-600 pt-0.5 block"
      >Done</button>
    </div>
  );
}

function speakerSummary(speakers) {
  if (!speakers || speakers.length === 0) return { status: 'No speaker', names: '—' };
  const names = speakers.map(s => s.name).join(', ');
  if (speakers.some(s => s.status === 'Confirmed')) return { status: 'Confirmed', names };
  if (speakers.some(s => s.status === 'Pending')) return { status: 'Pending', names };
  if (speakers.some(s => s.status === 'Potential')) return { status: 'Potential', names };
  return { status: 'Unknown', names };
}

const SPEAKER_STATUS_STYLES = {
  Confirmed: 'text-green-700 font-medium',
  Pending: 'text-amber-700',
  Potential: 'text-blue-600',
  'No speaker': 'text-gray-400 italic',
  Unknown: 'text-gray-500',
};

function tagColor(list, label) {
  const tag = list?.find(t => t.label === label);
  return COLORS[tag?.colorId] || COLORS.gray;
}

export default function EventListView({ events, onSelectEvent, getMergedEvent, tagConfig, updateEventField, deleteEvent }) {
  const [editingCell, setEditingCell] = useState(null); // { id, field }
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  if (events.length === 0) {
    return <div className="text-center text-gray-400 py-16 text-sm">No events match your filters.</div>;
  }

  const eventFormats = tagConfig?.eventFormats || [];
  const audienceTypes = tagConfig?.audienceTypes || [];
  const statuses = tagConfig?.statuses || [];
  const owners = tagConfig?.owners || [];

  const isEditing = (id, field) => editingCell?.id === id && editingCell?.field === field;

  function startEdit(id, field, e) {
    e.stopPropagation();
    setEditingCell({ id, field });
  }

  function commitEdit(id, field, value) {
    updateEventField(id, field, value);
    setEditingCell(null);
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm border-collapse bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left">
            <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Date</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Time</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Format</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Audience</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Owner</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Speaker status</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Speaker(s)</th>
            <th className="px-2 py-2.5 w-8" />
            <th className="px-3 py-2.5 w-8" />
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => {
            const merged = getMergedEvent(e);
            const sp = speakerSummary(merged.speakers);
            const dateObj = new Date(merged.date + 'T12:00:00');
            const dateFormatted = dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

            const fmtC = tagColor(eventFormats, merged.event);
            const audC = tagColor(audienceTypes, merged.type);
            const stC = tagColor(statuses, merged.status);
            const ownC = tagColor(owners, merged.owner);

            return (
              <tr
                key={e.id}
                className={`border-b border-gray-100 transition-colors group ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
              >
                {/* Date */}
                <td className="px-3 py-2 whitespace-nowrap cursor-pointer" onClick={(ev) => startEdit(e.id, 'date', ev)}>
                  {isEditing(e.id, 'date') ? (
                    <input
                      autoFocus
                      type="date"
                      defaultValue={merged.date}
                      onBlur={ev => commitEdit(e.id, 'date', ev.target.value)}
                      onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(e.id, 'date', ev.target.value); if (ev.key === 'Escape') setEditingCell(null); }}
                      onClick={ev => ev.stopPropagation()}
                      className="text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  ) : (
                    <span className="text-gray-700 font-medium group hover:text-gray-900">
                      {dateFormatted}
                      <span className="ml-1 opacity-0 group-hover:opacity-30 text-[10px]">✎</span>
                    </span>
                  )}
                </td>

                {/* Time */}
                <td className="px-3 py-2 whitespace-nowrap cursor-pointer" onClick={(ev) => startEdit(e.id, 'time', ev)}>
                  {isEditing(e.id, 'time') ? (
                    <input
                      autoFocus
                      type="time"
                      defaultValue={merged.time || ''}
                      onBlur={ev => commitEdit(e.id, 'time', ev.target.value)}
                      onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(e.id, 'time', ev.target.value); if (ev.key === 'Escape') setEditingCell(null); }}
                      onClick={ev => ev.stopPropagation()}
                      className="text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  ) : (
                    <span className="text-gray-500 group hover:text-gray-700 cursor-pointer">
                      {merged.time || <span className="text-gray-300">—</span>}
                      <span className="ml-1 opacity-0 group-hover:opacity-30 text-[10px]">✎</span>
                    </span>
                  )}
                </td>

                {/* Format */}
                <td className="px-3 py-2 whitespace-nowrap cursor-pointer" onClick={(ev) => startEdit(e.id, 'event', ev)}>
                  {isEditing(e.id, 'event') ? (
                    <select
                      autoFocus
                      value={merged.event}
                      onChange={ev => commitEdit(e.id, 'event', ev.target.value)}
                      onBlur={() => setEditingCell(null)}
                      onClick={ev => ev.stopPropagation()}
                      className="text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    >
                      {eventFormats.map(t => <option key={t.label}>{t.label}</option>)}
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border cursor-pointer hover:opacity-80 ${fmtC.bg} ${fmtC.text} ${fmtC.border}`}>
                      {merged.event}
                    </span>
                  )}
                </td>

                {/* Audience */}
                <td className="px-3 py-2 whitespace-nowrap cursor-pointer" onClick={(ev) => startEdit(e.id, 'type', ev)}>
                  {isEditing(e.id, 'type') ? (
                    <select
                      autoFocus
                      value={merged.type}
                      onChange={ev => commitEdit(e.id, 'type', ev.target.value)}
                      onBlur={() => setEditingCell(null)}
                      onClick={ev => ev.stopPropagation()}
                      className="text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    >
                      {audienceTypes.map(t => <option key={t.label}>{t.label}</option>)}
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border cursor-pointer hover:opacity-80 ${audC.bg} ${audC.text} ${audC.border}`}>
                      {merged.type}
                    </span>
                  )}
                </td>

                {/* Owner */}
                <td className="px-3 py-2 whitespace-nowrap cursor-pointer" onClick={(ev) => startEdit(e.id, 'owner', ev)}>
                  {isEditing(e.id, 'owner') ? (
                    <select
                      autoFocus
                      value={merged.owner}
                      onChange={ev => commitEdit(e.id, 'owner', ev.target.value)}
                      onBlur={() => setEditingCell(null)}
                      onClick={ev => ev.stopPropagation()}
                      className="text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    >
                      {owners.map(t => <option key={t.label}>{t.label}</option>)}
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border cursor-pointer hover:opacity-80 ${ownC.bg} ${ownC.text} ${ownC.border}`}>
                      {merged.owner}
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-3 py-2 whitespace-nowrap cursor-pointer" onClick={(ev) => startEdit(e.id, 'status', ev)}>
                  {isEditing(e.id, 'status') ? (
                    <select
                      autoFocus
                      value={merged.status}
                      onChange={ev => commitEdit(e.id, 'status', ev.target.value)}
                      onBlur={() => setEditingCell(null)}
                      onClick={ev => ev.stopPropagation()}
                      className="text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    >
                      {statuses.map(t => <option key={t.label}>{t.label}</option>)}
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border cursor-pointer hover:opacity-80 ${stC.bg} ${stC.text} ${stC.border}`}>
                      {merged.status}
                    </span>
                  )}
                </td>

                {/* Title */}
                <td className="px-3 py-2 cursor-pointer" onClick={(ev) => startEdit(e.id, 'title', ev)}>
                  {isEditing(e.id, 'title') ? (
                    <input
                      autoFocus
                      type="text"
                      defaultValue={merged.title || ''}
                      onBlur={ev => commitEdit(e.id, 'title', ev.target.value)}
                      onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(e.id, 'title', ev.target.value); if (ev.key === 'Escape') setEditingCell(null); }}
                      onClick={ev => ev.stopPropagation()}
                      className="text-sm border border-gray-300 rounded px-2 py-0.5 w-full min-w-[200px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  ) : (
                    <span className="text-gray-800 font-medium group hover:text-gray-900">
                      {merged.title || <span className="text-gray-400 italic">Untitled</span>}
                      <span className="ml-1 opacity-0 group-hover:opacity-30 text-[10px]">✎</span>
                    </span>
                  )}
                </td>

                {/* Speaker status — click to open speaker editor */}
                <td className="px-3 py-2 whitespace-nowrap cursor-pointer" onClick={ev => startEdit(e.id, 'speakers', ev)}>
                  <span className={`text-xs group ${SPEAKER_STATUS_STYLES[sp.status] || 'text-gray-500'}`}>
                    {sp.status}
                    <span className="ml-1 opacity-0 group-hover:opacity-30 text-[10px]">✎</span>
                  </span>
                </td>

                {/* Speakers — inline editable */}
                <td className="px-3 py-2 max-w-[220px] cursor-pointer" onClick={ev => startEdit(e.id, 'speakers', ev)}>
                  {isEditing(e.id, 'speakers') ? (
                    <InlineSpeakerEditor
                      speakers={merged.speakers || []}
                      onUpdate={val => updateEventField(e.id, 'speakers', val)}
                      onClose={() => setEditingCell(null)}
                    />
                  ) : (
                    <span className="text-xs text-gray-600 group hover:text-gray-800">
                      {sp.names}
                      <span className="ml-1 opacity-0 group-hover:opacity-30 text-[10px]">✎</span>
                    </span>
                  )}
                </td>
                {/* Open card */}
                <td className="px-2 py-2 whitespace-nowrap" onClick={ev => ev.stopPropagation()}>
                  <button
                    onClick={() => onSelectEvent(merged)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-indigo-500 transition-all"
                    title="Open event detail"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </td>
                {/* Delete */}
                <td className="px-2 py-2 whitespace-nowrap" onClick={ev => ev.stopPropagation()}>
                  {confirmDeleteId === e.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { deleteEvent(e.id); setConfirmDeleteId(null); }}
                        className="text-[10px] font-semibold text-red-600 hover:text-red-800"
                      >Delete</button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-gray-400 hover:text-gray-600"
                      >Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(e.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                      title="Delete event"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
