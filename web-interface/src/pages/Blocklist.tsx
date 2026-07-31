import { useCallback, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { usePolling } from '../hooks/usePolling';

export default function Blocklist() {
  const fetcher = useCallback(() => api.getBlocklist(), []);
  const { data, refresh } = usePolling(fetcher, 15000);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.refreshBlocklist();
      refresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Blocklist</h1>

      <div className="rounded-lg border border-gray-800 bg-gray-900 p-5 flex flex-col gap-4 max-w-xl">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Source</div>
          <div className="mt-1 break-all text-sm text-gray-300">{data?.sourceUrl ?? '—'}</div>
        </div>
        <div className="flex gap-8">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Entries (reported)</div>
            <div className="mt-1 text-2xl font-semibold">{data ? data.size.toLocaleString() : '—'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Last loaded</div>
            <div className="mt-1 text-sm text-gray-300">
              {data?.loadedAt ? new Date(data.loadedAt).toLocaleString() : 'Never'}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Entry count is reported by the blocklist source itself, not a live count of loaded domains.
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex w-fit items-center gap-2 rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-gray-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh now'}
        </button>
      </div>
    </div>
  );
}
