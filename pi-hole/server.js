import dgram from 'dgram';
import BlockList from './DNSBlockList.js';
import LocalRecords from './LocalRecords.js';
import Stats from './Stats.js';
import createApi from './api.js';
import { detectLanIp } from './lanIp.js';
import { buildARecordResponse, buildEmptyResponse, buildNXDomainResponse } from './DNSAnswer.js';

const LOCAL_TLD = 'home';

const list = new BlockList();
const server = dgram.createSocket('udp4')
const PORT = Number(process.env.DNS_PORT) || 53;

const lanIp = detectLanIp();
const localRecords = new LocalRecords(lanIp);
const stats = new Stats();

// Cloudflare public DNS resolver
const UPSTREAM_DNS = '1.1.1.1';
const UPSTREAM_PORT = 53;

// Received a DNS packets to query
server.on('message', (msg, rinfo) => {
    // const transactionID = msg.readUint16BE(0)

    // Parse Domain
    var offset = 12;
    var domain = []
    while (msg.readUInt8(offset) !== 0) {
        var part = ""
        const run = msg.readUint8(offset)
        for (let i = offset + 1; i < offset + 1 + run; i++) {
            part += String.fromCharCode(msg.readUint8(i))
        }
        offset += run + 1
        domain.unshift(part.toLowerCase())
    }

    const questionEnd = offset + 5; // null terminator + QTYPE(2) + QCLASS(2)
    const qtype = msg.readUInt16BE(offset + 1);
    const hostname = domain.slice().reverse().join('.');

    if (domain[0] === LOCAL_TLD) {  // Local .home hostname - never touches the blocklist/upstream
        const ip = localRecords.lookup(hostname);
        const response = ip && qtype === 1 ? buildARecordResponse(msg, questionEnd, ip)
                        : ip ? buildEmptyResponse(msg, questionEnd)
                        : buildNXDomainResponse(msg, questionEnd);

        server.send(response, rinfo.port, rinfo.address, (err) => {
            if (err) console.error("Failed to send local DNS response:", err);
        });
        stats.record({ domain: hostname, client: rinfo.address, blocked: false, local: true });
        return;
    }

    const isAdDomain = !stats.isPaused() && list.queryDomain(domain);  // Is the domain in the block list?
    stats.record({ domain: hostname, client: rinfo.address, blocked: isAdDomain });

    if (!isAdDomain) {  // Not an Ad so resolve with Cloudflare
        const upstreamSocket = dgram.createSocket('udp4')
        upstreamSocket.send(msg, UPSTREAM_PORT, UPSTREAM_DNS, (err) => {  // ask cloudlfare for the ip
            if (err) console.error("Failed to resolve domain with error:", err);
        })
        upstreamSocket.on('message', (upstreamResponse) => {  // send it back to the client
            server.send(upstreamResponse, rinfo.port, rinfo.address, (err) => {
                if (err) console.error("Error returning answer to client:", err);
                upstreamSocket.close();
            })
        })
        upstreamSocket.on('error', (err) => {  // handle errors
            console.error("Upstream socket error:", err);
            upstreamSocket.close();
        });
    } else {  // is an Ad so respond with 0.0.0.0
        const responseBuffer = Buffer.from(msg);
        responseBuffer[2] |= 0x80;  // Set QR flag to 1
        responseBuffer[3] = (responseBuffer[3] & 0xF0) | 0x03;  // Change RCODE to 3 (NXDOMAIN)
        responseBuffer.writeUInt16BE(0, 6);  // ANCOUNT = 0
        responseBuffer.writeUInt16BE(0, 8);  // NSCOUNT = 0
        responseBuffer.writeUInt16BE(0, 10); // ARCOUNT = 0

        server.send(responseBuffer, rinfo.port, rinfo.address, (err) => {
            if (err) console.error("Failed to send NXDOMAIN:", err);
            else console.log(`Blocked: ${hostname}`);
        });
    } 
})

server.on('listening', () => {
    const address = server.address()
    console.log(`Server listening ${address.address}:${address.port}`)
})

const HTTP_PORT = Number(process.env.HTTP_PORT) || 80;
const app = createApi({
    stats,
    blockList: list,
    localRecords,
    getLanIp: () => lanIp,
    reloadBlockList: () => list.reload(),
});
app.listen(HTTP_PORT, '0.0.0.0', () => console.log(`Dashboard listening on ${HTTP_PORT}`));

const isLoaded = await list.loadBlockList()
if (isLoaded) {
    server.bind(PORT, '0.0.0.0')
}

// Ad site for testing
// ht-cdn2.adtng.com