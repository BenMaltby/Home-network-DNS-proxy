import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TimeSeriesBucket } from '../../api/types';

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function QueriesChart({ data }: { data: TimeSeriesBucket[] }) {
  const chartData = data.map((bucket) => ({
    time: formatTime(bucket.timestamp),
    Total: bucket.total,
    Blocked: bucket.blocked,
  }));

  return (
    <div className="h-64 rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="mb-2 text-sm font-medium text-gray-300">Queries over time</div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="blockedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb7185" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
          <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', fontSize: 12 }} />
          <Area type="monotone" dataKey="Total" stroke="#34d399" fill="url(#totalFill)" strokeWidth={2} />
          <Area type="monotone" dataKey="Blocked" stroke="#fb7185" fill="url(#blockedFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
