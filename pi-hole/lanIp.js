import os from 'node:os';

export function detectLanIp() {
    if (process.env.LAN_IP) return process.env.LAN_IP;

    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }

    return '127.0.0.1';
}
