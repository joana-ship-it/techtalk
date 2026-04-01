import { useState } from 'react';
import UpcomingAttention from './UpcomingAttention';
import EventDetailPanel from './EventDetailPanel';

export default function ActionNeededView({ localEvents, eventData, tagConfig, updateEventField, updateEventData, deleteEvent }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const getMergedEvent = (event) => localEvents.find(e => e.id === event.id) || event;

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-100 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Action Needed</h1>
        <p className="text-xs text-gray-400 mt-0.5">Events requiring your attention in the next 4 weeks</p>
      </div>

      <div className="px-6 py-5 bg-gray-50 flex-1">
        <UpcomingAttention
          onSelectEvent={setSelectedEvent}
          eventData={eventData}
          onUpdateEventData={updateEventData}
          localEvents={localEvents}
          updateEventField={updateEventField}
          tagConfig={tagConfig}
          fullPage
        />
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
    </div>
  );
}
