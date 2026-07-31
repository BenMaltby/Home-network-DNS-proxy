export interface StatsSummary {
  totalQueries: number;
  blockedQueries: number;
  blockPercent: number;
  blocklistSize: number;
  uptimeSeconds: number;
  paused: boolean;
  pausedUntil: number | null;
}

export interface TimeSeriesBucket {
  timestamp: number;
  total: number;
  blocked: number;
}

export interface TopBlockedEntry {
  domain: string;
  count: number;
}

export interface QueryLogEntry {
  domain: string;
  client: string;
  blocked: boolean;
  local: boolean;
  timestamp: number;
}

export interface BlocklistInfo {
  sourceUrl: string;
  size: number;
  loadedAt: number | null;
}

export interface LocalRecord {
  hostname: string;
  ip: string;
}

export interface ServerStatus {
  lanIp: string;
  upstreamDns: string;
  dnsPort: number;
  httpPort: number;
}
