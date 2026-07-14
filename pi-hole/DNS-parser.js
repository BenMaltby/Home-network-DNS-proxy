// I was gonna parse the full packet but I don't need to
export default class DNSFlags{
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
