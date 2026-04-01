import { useState, useMemo } from 'react';
import { SPEAKERS } from '../data/speakers';
import Badge from './Badge';

// Collect all unique categories
const ALL_CATEGORIES = Array.from(
  new Set(SPEAKERS.flatMap(s => s.categories))
).filter(Boolean).sort();

function pocColor(poc) {
  if (poc === 'Joana') return 'teal';
  if (poc === 'Helena') return 'purple';
  return 'coral';
}

function Stars({ rating }) {
  return (
    <span className="text-amber-400 text-sm">
      {'★'.repeat(rating)}
      <span className="text-gray-200">{'★'.repeat(3 - rating)}</span>
    </span>
  );
}

const PAGE_SIZE = 50;

const EMPTY_FORM = { name: '', title: '', company: '', linkedin: '', categories: '', rating: '3', poc: 'Roxanne', status: '' };

export default function SpeakerCRM() {
  const [localSpeakers, setLocalSpeakers] = useState(SPEAKERS);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [pocFilter, setPocFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [page, setPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingCell, setEditingCell] = useState(null); // { id, field }

  function updateSpeaker(id, field, value) {
    setLocalSpeakers(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  function startEdit(id, field, e) {
    e.stopPropagation();
    setEditingCell({ id, field });
  }

  function commitEdit(id, field, value) {
    updateSpeaker(id, field, value);
    setEditingCell(null);
  }

  const isEditing = (id, field) => editingCell?.id === id && editingCell?.field === field;

  function submitNewSpeaker(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const newSpeaker = {
      id: Date.now(),
      poc: form.poc,
      name: form.name.trim(),
      title: form.title.trim(),
      company: form.company.trim(),
      linkedin: form.linkedin.trim(),
      categories: form.categories.split(',').map(c => c.trim()).filter(Boolean),
      status: form.status.trim(),
      rating: Number(form.rating),
    };
    setLocalSpeakers(prev => [newSpeaker, ...prev]);
    setForm(EMPTY_FORM);
    setShowAddForm(false);
    setPage(1);
  }

  // Unique "status" groups (first word + pattern)
  const statusOptions = useMemo(() => {
    const set = new Set(localSpeakers.map(s => s.status).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [localSpeakers]);

  const filtered = useMemo(() => {
    let list = localSpeakers.filter(s => {
      const q = search.toLowerCase();
      if (q && !`${s.name} ${s.title} ${s.company}`.toLowerCase().includes(q)) return false;
      if (ratingFilter !== 'All' && s.rating !== Number(ratingFilter)) return false;
      if (pocFilter !== 'All' && s.poc !== pocFilter) return false;
      if (categoryFilter !== 'All' && !s.categories.includes(categoryFilter)) return false;
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'rating-asc') return a.rating - b.rating;
      return 0;
    });

    return list;
  }, [search, ratingFilter, pocFilter, categoryFilter, statusFilter, sortBy, localSpeakers]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const threeStars = localSpeakers.filter(s => s.rating === 3).length;
  const twoStars = localSpeakers.filter(s => s.rating === 2).length;
  const oneStar = localSpeakers.filter(s => s.rating === 1).length;
  const pocCounts = ['Roxanne', 'Joana', 'Helena'].map(name => ({
    name,
    count: localSpeakers.filter(s => s.poc === name).length,
  }));

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="px-6 pt-6 pb-5 bg-white border-b border-gray-100">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Speakers</h1>
            <p className="text-xs text-gray-400 mt-0.5">{localSpeakers.length} speakers in database</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Rating</span>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-xs text-amber-500">★★★</span>
                  <span className="text-sm font-bold text-amber-700">{threeStars}</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-xs text-amber-500">★★</span>
                  <span className="text-sm font-bold text-amber-700">{twoStars}</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xs text-gray-400">★</span>
                  <span className="text-sm font-bold text-gray-600">{oneStar}</span>
                </div>
              </div>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">POC</span>
              <div className="flex items-center gap-1.5">
                {pocCounts.map(p => (
                  <div key={p.name} className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-600">{p.name}</span>
                    <span className="text-sm font-bold text-gray-900">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-3 space-y-2 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <input
            type="text"
            placeholder="Search name, title, company..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          {/* Rating */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 font-medium">Rating:</span>
            {['All', '3', '2', '1', '0'].map(v => (
              <button
                key={v}
                onClick={() => { setRatingFilter(v); resetPage(); }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  ratingFilter === v ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {v === 'All' ? 'All' : '★'.repeat(Number(v)) || '—'}
              </button>
            ))}
          </div>

          {/* POC */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 font-medium">POC:</span>
            {['All', 'Roxanne', 'Joana', 'Helena'].map(v => (
              <button
                key={v}
                onClick={() => { setPocFilter(v); resetPage(); }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  pocFilter === v ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-gray-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-gray-300 rounded text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="name-asc">Name A→Z</option>
              <option value="name-desc">Name Z→A</option>
              <option value="rating-desc">Rating ↓</option>
              <option value="rating-asc">Rating ↑</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Category */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); resetPage(); }}
              className="border border-gray-300 rounded text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="All">All categories</option>
              {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Reach via:</span>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); resetPage(); }}
              className="border border-gray-300 rounded text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {statusOptions.map(o => <option key={o} value={o}>{o || '(no status)'}</option>)}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of {localSpeakers.length} speakers
            </span>
            <button
              onClick={() => setShowAddForm(v => !v)}
              className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              + Add Speaker
            </button>
          </div>
        </div>

        {/* Add speaker form */}
        {showAddForm && (
          <form onSubmit={submitNewSpeaker} className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-2 gap-3">
            <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">New Speaker</div>
            {[
              { label: 'Name *', key: 'name', placeholder: 'Full name' },
              { label: 'Title', key: 'title', placeholder: 'Job title' },
              { label: 'Company', key: 'company', placeholder: 'Company' },
              { label: 'LinkedIn URL', key: 'linkedin', placeholder: 'https://...' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-500 block mb-0.5">{f.label}</label>
                <input
                  type="text"
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">Categories (comma-separated)</label>
              <input
                type="text"
                value={form.categories}
                onChange={e => setForm(p => ({ ...p, categories: e.target.value }))}
                placeholder="Sales, Leadership..."
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">Reach via</label>
              <input
                type="text"
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                placeholder="From direct network..."
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div className="flex gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">Rating</label>
                <select value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400">
                  {['3','2','1','0'].map(r => <option key={r} value={r}>{'★'.repeat(Number(r)) || '—'}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">POC</label>
                <select value={form.poc} onChange={e => setForm(p => ({ ...p, poc: e.target.value }))}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400">
                  {['Roxanne','Joana','Helena'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="col-span-2 flex justify-end gap-2 mt-1">
              <button type="button" onClick={() => { setShowAddForm(false); setForm(EMPTY_FORM); }}
                className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                className="px-3 py-1.5 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-700 font-semibold">
                Add Speaker
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Table */}
      <div className="px-6 py-5 bg-gray-50">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16 text-sm">No speakers match your filters.</div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-2">Click any field to edit it inline.</p>
            <table className="w-full text-sm border-collapse bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categories</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">POC</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reach via</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">LinkedIn</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-gray-100 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    {/* Name */}
                    <td className="px-3 py-2 cursor-pointer" onClick={ev => startEdit(s.id, 'name', ev)}>
                      {isEditing(s.id, 'name') ? (
                        <input
                          autoFocus
                          type="text"
                          defaultValue={s.name}
                          onBlur={ev => commitEdit(s.id, 'name', ev.target.value)}
                          onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(s.id, 'name', ev.target.value); if (ev.key === 'Escape') setEditingCell(null); }}
                          onClick={ev => ev.stopPropagation()}
                          className="text-sm font-semibold border border-gray-300 rounded px-2 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                      ) : (
                        <span className="font-semibold text-gray-900 group whitespace-nowrap hover:text-black">
                          {s.name}
                          <span className="ml-1 opacity-0 group-hover:opacity-30 text-[10px]">✎</span>
                        </span>
                      )}
                    </td>

                    {/* Title */}
                    <td className="px-3 py-2 cursor-pointer" onClick={ev => startEdit(s.id, 'title', ev)}>
                      {isEditing(s.id, 'title') ? (
                        <input
                          autoFocus
                          type="text"
                          defaultValue={s.title}
                          onBlur={ev => commitEdit(s.id, 'title', ev.target.value)}
                          onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(s.id, 'title', ev.target.value); if (ev.key === 'Escape') setEditingCell(null); }}
                          onClick={ev => ev.stopPropagation()}
                          className="text-sm border border-gray-300 rounded px-2 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                      ) : (
                        <span className="text-gray-800 group hover:text-gray-900">
                          {s.title || <span className="text-gray-300">—</span>}
                          <span className="ml-1 opacity-0 group-hover:opacity-30 text-[10px]">✎</span>
                        </span>
                      )}
                    </td>

                    {/* Company */}
                    <td className="px-3 py-2 cursor-pointer" onClick={ev => startEdit(s.id, 'company', ev)}>
                      {isEditing(s.id, 'company') ? (
                        <input
                          autoFocus
                          type="text"
                          defaultValue={s.company}
                          onBlur={ev => commitEdit(s.id, 'company', ev.target.value)}
                          onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(s.id, 'company', ev.target.value); if (ev.key === 'Escape') setEditingCell(null); }}
                          onClick={ev => ev.stopPropagation()}
                          className="text-sm border border-gray-300 rounded px-2 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                      ) : (
                        <span className="text-gray-500 text-xs group hover:text-gray-700">
                          {s.company || <span className="text-gray-300">—</span>}
                          <span className="ml-1 opacity-0 group-hover:opacity-30 text-[10px]">✎</span>
                        </span>
                      )}
                    </td>

                    {/* Categories */}
                    <td className="px-3 py-2 cursor-pointer" onClick={ev => startEdit(s.id, 'categories', ev)}>
                      {isEditing(s.id, 'categories') ? (
                        <input
                          autoFocus
                          type="text"
                          defaultValue={s.categories.join(', ')}
                          onBlur={ev => commitEdit(s.id, 'categories', ev.target.value.split(',').map(c => c.trim()).filter(Boolean))}
                          onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(s.id, 'categories', ev.target.value.split(',').map(c => c.trim()).filter(Boolean)); if (ev.key === 'Escape') setEditingCell(null); }}
                          onClick={ev => ev.stopPropagation()}
                          placeholder="Sales, Leadership..."
                          className="text-xs border border-gray-300 rounded px-2 py-0.5 w-full min-w-[140px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {s.categories.slice(0, 3).map(c => (
                            <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">
                              {c}
                            </span>
                          ))}
                          {s.categories.length > 3 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-xs border border-gray-200">
                              +{s.categories.length - 3}
                            </span>
                          )}
                          {s.categories.length === 0 && <span className="text-gray-300 text-xs">—</span>}
                        </div>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="px-3 py-2 whitespace-nowrap cursor-pointer" onClick={ev => startEdit(s.id, 'rating', ev)}>
                      {isEditing(s.id, 'rating') ? (
                        <select
                          autoFocus
                          value={s.rating}
                          onChange={ev => commitEdit(s.id, 'rating', Number(ev.target.value))}
                          onBlur={() => setEditingCell(null)}
                          onClick={ev => ev.stopPropagation()}
                          className="text-sm border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        >
                          {['3','2','1','0'].map(r => <option key={r} value={r}>{'★'.repeat(Number(r)) || '—'}</option>)}
                        </select>
                      ) : (
                        <span className="group">
                          <Stars rating={s.rating} />
                          <span className="ml-1 opacity-0 group-hover:opacity-30 text-[10px]">✎</span>
                        </span>
                      )}
                    </td>

                    {/* POC */}
                    <td className="px-3 py-2 whitespace-nowrap cursor-pointer" onClick={ev => startEdit(s.id, 'poc', ev)}>
                      {isEditing(s.id, 'poc') ? (
                        <select
                          autoFocus
                          value={s.poc}
                          onChange={ev => commitEdit(s.id, 'poc', ev.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onClick={ev => ev.stopPropagation()}
                          className="text-sm border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        >
                          {['Roxanne', 'Joana', 'Helena'].map(p => <option key={p}>{p}</option>)}
                        </select>
                      ) : (
                        <span className="group">
                          <Badge color={pocColor(s.poc)}>{s.poc}</Badge>
                          <span className="ml-1 opacity-0 group-hover:opacity-30 text-[10px]">✎</span>
                        </span>
                      )}
                    </td>

                    {/* Reach via */}
                    <td className="px-3 py-2 cursor-pointer max-w-[160px]" onClick={ev => startEdit(s.id, 'status', ev)}>
                      {isEditing(s.id, 'status') ? (
                        <input
                          autoFocus
                          type="text"
                          defaultValue={s.status}
                          onBlur={ev => commitEdit(s.id, 'status', ev.target.value)}
                          onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(s.id, 'status', ev.target.value); if (ev.key === 'Escape') setEditingCell(null); }}
                          onClick={ev => ev.stopPropagation()}
                          className="text-xs border border-gray-300 rounded px-2 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                      ) : (
                        <span className="text-xs text-gray-500 group hover:text-gray-700">
                          {s.status || <span className="text-gray-300">—</span>}
                          <span className="ml-1 opacity-0 group-hover:opacity-30 text-[10px]">✎</span>
                        </span>
                      )}
                    </td>

                    {/* LinkedIn */}
                    <td className="px-3 py-2 cursor-pointer" onClick={ev => startEdit(s.id, 'linkedin', ev)}>
                      {isEditing(s.id, 'linkedin') ? (
                        <input
                          autoFocus
                          type="text"
                          defaultValue={s.linkedin}
                          onBlur={ev => commitEdit(s.id, 'linkedin', ev.target.value)}
                          onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(s.id, 'linkedin', ev.target.value); if (ev.key === 'Escape') setEditingCell(null); }}
                          onClick={ev => ev.stopPropagation()}
                          placeholder="https://linkedin.com/in/..."
                          className="text-xs border border-gray-300 rounded px-2 py-0.5 w-full min-w-[160px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                      ) : s.linkedin ? (
                        <a
                          href={s.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={ev => ev.stopPropagation()}
                          className="inline-flex items-center justify-center w-7 h-7 rounded bg-blue-600 hover:bg-blue-700 transition-colors"
                          title="View LinkedIn"
                        >
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs group hover:text-gray-400">
                          + add URL
                          <span className="ml-1 opacity-0 group-hover:opacity-40 text-[10px]">✎</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
