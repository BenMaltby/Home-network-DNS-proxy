import type { TopBlockedEntry } from '../../api/types';

export default function TopBlockedList({ data }: { data: TopBlockedEntry[] }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="mb-3 text-sm font-medium text-gray-300">Top blocked domains</div>
      {data.length === 0 ? (
        <div className="text-sm text-gray-500">No blocked queries yet.</div>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.map(({ domain, count }) => (
            <li key={domain} className="flex items-center justify-between text-sm">
              <span className="truncate text-gray-300">{domain}</span>
              <span className="ml-2 shrink-0 rounded bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-400">
                {count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
