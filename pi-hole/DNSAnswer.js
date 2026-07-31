function buildHeader(request, ancount) {
    const header = Buffer.from(request.subarray(0, 12));
    header[2] = (request[2] & 0x79) | 0x84; // QR=1, AA=1, preserve OPCODE+RD, clear TC
    header[3] = 0x80;                       // RA=1, Z=0, RCODE=0 (NOERROR)
    header.writeUInt16BE(ancount, 6);       // ANCOUNT
    header.writeUInt16BE(0, 8);             // NSCOUNT
    header.writeUInt16BE(0, 10);            // ARCOUNT
    return header;
}

export function buildARecordResponse(request, questionEnd, ip, ttl = 300) {
    const header = buildHeader(request, 1);
    const question = request.subarray(12, questionEnd);

    const answer = Buffer.alloc(16);
    answer.writeUInt16BE(0xC00C, 0); // NAME: pointer to offset 12 (the original QNAME)
    answer.writeUInt16BE(1, 2);      // TYPE = A
    answer.writeUInt16BE(1, 4);      // CLASS = IN
    answer.writeUInt32BE(ttl, 6);    // TTL
    answer.writeUInt16BE(4, 10);     // RDLENGTH
    ip.split('.').forEach((octet, i) => answer.writeUInt8(Number(octet), 12 + i));

    return Buffer.concat([header, question, answer]);
}

export function buildEmptyResponse(request, questionEnd) {
    const header = buildHeader(request, 0);
    const question = request.subarray(12, questionEnd);
    return Buffer.concat([header, question]);
}

export function buildNXDomainResponse(request, questionEnd) {
    const header = buildHeader(request, 0);
    header[3] = (header[3] & 0xF0) | 0x03; // RCODE = 3 (NXDOMAIN)
    const question = request.subarray(12, questionEnd);
    return Buffer.concat([header, question]);
}
