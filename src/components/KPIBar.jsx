import { EVENTS } from '../data/events';

const stats = [
  { label: 'Total Events',  value: EVENTS.length,                                           color: 'text-gray-800' },
  { label: 'Done',          value: EVENTS.filter(e => e.status === 'Done').length,           color: 'text-green-600' },
  { label: 'In Progress',   value: EVENTS.filter(e => e.status === 'In progress').length,    color: 'text-amber-500' },
  { label: 'Not Started',   value: EVENTS.filter(e => e.status === 'Not started').length,    color: 'text-gray-400' },
  { label: 'Job Seeker',    value: EVENTS.filter(e => e.type === 'Job Seeker').length,       color: 'text-blue-600' },
  { label: 'Career Growth', value: EVENTS.filter(e => e.type === 'Career Growth').length,   color: 'text-purple-600' },
];

export default function KPIBar() {
  return (
    <div className="grid grid-cols-6 gap-3 px-6 py-4 bg-white border-b border-gray-200">
      {stats.map(s => (
        <div key={s.label} className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center shadow-sm">
          <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
