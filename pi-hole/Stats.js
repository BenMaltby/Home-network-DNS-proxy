const BUCKET_MS = 5 * 60_000;
const HISTORY_MS = 24 * 60 * 60_000;

export default class Stats {
    constructor(maxLogSize = 500) {
        this.maxLogSize = maxLogSize;
        this.log = [];
        this.totalQueries = 0;
        this.blockedQueries = 0;
        this.blockedDomainCounts = new Map();
        this.buckets = new Map();
        this.startedAt = Date.now();
        this.pausedUntil = null;
    }

    record({ domain, client, blocked, local = false }) {
        const timestamp = Date.now();

        this.log.push({ domain, client, blocked, local, timestamp });
        if (this.log.length > this.maxLogSize) this.log.shift();

        this.totalQueries += 1;
        if (blocked) {
            this.blockedQueries += 1;
            this.blockedDomainCounts.set(domain, (this.blockedDomainCounts.get(domain) ?? 0) + 1);
        }

        const bucketStart = timestamp - (timestamp % BUCKET_MS);
        const bucket = this.buckets.get(bucketStart) ?? { timestamp: bucketStart, total: 0, blocked: 0 };
        bucket.total += 1;
        if (blocked) bucket.blocked += 1;
        this.buckets.set(bucketStart, bucket);

        const cutoff = timestamp - HISTORY_MS;
        for (const bucketStartKey of this.buckets.keys()) {
            if (bucketStartKey < cutoff) this.buckets.delete(bucketStartKey);
        }
    }

    isPaused() {
        if (this.pausedUntil === null) return false;
        if (Date.now() >= this.pausedUntil) {
            this.pausedUntil = null;
            return false;
        }
        return true;
    }

    pause(minutes) {
        this.pausedUntil = Date.now() + minutes * 60_000;
    }

    resume() {
        this.pausedUntil = null;
    }

    summary(blocklistSize) {
        const paused = this.isPaused();
        return {
            totalQueries: this.totalQueries,
            blockedQueries: this.blockedQueries,
            blockPercent: this.totalQueries === 0 ? 0 : (this.blockedQueries / this.totalQueries) * 100,
            blocklistSize,
            uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
            paused,
            pausedUntil: paused ? this.pausedUntil : null,
        };
    }

    recentQueries(limit = 100) {
        return this.log.slice(-limit).reverse();
    }

    timeSeries(windowMinutes = 60) {
        const cutoff = Date.now() - windowMinutes * 60_000;
        return [...this.buckets.values()]
            .filter((bucket) => bucket.timestamp >= cutoff)
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    topBlocked(limit = 10) {
        return [...this.blockedDomainCounts]
            .map(([domain, count]) => ({ domain, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
}
