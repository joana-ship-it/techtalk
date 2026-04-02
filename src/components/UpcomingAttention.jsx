import { useState } from 'react';
import { COLORS } from '../data/tagConfig';

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function daysDiff(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return Math.round((d - TODAY) / (1000 * 60 * 60 * 24));
}

function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function deadlineLabel(days) {
  if (days < -1) return `${Math.abs(days)} days overdue`;
  if (days === -1) return '1 day overdue';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

const SPEAKER_STATUSES = ['Confirmed', 'Pending', 'Potential', 'Unknown'];

const TASK_META = {
  speaker: {
    label: 'Confirm Speaker',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    tagClass: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  callBooked: {
    label: 'Book Speaker Call',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    tagClass: 'bg-teal-100 text-teal-700 border-teal-200',
  },
  contentReceived: {
    label: 'Get Speaker Content',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    tagClass: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  brief: {
    label: 'Upload Brief',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    tagClass: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  presentation: {
    label: 'Add Presentation',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    tagClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
};

function MarkDoneInput({ eventId, field, onUpdateEventData }) {
  return (
    <div className="pt-2" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => onUpdateEventData(eventId, field, true)}
        className="flex items-center gap-2 text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Mark as done
      </button>
    </div>
  );
}

function SpeakerInput({ event, updateEventField }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Potential');
  const speakers = event.speakers || [];

  function addSpeaker() {
    if (!name.trim()) return;
    updateEventField(event.id, 'speakers', [...speakers, { name: name.trim(), status, bio: '' }]);
    setName('');
    setStatus('Potential');
  }

  function removeSpkr(idx) {
    updateEventField(event.id, 'speakers', speakers.filter((_, i) => i !== idx));
  }

  function updateStatus(idx, newStatus) {
    updateEventField(event.id, 'speakers', speakers.map((s, i) => i === idx ? { ...s, status: newStatus } : s));
  }

  return (
    <div className="space-y-2 pt-2" onClick={e => e.stopPropagation()}>
      {speakers.map((s, i) => (
        <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
          <span className="text-sm flex-1 text-gray-800 font-medium">{s.name}</span>
          <select
            value={s.status || 'Unknown'}
            onChange={e => updateStatus(i, e.target.value)}
            className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border focus:outline-none cursor-pointer ${
              s.status === 'Confirmed' ? 'bg-green-100 text-green-800 border-green-200' :
              s.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
              'bg-gray-100 text-gray-500 border-gray-200'
            }`}
          >
            {SPEAKER_STATUSES.map(st => <option key={st}>{st}</option>)}
          </select>
          <button onClick={() => removeSpkr(i)} className="text-gray-300 hover:text-red-400 text-lg leading-none transition-colors">×</button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addSpeaker(); }}
          placeholder="Speaker name..."
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 focus:outline-none bg-white"
        >
          {SPEAKER_STATUSES.map(st => <option key={st}>{st}</option>)}
        </select>
        <button
          onClick={addSpeaker}
          className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium"
        >Add</button>
      </div>
    </div>
  );
}

function BriefInput({ eventId, onUpdateEventData }) {
  const [draft, setDraft] = useState('');

  function save() {
    if (!draft.trim()) return;
    onUpdateEventData(eventId, 'brief', draft.trim());
  }

  return (
    <div className="space-y-2 pt-2" onClick={e => e.stopPropagation()}>
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="Paste or write the brief..."
        rows={3}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-sky-200"
      />
      <button
        onClick={save}
        disabled={!draft.trim()}
        className="text-xs font-semibold bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >Save brief</button>
    </div>
  );
}

function PresentationInput({ eventId, onUpdateEventData }) {
  const [url, setUrl] = useState('');

  function save() {
    if (!url.trim()) return;
    onUpdateEventData(eventId, 'presentation', url.trim());
  }

  return (
    <div className="flex gap-2 pt-2" onClick={e => e.stopPropagation()}>
      <input
        type="url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); }}
        placeholder="Paste presentation link..."
        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <button
        onClick={save}
        className="text-sm font-medium px-4 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
      >Save</button>
    </div>
  );
}

function TaskRow({ task, updateEventField, onUpdateEventData, onSelectEvent }) {
  const isOverdue = task.daysUntilDeadline < 0;
  const isUrgent = !isOverdue && task.daysUntilDeadline <= 3;
  const [open, setOpen] = useState(false);
  const meta = TASK_META[task.type];
  const { event } = task;
  const isMarkDoneType = task.type === 'callBooked' || task.type === 'contentReceived';

  return (
    <div className={`rounded-xl border bg-white overflow-hidden ${
      isOverdue ? 'border-red-200 shadow-sm shadow-red-50' :
      isUrgent ? 'border-amber-200 shadow-sm shadow-amber-50' :
      'border-gray-100'
    }`}>
      <div
        className={`flex items-center gap-3 px-4 py-3 ${isMarkDoneType ? '' : 'cursor-pointer select-none'} ${open ? 'border-b border-gray-100' : ''}`}
        onClick={() => { if (!isMarkDoneType) setOpen(!open); }}
      >
        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          isOverdue ? 'bg-red-500' : isUrgent ? 'bg-amber-400' : 'bg-gray-300'
        }`} />

        {/* Task type badge */}
        <span className={`hidden sm:flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${meta.tagClass}`}>
          {meta.icon}
          {meta.label}
        </span>

        {/* Event name — clickable to open event card */}
        <button
          onClick={ev => { ev.stopPropagation(); onSelectEvent(event); }}
          className="text-sm font-semibold text-gray-800 hover:text-black truncate flex-1 text-left hover:underline underline-offset-2"
          title="Open event"
        >
          {event.title || event.event}
        </button>

        {/* Event type + date */}
        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 hidden md:block">
          {event.event} · {formatDate(event.date)}
        </span>

        {/* Deadline badge */}
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${
          isOverdue ? 'bg-red-100 text-red-600' :
          isUrgent ? 'bg-amber-100 text-amber-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {deadlineLabel(task.daysUntilDeadline)}
        </span>

        {/* Mark as done button (inline) or chevron */}
        {isMarkDoneType ? (
          <button
            onClick={e => { e.stopPropagation(); onUpdateEventData(event.id, task.type, true); }}
            className="flex items-center gap-1.5 text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-colors flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Done
          </button>
        ) : (
          <svg
            className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {/* Expanded input area */}
      {open && !isMarkDoneType && (
        <div className="px-4 pb-4 bg-gray-50/50">
          {task.type === 'speaker' && (
            <SpeakerInput event={event} updateEventField={updateEventField} />
          )}
          {task.type === 'brief' && (
            <BriefInput eventId={event.id} onUpdateEventData={onUpdateEventData} />
          )}
          {task.type === 'presentation' && (
            <PresentationInput eventId={event.id} onUpdateEventData={onUpdateEventData} />
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, tasks, dotColor, updateEventField, onUpdateEventData, onSelectEvent }) {
  if (tasks.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{title}</span>
        <span className="text-xs text-gray-400 font-medium">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      <div className="space-y-2">
        {tasks.map(t => (
          <TaskRow
            key={`${t.event.id}-${t.type}`}
            task={t}
            updateEventField={updateEventField}
            onUpdateEventData={onUpdateEventData}
            onSelectEvent={onSelectEvent}
          />
        ))}
      </div>
    </div>
  );
}

export default function UpcomingAttention({ onSelectEvent, eventData, onUpdateEventData, localEvents, updateEventField, fullPage, tagConfig }) {
  if (!localEvents) return null;

  // Build task list
  const allTasks = [];

  localEvents.forEach(e => {
    if (e.event !== 'Webinar' && e.event !== 'Workshop') return;
    if (daysDiff(e.date) < 0) return; // skip past events

    const eData = eventData?.[e.id] || {};
    const hasConfirmedSpeaker = e.speakers?.some(s => s.status === 'Confirmed');
    const hasBrief = !!eData.brief;
    const hasPresentation = !!eData.presentation;
    const callBooked = !!eData.callBooked;
    const contentReceived = !!eData.contentReceived;

    if (e.event === 'Webinar') {
      if (!hasConfirmedSpeaker) {
        const deadline = shiftDate(e.date, -30);
        allTasks.push({ type: 'speaker', deadline, event: e, daysUntilDeadline: daysDiff(deadline) });
      }
      if (!callBooked) {
        const deadline = shiftDate(e.date, -14);
        allTasks.push({ type: 'callBooked', deadline, event: e, daysUntilDeadline: daysDiff(deadline) });
      }
      if (!hasBrief) {
        const deadline = shiftDate(e.date, -11);
        allTasks.push({ type: 'brief', deadline, event: e, daysUntilDeadline: daysDiff(deadline) });
      }
      if (!contentReceived) {
        const deadline = shiftDate(e.date, -5);
        allTasks.push({ type: 'contentReceived', deadline, event: e, daysUntilDeadline: daysDiff(deadline) });
      }
      if (!hasPresentation) {
        const deadline = shiftDate(e.date, -2);
        allTasks.push({ type: 'presentation', deadline, event: e, daysUntilDeadline: daysDiff(deadline) });
      }
    }

    if (e.event === 'Workshop') {
      if (!hasConfirmedSpeaker) {
        const deadline = shiftDate(e.date, -28);
        allTasks.push({ type: 'speaker', deadline, event: e, daysUntilDeadline: daysDiff(deadline) });
      }
      if (!hasPresentation) {
        const deadline = shiftDate(e.date, -2);
        allTasks.push({ type: 'presentation', deadline, event: e, daysUntilDeadline: daysDiff(deadline) });
      }
    }
  });

  // Sort by urgency (most overdue first)
  allTasks.sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);

  const overdue = allTasks.filter(t => t.daysUntilDeadline < 0);
  const thisWeek = allTasks.filter(t => t.daysUntilDeadline >= 0 && t.daysUntilDeadline <= 7);
  const upcoming = allTasks.filter(t => t.daysUntilDeadline > 7);

  if (allTasks.length === 0) {
    if (!fullPage) return null;
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-14 h-14 rounded-full bg-lime-100 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-gray-900 font-semibold text-lg">All clear!</p>
        <p className="text-sm text-gray-400 mt-1">No tasks need attention right now.</p>
      </div>
    );
  }

  const sharedProps = { updateEventField, onUpdateEventData, onSelectEvent };

  return (
    <div className={fullPage ? '' : 'px-6 pt-5 pb-3'}>
      {/* Embedded header */}
      {!fullPage && (
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Action needed</span>
          </div>
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">{allTasks.length} task{allTasks.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Full-page summary pills */}
      {fullPage && allTasks.length > 0 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {overdue.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              {overdue.length} overdue
            </span>
          )}
          {thisWeek.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              {thisWeek.length} due this week
            </span>
          )}
          {upcoming.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
              {upcoming.length} upcoming
            </span>
          )}
        </div>
      )}

      <div className="space-y-6">
        <Section title="Overdue" tasks={overdue} dotColor="bg-red-500" {...sharedProps} />
        <Section title="Due this week" tasks={thisWeek} dotColor="bg-amber-400" {...sharedProps} />
        <Section title="Upcoming" tasks={upcoming} dotColor="bg-gray-300" {...sharedProps} />
      </div>
    </div>
  );
}
