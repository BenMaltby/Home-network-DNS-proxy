import type {
  BlocklistInfo,
  LocalRecord,
  QueryLogEntry,
  ServerStatus,
  StatsSummary,
  TimeSeriesBucket,
  TopBlockedEntry,
} from './types';

const BASE_URL = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getStatsSummary: () => request<StatsSummary>('/stats/summary'),
  getTimeSeries: (minutes = 60) => request<TimeSeriesBucket[]>(`/stats/timeseries?minutes=${minutes}`),
  getTopBlocked: (limit = 10) => request<TopBlockedEntry[]>(`/stats/top-blocked?limit=${limit}`),
  getQueries: (limit = 200) => request<QueryLogEntry[]>(`/queries?limit=${limit}`),
  getBlocklist: () => request<BlocklistInfo>('/blocklist'),
  refreshBlocklist: () => request<BlocklistInfo>('/blocklist/refresh', { method: 'POST' }),
  getRecords: () => request<LocalRecord[]>('/records'),
  addRecord: (hostname: string, ip: string) =>
    request<LocalRecord>('/records', { method: 'POST', body: JSON.stringify({ hostname, ip }) }),
  removeRecord: (hostname: string) => request<void>(`/records/${encodeURIComponent(hostname)}`, { method: 'DELETE' }),
  pauseBlocking: (minutes: number) =>
    request<StatsSummary>('/blocking/pause', { method: 'POST', body: JSON.stringify({ minutes }) }),
  resumeBlocking: () => request<StatsSummary>('/blocking/resume', { method: 'POST' }),
  getStatus: () => request<ServerStatus>('/status'),
};
