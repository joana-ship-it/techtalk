export const COLORS = {
  lavender: { bg: 'bg-[#faeeff]', text: 'text-[#9333ea]', border: 'border-[#ecc8ff]', dot: 'bg-[#d8b4fe]', hex: '#faeeff' },
  cream:    { bg: 'bg-[#f9f7f0]', text: 'text-[#6b6355]', border: 'border-[#c8c0b0]', dot: 'bg-[#a09b8e]', hex: '#f9f7f0' },
  amber:    { bg: 'bg-amber-100',  text: 'text-amber-800',  border: 'border-amber-200',  dot: 'bg-amber-400',  hex: '#fcd34d' },
  orange:   { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-400', hex: '#fdba74' },
  lime:     { bg: 'bg-lime-100',   text: 'text-lime-800',   border: 'border-lime-300',   dot: 'bg-lime-500',   hex: '#bef264' },
  black:    { bg: 'bg-gray-900',   text: 'text-white',      border: 'border-gray-700',   dot: 'bg-white',      hex: '#111827' },
  green:    { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200',  dot: 'bg-green-500',  hex: '#86efac' },
  teal:     { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500',   hex: '#5eead4' },
  sky:      { bg: 'bg-sky-100',    text: 'text-sky-800',    border: 'border-sky-200',    dot: 'bg-sky-500',    hex: '#7dd3fc' },
  violet:   { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200', dot: 'bg-violet-500', hex: '#ddd6fe' },
  rose:     { bg: 'bg-rose-100',   text: 'text-rose-700',   border: 'border-rose-200',   dot: 'bg-rose-400',   hex: '#fda4af' },
  gray:     { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200',   dot: 'bg-gray-400',   hex: '#d1d5db' },
};

export const COLOR_IDS = Object.keys(COLORS);

export const DEFAULT_TAG_CONFIG = {
  eventFormats: [
    { label: 'Webinar', colorId: 'lime' },
    { label: 'Workshop', colorId: 'lavender' },
    { label: 'Monthly Mixer', colorId: 'cream' },
    { label: 'Breakfast Club', colorId: 'orange' },
  ],
  audienceTypes: [
    { label: 'Job Seeker', colorId: 'sky' },
    { label: 'Career Growth', colorId: 'violet' },
  ],
  statuses: [
    { label: 'Done', colorId: 'green' },
    { label: 'In progress', colorId: 'amber' },
    { label: 'Not started', colorId: 'gray' },
  ],
  owners: [
    { label: 'Roxanne', colorId: 'rose' },
    { label: 'Joana', colorId: 'teal' },
    { label: 'Joana, Roxanne', colorId: 'purple' },
  ],
};
