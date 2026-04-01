import { useState } from 'react';
import { COLORS, COLOR_IDS } from '../data/tagConfig';

const SECTIONS = [
  { key: 'eventFormats', label: 'Event Format' },
  { key: 'audienceTypes', label: 'Audience Type' },
  { key: 'statuses', label: 'Status' },
  { key: 'owners', label: 'Owner' },
];

function TagRow({ tag, onChange, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tag.label);
  const color = COLORS[tag.colorId] || COLORS.gray;

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== tag.label) onChange({ ...tag, label: trimmed });
    else setDraft(tag.label);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
      {/* Badge preview */}
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border flex-shrink-0 min-w-[60px] text-center ${color.bg} ${color.text} ${color.border}`}>
        {tag.label}
      </span>

      {/* Label editor */}
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') { setDraft(tag.label); setEditing(false); }
          }}
          className="text-xs border border-indigo-300 rounded px-2 py-0.5 w-28 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      ) : (
        <button
          onClick={() => { setDraft(tag.label); setEditing(true); }}
          className="text-xs text-gray-400 hover:text-indigo-600 underline decoration-dashed underline-offset-2 whitespace-nowrap"
        >
          Rename
        </button>
      )}

      {/* Color swatches */}
      <div className="flex gap-1 ml-auto flex-wrap">
        {COLOR_IDS.map(id => (
          <button
            key={id}
            onClick={() => onChange({ ...tag, colorId: id })}
            style={{ backgroundColor: COLORS[id].hex }}
            title={id}
            className={`w-3.5 h-3.5 rounded-full border-2 transition-transform hover:scale-125 flex-shrink-0 ${
              tag.colorId === id ? 'border-gray-700 scale-110' : 'border-white'
            }`}
          />
        ))}
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="text-gray-300 hover:text-red-400 text-lg leading-none flex-shrink-0 ml-1 transition-colors"
        title="Remove tag"
      >
        ×
      </button>
    </div>
  );
}

export default function TagManager({ tagConfig, onUpdate, onClose }) {
  function updateTag(sectionKey, idx, updated) {
    onUpdate({
      ...tagConfig,
      [sectionKey]: tagConfig[sectionKey].map((t, i) => i === idx ? updated : t),
    });
  }

  function deleteTag(sectionKey, idx) {
    onUpdate({
      ...tagConfig,
      [sectionKey]: tagConfig[sectionKey].filter((_, i) => i !== idx),
    });
  }

  function addTag(sectionKey) {
    onUpdate({
      ...tagConfig,
      [sectionKey]: [...tagConfig[sectionKey], { label: 'New tag', colorId: 'gray' }],
    });
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[460px] bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Manage Tags</h2>
            <p className="text-xs text-gray-400 mt-0.5">Add, rename, or recolour tags for each category</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {SECTIONS.map(section => (
            <div key={section.key}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {section.label}
              </div>
              <div className="bg-gray-50 rounded-lg px-3 divide-y divide-gray-100">
                {tagConfig[section.key].length === 0 && (
                  <div className="text-xs text-gray-400 italic py-3 text-center">No tags — add one below</div>
                )}
                {tagConfig[section.key].map((tag, i) => (
                  <TagRow
                    key={i}
                    tag={tag}
                    onChange={updated => updateTag(section.key, i, updated)}
                    onDelete={() => deleteTag(section.key, i)}
                  />
                ))}
              </div>
              <button
                onClick={() => addTag(section.key)}
                className="mt-2 w-full text-xs text-indigo-500 hover:text-indigo-700 border border-dashed border-indigo-200 hover:border-indigo-400 rounded-lg py-1.5 transition-colors"
              >
                + Add tag
              </button>
            </div>
          ))}

          {/* Color legend */}
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Color palette</div>
            <div className="flex flex-wrap gap-2">
              {COLOR_IDS.map(id => (
                <div key={id} className="flex items-center gap-1">
                  <span
                    style={{ backgroundColor: COLORS[id].hex }}
                    className="w-3 h-3 rounded-full inline-block"
                  />
                  <span className="text-xs text-gray-500 capitalize">{id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
