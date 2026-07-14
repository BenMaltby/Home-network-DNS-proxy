import readline from 'node:readline';
import { Readable } from 'node:stream';

const BLOCKLIST_URL = `https://raw.githubusercontent.com/hagezi/dns-blocklists/main/adblock/pro.txt`

export default class BlockList {
    constructor() {
        this.DNSBlockList = new Map()
        this.size = 0;
    }

    async loadBlockList() {
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
                this.insertDomain(line);
            }
            
            console.log(`Block List is ready for use!`)
            
        } catch (e) {
            console.error(e);
        }
    
        return true;
    }
    
    insertDomain(domain) {
        const cleanDomain = domain.trim().toLowerCase();
        if (!cleanDomain || cleanDomain.startsWith('[') || cleanDomain.startsWith('#') || cleanDomain.startsWith('!')){
            if (cleanDomain.includes("number of entries")) {
                this.size = parseInt(cleanDomain.match(/\d+(\. \d+)?/g)[0]);
                console.log(`Number of entries for this blocklist: ${this.size}`);
            }
            return;
        }
        
        const parts = cleanDomain.slice(2,domain.length-1).split('.')
        let root = this.DNSBlockList;
        
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
    
    queryDomain(domain) {  // Is this domain a known ad-domain
    
        let root = this.DNSBlockList;
    
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
}