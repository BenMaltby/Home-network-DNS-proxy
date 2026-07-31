import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'local-records.json');
const LOCAL_TLD = 'home';
const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

function isValidIPv4(ip) {
    const match = ip.match(IPV4_PATTERN);
    if (!match) return false;
    return match.slice(1).every((octet) => Number(octet) >= 0 && Number(octet) <= 255);
}

export default class LocalRecords {
    constructor(currentLanIp) {
        this.records = new Map();
        this._load();
        this.records.set('dashboard.home', currentLanIp);
        this._save();
    }

    _load() {
        try {
            const raw = fs.readFileSync(DATA_FILE, 'utf-8');
            const entries = JSON.parse(raw);
            for (const [hostname, ip] of Object.entries(entries)) {
                this.records.set(hostname, ip);
            }
        } catch (e) {
            if (e.code !== 'ENOENT') console.error('Failed to load local records:', e);
        }
    }

    _save() {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(Object.fromEntries(this.records), null, 2));
    }

    lookup(hostname) {
        return this.records.get(hostname.toLowerCase()) ?? null;
    }

    list() {
        return [...this.records].map(([hostname, ip]) => ({ hostname, ip }));
    }

    add(hostname, ip) {
        const cleanHostname = hostname.trim().toLowerCase();
        if (!cleanHostname.endsWith(`.${LOCAL_TLD}`) || cleanHostname === `.${LOCAL_TLD}`) {
            throw new Error(`Hostname must end with .${LOCAL_TLD}`);
        }
        if (!isValidIPv4(ip)) {
            throw new Error('IP must be a valid IPv4 address');
        }

        this.records.set(cleanHostname, ip);
        this._save();
        return { hostname: cleanHostname, ip };
    }

    remove(hostname) {
        const cleanHostname = hostname.trim().toLowerCase();
        if (cleanHostname === 'dashboard.home') {
            throw new Error('dashboard.home cannot be removed');
        }
        const removed = this.records.delete(cleanHostname);
        if (removed) this._save();
        return removed;
    }
}
