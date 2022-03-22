/* eslint-disable no-magic-numbers */
function generateUUID() {
    generateUUID.tail = generateUUID.tail || (function(nics) {
        let nic, index, addr, retn;
        for (nic in nics) { // try to obtain the MAC address from the IPv6 scope-local address
            for (index in nics[nic]) {
                addr = nics[nic][index];
                if (!addr.internal) {
                    if (addr.address.indexOf('fe80::') === 0) { // found scope-local
                        retn = retn || addr.address.slice(6).split(/:/).map(function(v) {
                            return parseInt(v, 16);
                        });
                    }
                }
            }
        }
        if (!retn) { // no IPv6 so generate random MAC with multicast bit set
            index = Math.pow(2, 16);
            retn = [];
            retn.push(Math.floor(Math.random() * index) | 0x1000); // set multicast bit
            retn.push(Math.floor(Math.random() * index));
            retn.push(Math.floor(Math.random() * index));
            retn.push(Math.floor(Math.random() * index));
        }
        retn[3] = 0x10000 | retn[3];
        retn[2] = 0x10000 | retn[1] & 0xff00 | retn[2] & 0x00ff; // eliminate FFFE from xxxx:xxFF:FExx:xxxx
        retn[1] = 0x10000 | retn[0] ^ 0x0200; // invert bit#41
        retn[0] = 0x18000 | process.pid & 0x3fff;
        retn = retn.map(function(v, i, a) {
            return v.toString(16).slice(1);
        });
        return retn[0] + '-' + retn[1] + retn[2] + retn[3];
    })(require('os').networkInterfaces());

    let head = process.hrtime(), now = Math.floor(Date.now() / 1000);
    head[1] = Math.floor(head[1] * 0.268435456); // 2^28 / 10^9
    head[2] = (0x11000 | head[1] & 0x0fff).toString(16).slice(1);
    head[1] = (0x10000 | head[1] >>> 12 & 0xffff).toString(16).slice(1);
    head[0] = (4294967296 + now).toString(16).slice(1);
    return head.concat(generateUUID.tail).join('-');
}

module.exports = generateUUID;