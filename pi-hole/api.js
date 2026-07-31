import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DASHBOARD_DIST = path.join(__dirname, '..', 'web-interface', 'dist');

export default function createApi({ stats, blockList, localRecords, getLanIp, reloadBlockList }) {
    const app = express();
    app.use(express.json());

    const api = express.Router();

    api.get('/stats/summary', (req, res) => {
        res.json(stats.summary(blockList.size));
    });

    api.get('/stats/timeseries', (req, res) => {
        const minutes = Number(req.query.minutes) || 60;
        res.json(stats.timeSeries(minutes));
    });

    api.get('/stats/top-blocked', (req, res) => {
        const limit = Number(req.query.limit) || 10;
        res.json(stats.topBlocked(limit));
    });

    api.get('/queries', (req, res) => {
        const limit = Number(req.query.limit) || 100;
        res.json(stats.recentQueries(limit));
    });

    api.get('/blocklist', (req, res) => {
        res.json({
            sourceUrl: blockList.sourceUrl,
            size: blockList.size,
            loadedAt: blockList.loadedAt,
        });
    });

    api.post('/blocklist/refresh', async (req, res) => {
        await reloadBlockList();
        res.json({
            sourceUrl: blockList.sourceUrl,
            size: blockList.size,
            loadedAt: blockList.loadedAt,
        });
    });

    api.get('/records', (req, res) => {
        res.json(localRecords.list());
    });

    api.post('/records', (req, res) => {
        const { hostname, ip } = req.body ?? {};
        if (!hostname || !ip) {
            return res.status(400).json({ error: 'hostname and ip are required' });
        }
        try {
            res.status(201).json(localRecords.add(hostname, ip));
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    });

    api.delete('/records/:hostname', (req, res) => {
        try {
            const removed = localRecords.remove(req.params.hostname);
            if (!removed) return res.status(404).json({ error: 'not found' });
            res.status(204).end();
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    });

    api.post('/blocking/pause', (req, res) => {
        const minutes = Number(req.body?.minutes) || 5;
        stats.pause(minutes);
        res.json(stats.summary(blockList.size));
    });

    api.post('/blocking/resume', (req, res) => {
        stats.resume();
        res.json(stats.summary(blockList.size));
    });

    api.get('/status', (req, res) => {
        res.json({
            lanIp: getLanIp(),
            upstreamDns: '1.1.1.1',
            dnsPort: 53,
            httpPort: Number(process.env.HTTP_PORT) || 80,
        });
    });

    app.use('/api', api);
    app.use(express.static(DASHBOARD_DIST));
    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(DASHBOARD_DIST, 'index.html'));
    });

    return app;
}
