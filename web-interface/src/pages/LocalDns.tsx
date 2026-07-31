import { useCallback, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { usePolling } from '../hooks/usePolling';

export default function LocalDns() {
  const fetcher = useCallback(() => api.getRecords(), []);
  const { data, refresh } = usePolling(fetcher, 10000);
  const [hostname, setHostname] = useState('');
  const [ip, setIp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.addRecord(hostname, ip);
      setHostname('');
      setIp('');
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (recordHostname: string) => {
    await api.removeRecord(recordHostname);
    refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Local DNS</h1>
      <p className="text-sm text-gray-500">
        Custom <span className="font-mono">.home</span> hostnames resolved directly by this server, without ever
        touching the blocklist or upstream resolver.
      </p>

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500" htmlFor="hostname">
            Hostname
          </label>
          <input
            id="hostname"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            placeholder="nas.home"
            className="w-full rounded-md border border-gray-700 bg-gray-950 px-2 py-1.5 text-sm text-gray-200 sm:w-48"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500" htmlFor="ip">
            IP address
          </label>
          <input
            id="ip"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="192.168.1.50"
            className="w-full rounded-md border border-gray-700 bg-gray-950 px-2 py-1.5 text-sm text-gray-200 sm:w-48"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-gray-950 hover:bg-emerald-400 disabled:opacity-50 sm:w-auto"
        >
          <Plus size={16} />
          Add
        </button>
        {error && <span className="text-sm text-rose-400">{error}</span>}
      </form>

      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-4 py-2 font-medium">Hostname</th>
              <th className="px-4 py-2 font-medium">IP</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(data ?? []).map((record) => (
              <tr key={record.hostname} className="text-gray-300">
                <td className="px-4 py-2 font-mono whitespace-nowrap">{record.hostname}</td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-500">{record.ip}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemove(record.hostname)}
                    disabled={record.hostname === 'dashboard.home'}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-800 hover:text-rose-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                    title={record.hostname === 'dashboard.home' ? 'dashboard.home cannot be removed' : 'Remove'}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
