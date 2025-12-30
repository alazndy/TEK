import React from 'react';

export function ShortcutKey({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex gap-1">
      {keys.map((key, i) => (
        <kbd 
          key={i}
          className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
