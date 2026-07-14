import dgram from 'dgram';
import readline from 'node:readline';
import { Readable } from 'node:stream';

class DNSFlags{
    constructor() {
        this.QR;  // Query or Response?
        this.opcode;  // 
        this.AA;
        this.TC;
        this.RD;
        this.RA;
        this.Z;
        this.RCODE;
    }

    toString(){
        return `QR:${this.QR},OPCODE:${this.opcode},AA:${this.AA},TC:${this.TC},RD:${this.RD},RA:${this.RA},Z:${this.Z},RCODE:${this.RCODE}`
    }

    parseFlags(flagBytes) {
        const flagBits = flagBytes.toString(2).padStart(16,'0').split('');
        this.QR = parseInt(flagBits[0])
        this.opcode = parseInt(flagBits.slice(1, 5).join(''), 2)
        this.AA = parseInt(flagBits[5])
        this.TC = parseInt(flagBits[6])
        this.RD = parseInt(flagBits[7])
        this.RA = parseInt(flagBits[8])
        this.Z = parseInt(flagBits.slice(9, 12).join(''), 2)
        this.RCODE = parseInt(flagBits.slice(12, 16).join(''), 2)
    } 
}

class DNSHeader{
    constructor() {
        this.ID;
        this.flags;
        this.QDCOUNT;
        this.ANCOUNT;
        this.NSCOUNT;
        this.ARCOUNT;
    }
}

class DNSPacket{
    constructor() {
    }
}

const BLOCKLIST_URL = `https://raw.githubusercontent.com/hagezi/dns-blocklists/main/adblock/pro.txt`
var DNSBlockList = new Map()
const server = dgram.createSocket('udp4')
const PORT = 53;

// Cloudflare public DNS resolver
const UPSTREAM_DNS = '1.1.1.1';
const UPSTREAM_PORT = 53;
const upstreamSocket = dgram.createSocket('udp4');

// Received a DNS packets to query
server.on('message', (msg, rinfo) => {
    // console.log(`Received ${msg.length} bytes from ${rinfo.address}:${rinfo.port}`);
    
    const transactionID = msg.readUint16BE(0)
    // console.log("Transaction ID:", transactionID)
    
    // Create DNSFlags and parse flags from msg
    // var flags = new DNSFlags()
    // flags.parseFlags(msg.readUint16BE(2));
    
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
        domain.unshift(part)
    } 

    // console.log("Domain:", domain)
    const isAdDomain = queryDomain(domain);  // Is the domain in the block list?
    // console.log(`${domain} is${isAdDomain?'':' not'} an Ad site!`);
    
    if (!isAdDomain) {  // Not an Ad so resolve with Cloudflare
        const tempSocket = dgram.createSocket('udp4')
        tempSocket.send(msg, UPSTREAM_PORT, UPSTREAM_DNS, (err) => {  // ask cloudlfare for the ip
            if (err) console.error("Failed to resolve domain with error:", err);
        })
        tempSocket.on('message', (upstreamResponse) => {  // send it back to the client
            server.send(upstreamResponse, rinfo.port, rinfo.address, (err) => {
                if (err) console.error("Error returning answer to client:", err);
                // else console.log("Query successfully returned to client.")
                tempSocket.close();
            })
        })
        tempSocket.on('error', (err) => {  // handle errors
            console.error("Temporary socket error:", err);
            tempSocket.close();
        });
    } else {  // is an Add so respond with 0.0.0.0
        const responseBuffer = Buffer.from(msg);
        responseBuffer[2] |= 0x80;  // Set QR flag to 1
        responseBuffer[3] = (responseBuffer[3] & 0xF0) | 0x03;  // Change RCODE to 3 (NXDOMAIN)
        responseBuffer.writeUInt16BE(0, 6);  // ANCOUNT = 0
        responseBuffer.writeUInt16BE(0, 8);  // NSCOUNT = 0
        responseBuffer.writeUInt16BE(0, 10); // ARCOUNT = 0

        server.send(responseBuffer, rinfo.port, rinfo.address, (err) => {
            if (err) console.error("Failed to send NXDOMAIN:", err);
            else console.log(`Blocked: ${domain}`);
        });
    } 
})

server.on('listening', () => {
    const address = server.address()
    console.log(`Server listening ${address.address}:${address.port}`)
})

async function loadBlockList() {
    try {
        console.log(`Fetching block list...`)
        const res = await fetch(BLOCKLIST_URL);
        if (!res.ok) {throw new Error(`Failed to fetch block list: ${res.statusText}`)}
        
        const rl = readline.createInterface({
            input: Readable.from(res.body),
            crlfDelay: Infinity
        })
        
        console.log(`Loading block list into memory...`)
        for await (const line of rl) {
            insertDomain(line);
        }
        
        console.log(`Block List is ready for use!`)
        
    } catch (e) {
        console.error(e);
    }

    return true;
}

function insertDomain(domain) {
    const cleanDomain = domain.trim().toLowerCase();
    if (!cleanDomain || cleanDomain.startsWith('[') || cleanDomain.startsWith('#') || cleanDomain.startsWith('!'))
        return;
    
    const parts = cleanDomain.slice(2,domain.length-1).split('.')
    let root = DNSBlockList;
    
    for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i]
        
        if (root.get(part) === true) {
            return;
        }
        
        if (i === 0) {
            root.set(part, true);
        } else {
            let nextMap = root.get(part);
            if (!nextMap) {
                nextMap = new Map();
                root.set(part, nextMap);
            }
            root = nextMap;            
        }
    }
}

function queryDomain(domain) {  // Is this domain a known ad-domain

    let root = DNSBlockList;

    for (let part of domain) {
        let query = root.get(part);

        if (!query) return false;

        if (query === true) {
            return true;
        }else {
            root = query;
        }
    }
    return false;
}

const isLoaded = await loadBlockList()
if (isLoaded) {
    server.bind(PORT, '0.0.0.0')
}

// ht-cdn2.adtng.com