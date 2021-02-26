let convo = new ArrayBuffer(4);
let u8 = new Uint8Array(convo);
let u16 = new Uint16Array(convo);
let i32 = new Int32Array(convo);
let f32 = new Float32Array(convo);

class MiniWriter {
    constructor() {
        this.at = 0;
        this.blocks = [];
    }
    u8(...vals) {
        this.blocks[this.blocks.length++] = new Uint8Array(vals)
        return this;
    }
    i32(val) {
        i32[0] = val;
        this.blocks[this.blocks.length++] = new Uint8Array(u8);
        return this;
    }
    u16(val) {
        u16[0] = val;
        this.blocks[this.blocks.length++] = new Uint8Array(u8.subarray(0, 2));
        return this;
    }
    f32(val) {
        f32[0] = val;
        this.blocks[this.blocks.length++] = new Uint8Array(u8);
        return this;
    }
    vu(val, vi = false) {
        if (vi) val = (0 - (val & 1)) ^ (val >>> 1)
        let buf = new Uint8Array(4)
        let at = 0;
        do {
            let part = val
            val >>>= 7
            if (val) part |= 0x80
            buf[at++] = part
        } while (val)
        this.blocks[this.blocks.length++] = buf.slice(0, at)
        return this
    }
    utf8(str, disregardLength) {
        if (!disregardLength) this.vu(str.length)
        let bytes = new TextEncoder().encode(str)
        this.blocks[this.blocks.length++] = bytes;
        return this;
    }
    write() {
        let len = 0;
        for (let block of this.blocks) {
            len += block.byteLength
        }
        let at = 0;
        let outBuf = new Uint8Array(len);
        for (let block of this.blocks) {
            outBuf.set(block, at);
            at += block.byteLength;
        }
        return outBuf
    }
}
module.exports = MiniWriter;