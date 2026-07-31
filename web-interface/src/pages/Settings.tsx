import { useCallback } from 'react';
import { api } from '../api/client';
import { usePolling } from '../hooks/usePolling';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-800 py-2 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-mono text-sm text-gray-200">{value}</span>
    </div>
  );
}

export default function Settings() {
  const fetcher = useCallback(() => api.getStatus(), []);
  const { data } = usePolling(fetcher, 15000);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="max-w-md rounded-lg border border-gray-800 bg-gray-900 p-5">
        <Row label="Server LAN IP" value={data?.lanIp ?? '—'} />
        <Row label="DNS port" value={data ? String(data.dnsPort) : '—'} />
        <Row label="Dashboard/API port" value={data ? String(data.httpPort) : '—'} />
        <Row label="Upstream resolver" value={data?.upstreamDns ?? '—'} />
      </div>
    </div>
  );
}
