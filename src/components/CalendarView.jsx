import { useState } from 'react';
import { COLORS } from '../data/tagConfig';
import EventDetailPanel from './EventDetailPanel';
import EventListView from './EventListView';
import TagManager from './TagManager';
import CreateEventModal from './CreateEventModal';

const MONTHS = [
  { label: 'Jan', value: 0, year: 2026 },
  { label: 'Feb', value: 1, year: 2026 },
  { label: 'Mar', value: 2, year: 2026 },
  { label: 'Apr', value: 3, year: 2026 },
  { label: 'May', value: 4, year: 2026 },
  { label: 'Jun', value: 5, year: 2026 },
  { label: 'Jul', value: 6, year: 2026 },
  { label: 'Aug', value: 7, year: 2026 },
  { label: 'Sep', value: 8, year: 2026 },
  { label: 'Oct', value: 9, year: 2026 },
  { label: 'Nov', value: 10, year: 2026 },
  { label: 'Dec', value: 11, year: 2026 },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

export default function CalendarView({
  localEvents,
  eventData,
  tagConfig,
  setTagConfig,
  updateEventField,
  updateEventData,
  createEvent,
  deleteEvent,
}) {
  const [monthIdx, setMonthIdx] = useState(() => {
    const now = new Date();
    const idx = MONTHS.findIndex(m => m.value === now.getMonth() && m.year === now.getFullYear());
    return idx >= 0 ? idx : 0;
  });
  const [viewMode, setViewMode] = useState('calendar');
  const [typeFilter, setTypeFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showTagManager, setShowTagManager] = useState(false);
  const [createDate, setCreateDate] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);

  const getMergedEvent = (event) =>
    localEvents.find(e => e.id === event.id) || event;

  // Drag handlers
  function handleDragStart(e, eventId) {
    setDraggedId(eventId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(eventId));
  }

  function handleDrop(e, day) {
    e.preventDefault();
    if (draggedId === null) return;
    const newDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    updateEventField(draggedId, 'date', newDate);
    setDraggedId(null);
    setDragOverDay(null);
  }

  function handleDragOver(e, day) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDay(day);
  }

  // Tag color helpers
  function tagColor(list, label) {
    const tag = list.find(t => t.label === label);
    return COLORS[tag?.colorId] || COLORS.gray;
  }
  const formatColor = (label) => tagColor(tagConfig.eventFormats, label);
  const statusColor = (label) => tagColor(tagConfig.statuses, label);

  function pillClasses(event, isDragging) {
    const c = formatColor(event.event);
    return `${c.bg} ${c.text} border ${c.border}${isDragging ? ' opacity-40' : ''}`;
  }

  const { value: month, year } = MONTHS[monthIdx];
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const filtered = localEvents.filter(e => {
    const d = new Date(e.date + 'T12:00:00');
    if (viewMode === 'calendar' && (d.getFullYear() !== year || d.getMonth() !== month)) return false;
    if (typeFilter !== 'All' && e.type !== typeFilter) return false;
    if (ownerFilter !== 'All' && e.owner !== ownerFilter) return false;
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return (a.time || '').localeCompare(b.time || '');
  });

  const eventsByDay = {};
  filtered.forEach(e => {
    const day = new Date(e.date + 'T12:00:00').getDate();
    if (!eventsByDay[day]) eventsByDay[day] = [];
    eventsByDay[day].push(e);
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = (day) =>
    day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  function dayToDateStr(day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const doneCnt = localEvents.filter(e => e.status === 'Done').length;
  const inProgressCnt = localEvents.filter(e => e.status === 'In progress').length;
  const notStartedCnt = localEvents.filter(e => e.status === 'Not started').length;

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="px-6 pt-6 pb-5 bg-white border-b border-gray-100">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Event Calendar</h1>
            <p className="text-xs text-gray-400 mt-0.5">2026 Season · {localEvents.length} events</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400">Total</span>
              <span className="text-sm font-bold text-gray-900">{localEvents.length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-xs text-emerald-600">Done</span>
              <span className="text-sm font-bold text-emerald-700">{doneCnt}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-xs text-amber-600">In progress</span>
              <span className="text-sm font-bold text-amber-700">{inProgressCnt}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
              <span className="text-xs text-gray-500">Not started</span>
              <span className="text-sm font-bold text-gray-600">{notStartedCnt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-3 flex items-center gap-3 flex-wrap shadow-sm">
        {/* View toggle */}
        <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'calendar' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2"/>
            </svg>
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors border-l border-gray-200 ${
              viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            List
          </button>
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Type filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">Type:</span>
          {['All', ...tagConfig.audienceTypes.map(t => t.label)].map(v => (
            <button key={v} onClick={() => setTypeFilter(v)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${typeFilter === v ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
              {v}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Owner filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">Owner:</span>
          {['All', ...tagConfig.owners.map(t => t.label)].map(v => (
            <button key={v} onClick={() => setOwnerFilter(v)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${ownerFilter === v ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
              {v}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          {['All', ...tagConfig.statuses.map(t => t.label)].map(v => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${statusFilter === v ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
              {v}
            </button>
          ))}
        </div>

        {/* Manage Tags */}
        <button
          onClick={() => setShowTagManager(true)}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Manage Tags
        </button>
      </div>

      {/* Main content */}
      <div className="px-6 py-5 bg-gray-50">
        {viewMode === 'list' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Events</h2>
                <p className="text-xs text-gray-400 mt-0.5">{filtered.length} event{filtered.length !== 1 ? 's' : ''} total</p>
              </div>
            </div>
            <EventListView
              events={filtered}
              onSelectEvent={setSelectedEvent}
              getMergedEvent={getMergedEvent}
              tagConfig={tagConfig}
              updateEventField={updateEventField}
              deleteEvent={deleteEvent}
            />
          </>
        ) : (
          <>
            {/* Month nav */}
            <div className="flex items-center gap-1 mb-5 bg-white rounded-2xl px-3 py-2 border border-gray-100 shadow-sm">
              <button
                onClick={() => setMonthIdx(i => Math.max(0, i - 1))}
                className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 flex-shrink-0"
                disabled={monthIdx === 0}
              >‹</button>
              <div className="flex gap-1 flex-wrap flex-1 justify-center">
                {MONTHS.map((m, i) => (
                  <button
                    key={m.label}
                    onClick={() => setMonthIdx(i)}
                    className={`px-2.5 py-1 rounded text-sm font-medium transition-colors ${
                      i === monthIdx ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setMonthIdx(i => Math.min(MONTHS.length - 1, i + 1))}
                className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 flex-shrink-0"
                disabled={monthIdx === MONTHS.length - 1}
              >›</button>
            </div>

            {/* Month heading + legend */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{MONTHS[monthIdx].label} 2026</h2>
                <p className="text-xs text-gray-400 mt-0.5">{filtered.length} event{filtered.length !== 1 ? 's' : ''} this month</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                {tagConfig.eventFormats.map(t => {
                  const c = COLORS[t.colorId] || COLORS.gray;
                  return (
                    <span key={t.label} className={`inline-block px-2 py-0.5 rounded-full border font-medium ${c.bg} ${c.text} ${c.border}`}>
                      {t.label}
                    </span>
                  );
                })}
                <span className="w-px h-3 bg-gray-200" />
                {tagConfig.statuses.map(t => {
                  const c = COLORS[t.colorId] || COLORS.gray;
                  return (
                    <span key={t.label} className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full inline-block ${c.dot}`} />
                      {t.label}
                    </span>
                  );
                })}
                <span className="w-px h-3 bg-gray-200" />
                <span className="text-gray-400 italic text-xs">Drag to reschedule</span>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-1.5">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-2">
              {cells.map((day, idx) => (
                <div
                  key={idx}
                  onDragOver={day ? (e) => handleDragOver(e, day) : undefined}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={day ? (e) => handleDrop(e, day) : undefined}
                  className={`min-h-28 rounded-xl p-2.5 border transition-all group ${
                    day
                      ? dragOverDay === day && draggedId !== null
                        ? 'bg-indigo-50 border-indigo-400 border-2 shadow-md'
                        : isToday(day)
                          ? 'bg-lime-50 border-lime-200 ring-2 ring-lime-100'
                          : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                      : 'bg-gray-50/50 border-gray-50'
                  }`}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday(day) ? 'bg-gray-900 text-white' : 'text-gray-400'
                        }`}>
                          {day}
                        </div>
                        <button
                          onClick={() => setCreateDate(dayToDateStr(day))}
                          className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-base leading-none font-light"
                          title="Add event"
                        >+</button>
                      </div>

                      <div className="space-y-1">
                        {(eventsByDay[day] || []).map(e => {
                          const merged = getMergedEvent(e);
                          const sc = statusColor(merged.status);
                          const isDragging = draggedId === e.id;
                          return (
                            <div
                              key={e.id}
                              draggable
                              onDragStart={(ev) => handleDragStart(ev, e.id)}
                              onDragEnd={() => { setDraggedId(null); setDragOverDay(null); }}
                              onClick={() => !isDragging && setSelectedEvent(e)}
                              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex flex-col gap-0 cursor-pointer hover:opacity-80 transition-opacity ${pillClasses(merged, isDragging)}`}
                            >
                              {merged.time && (
                                <span className="font-semibold opacity-70 text-[10px] leading-tight">{merged.time}</span>
                              )}
                              <span className="flex items-start gap-0.5 leading-snug">
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0 ${sc.dot}`} />
                                <span>{merged.title || merged.event}</span>
                              </span>
                              {merged.type && (() => {
                                const audTag = tagConfig?.audienceTypes?.find(t => t.label === merged.type);
                                const audC = COLORS[audTag?.colorId] || COLORS.gray;
                                return (
                                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full self-start mt-0.5 border ${audC.bg} ${audC.text} ${audC.border}`}>
                                    {merged.type}
                                  </span>
                                );
                              })()}
                              {merged.speakers?.some(s => s.status === 'Confirmed') && (
                                <span className="text-[10px] opacity-60 leading-tight truncate pl-2">
                                  {merged.speakers.filter(s => s.status === 'Confirmed').map(s => s.name).join(', ')}
                                </span>
                              )}
                            </div>
                          );
                        })}

                        {(eventsByDay[day] || []).length === 0 && (
                          <button
                            onClick={() => setCreateDate(dayToDateStr(day))}
                            className="w-full text-left px-1 py-0.5 rounded text-[10px] text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                          >
                            + add event
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center text-gray-400 py-16 text-sm">No events this month match your filters.</div>
            )}
          </>
        )}
      </div>

      {selectedEvent && (
        <EventDetailPanel
          event={getMergedEvent(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          brief={eventData[selectedEvent.id]?.brief ?? ''}
          easterEgg={eventData[selectedEvent.id]?.easterEgg ?? ''}
          presentation={eventData[selectedEvent.id]?.presentation ?? ''}
          onUpdateBrief={v => updateEventData(selectedEvent.id, 'brief', v)}
          onUpdateEasterEgg={v => updateEventData(selectedEvent.id, 'easterEgg', v)}
          onUpdatePresentation={v => updateEventData(selectedEvent.id, 'presentation', v)}
          onUpdateField={(field, value) => updateEventField(selectedEvent.id, field, value)}
          onDelete={() => { deleteEvent(selectedEvent.id); setSelectedEvent(null); }}
          tagConfig={tagConfig}
        />
      )}

      {showTagManager && (
        <TagManager
          tagConfig={tagConfig}
          onUpdate={setTagConfig}
          onClose={() => setShowTagManager(false)}
        />
      )}

      {createDate && (
        <CreateEventModal
          date={createDate}
          tagConfig={tagConfig}
          onSave={e => { createEvent(e); setCreateDate(null); }}
          onClose={() => setCreateDate(null)}
        />
      )}
    </div>
  );
}
