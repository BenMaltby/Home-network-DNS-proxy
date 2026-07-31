import { useCallback, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../api/client';
import { usePolling } from '../hooks/usePolling';

type StatusFilter = 'all' | 'blocked' | 'allowed' | 'local';

export default function QueryLog() {
  const fetcher = useCallback(() => api.getQueries(200), []);
  const { data, loading } = usePolling(fetcher, 5000);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return data.filter((entry) => {
      if (status === 'blocked' && !entry.blocked) return false;
      if (status === 'allowed' && (entry.blocked || entry.local)) return false;
      if (status === 'local' && !entry.local) return false;
      if (term && !entry.domain.includes(term) && !entry.client.includes(term)) return false;
      return true;
    });
  }, [data, search, status]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Query Log</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-2 rounded-md border border-gray-700 bg-gray-900 px-3 py-1.5">
          <Search size={16} className="shrink-0 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by domain or client IP"
            className="w-full bg-transparent text-sm text-gray-200 outline-none placeholder:text-gray-600 sm:w-64"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {(['all', 'blocked', 'allowed', 'local'] as StatusFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatus(option)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                status === option ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Domain</th>
              <th className="px-4 py-2 font-medium">Client</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map((entry, i) => (
              <tr key={`${entry.timestamp}-${i}`} className="text-gray-300">
                <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-4 py-2 font-mono whitespace-nowrap">{entry.domain}</td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-500">{entry.client}</td>
                <td className="px-4 py-2">
                  {entry.local ? (
                    <span className="rounded bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-400">local</span>
                  ) : entry.blocked ? (
                    <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-400">blocked</span>
                  ) : (
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      allowed
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No queries match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
