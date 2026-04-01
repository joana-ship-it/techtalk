import { useState, useEffect } from 'react';
import { EVENTS } from './data/events';
import { DEFAULT_TAG_CONFIG } from './data/tagConfig';
import CalendarView from './components/CalendarView';
import ActionNeededView from './components/ActionNeededView';
import SpeakerCRM from './components/SpeakerCRM';
import './index.css';

function loadStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

const NAV = [
  {
    id: 'action-needed',
    label: 'Action Needed',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'events',
    label: 'Event Calendar',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/>
        <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: 'speakers',
    label: 'Speakers',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="4" strokeWidth="2"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('action-needed');

  const [localEvents, setLocalEvents] = useState(() =>
    loadStorage('techtalk-events', EVENTS.map(e => ({ ...e })))
  );
  const [eventData, setEventData] = useState(() =>
    loadStorage('techtalk-eventData', Object.fromEntries(EVENTS.map(e => [e.id, { brief: '', easterEgg: '' }])))
  );
  const [tagConfig, setTagConfig] = useState(() =>
    loadStorage('techtalk-tagConfig-v5', DEFAULT_TAG_CONFIG)
  );

  useEffect(() => { localStorage.setItem('techtalk-events', JSON.stringify(localEvents)); }, [localEvents]);
  useEffect(() => { localStorage.setItem('techtalk-eventData', JSON.stringify(eventData)); }, [eventData]);
  useEffect(() => { localStorage.setItem('techtalk-tagConfig-v5', JSON.stringify(tagConfig)); }, [tagConfig]);

  const updateEventField = (id, field, value) =>
    setLocalEvents(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));

  const updateEventData = (id, field, value) =>
    setEventData(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  function createEvent(newEvent) {
    setLocalEvents(prev => [...prev, newEvent]);
    setEventData(prev => ({ ...prev, [newEvent.id]: { brief: '', easterEgg: '' } }));
  }

  function deleteEvent(id) {
    setLocalEvents(prev => prev.filter(e => e.id !== id));
    setEventData(prev => { const next = { ...prev }; delete next[id]; return next; });
  }

  const total = localEvents.length;
  const stats = [
    { label: 'Total', value: total },
    { label: 'Done', value: localEvents.filter(e => e.status === 'Done').length, color: 'text-emerald-400' },
    { label: 'In progress', value: localEvents.filter(e => e.status === 'In progress').length, color: 'text-amber-400' },
    { label: 'Not started', value: localEvents.filter(e => e.status === 'Not started').length, color: 'text-slate-400' },
  ];

  const audience = [
    { label: 'Job Seeker', value: localEvents.filter(e => e.type === 'Job Seeker').length, color: 'bg-lime-300' },
    { label: 'Career Growth', value: localEvents.filter(e => e.type === 'Career Growth').length, color: 'bg-purple-400' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 flex-shrink-0 bg-black flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-lime-300 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-900 text-xs font-black tracking-tight">TT</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">TechTalk</div>
              <div className="text-slate-500 text-xs">2026 Season</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 pt-4 space-y-0.5">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === item.id
                  ? 'bg-lime-300 text-gray-900'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Stats */}
        <div className="px-4 mt-6">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Overview</div>
          <div className="space-y-2.5">
            {stats.map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{s.label}</span>
                <span className={`text-sm font-bold ${s.color || 'text-white'}`}>{s.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Audience</div>
            <div className="space-y-2">
              {audience.map(a => (
                <div key={a.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{a.label}</span>
                    <span className="text-xs font-semibold text-white">{a.value}</span>
                  </div>
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${a.color}`}
                      style={{ width: total > 0 ? `${(a.value / total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto px-4 pb-5 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-500">TechTalk Community</div>
          <div className="text-xs text-slate-600 mt-0.5">Internal planning tool</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {activeTab === 'action-needed' && (
          <ActionNeededView
            localEvents={localEvents}
            eventData={eventData}
            tagConfig={tagConfig}
            updateEventField={updateEventField}
            updateEventData={updateEventData}
            deleteEvent={deleteEvent}
          />
        )}
        {activeTab === 'events' && (
          <CalendarView
            localEvents={localEvents}
            eventData={eventData}
            tagConfig={tagConfig}
            setTagConfig={setTagConfig}
            updateEventField={updateEventField}
            updateEventData={updateEventData}
            createEvent={createEvent}
            deleteEvent={deleteEvent}
          />
        )}
        {activeTab === 'speakers' && <SpeakerCRM />}
      </main>
    </div>
  );
}
