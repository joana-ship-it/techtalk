const colorMap = {
  blue:   'bg-blue-100 text-blue-800 border border-blue-200',
  purple: 'bg-purple-100 text-purple-800 border border-purple-200',
  green:  'bg-green-100 text-green-800 border border-green-200',
  amber:  'bg-amber-100 text-amber-800 border border-amber-200',
  coral:  'bg-rose-100 text-rose-700 border border-rose-200',
  teal:   'bg-teal-100 text-teal-700 border border-teal-200',
  grey:   'bg-gray-100 text-gray-600 border border-gray-200',
  red:    'bg-red-100 text-red-700 border border-red-200',
};

export default function Badge({ color = 'grey', children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[color] ?? colorMap.grey} ${className}`}>
      {children}
    </span>
  );
}
