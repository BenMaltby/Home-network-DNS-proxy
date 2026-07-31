import { useCallback } from 'react';
import { Activity, ShieldBan, ShieldCheck, Clock } from 'lucide-react';
import { api } from '../api/client';
import { usePolling } from '../hooks/usePolling';
import StatCard from '../components/stats/StatCard';
import QueriesChart from '../components/stats/QueriesChart';
import TopBlockedList from '../components/stats/TopBlockedList';
import PauseResumeControl from '../components/PauseResumeControl';

function formatUptime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function Overview() {
  const summaryFetcher = useCallback(() => api.getStatsSummary(), []);
  const timeSeriesFetcher = useCallback(() => api.getTimeSeries(60), []);
  const topBlockedFetcher = useCallback(() => api.getTopBlocked(10), []);

  const summary = usePolling(summaryFetcher, 5000);
  const timeSeries = usePolling(timeSeriesFetcher, 30000);
  const topBlocked = usePolling(topBlockedFetcher, 30000);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Overview</h1>

      {summary.data && (
        <PauseResumeControl
          paused={summary.data.paused}
          pausedUntil={summary.data.pausedUntil}
          onChange={summary.refresh}
        />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total queries" value={summary.data ? String(summary.data.totalQueries) : '—'} icon={Activity} />
        <StatCard
          label="Blocked"
          value={summary.data ? String(summary.data.blockedQueries) : '—'}
          icon={ShieldBan}
          accent="blocked"
        />
        <StatCard
          label="Block %"
          value={summary.data ? `${summary.data.blockPercent.toFixed(1)}%` : '—'}
          icon={ShieldCheck}
          accent="good"
        />
        <StatCard
          label="Uptime"
          value={summary.data ? formatUptime(summary.data.uptimeSeconds) : '—'}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QueriesChart data={timeSeries.data ?? []} />
        </div>
        <TopBlockedList data={topBlocked.data ?? []} />
      </div>
    </div>
  );
}
