let convo = new ArrayBuffer(4);
let u8 = new Uint8Array(convo);
let f32 = new Float32Array(convo);
let i32 = new Int32Array(convo);

class MiniReader {
    constructor(buf) {
        this.at = 0;
        this.buffer = new Uint8Array(buf);
        this.let = false;
    }
    endianSwap(num) {
        if (typeof num === 'undefined') return this.let = !this.let;

        return MiniReader.endianSwap(num)
    }
    static endianSwap(num) {
        return ((num & 0xFF) << 24) | ((num & 0xFF00) << 8) | ((num >> 8) & 0xFF00) | ((num >> 24) & 0xFF)
    }
    u8() {
        return this.buffer[this.at++]
    }
    i32() {
        u8.set(this.buffer.subarray(this.at, this.at += 4));
        return this.let ? MiniReader.endianSwap(i32[0]) : i32[0]
    }
    f32() {
        u8.set(this.buffer.subarray(this.at, this.at += 4));
        if (this.let) i32[0] = MiniReader.endianSwap(i32[0])
        return f32[0]
    }
    vu(vi = false) {
        let out = 0;
        let i = 0;
        while (this.buffer[this.at] & 0x80) {
            out |= (this.buffer[this.at++] & 0x7F) << i;
            i += 7;
        }
        out |= (this.buffer[this.at++] & 0x7F) << i;

        if (vi) return (0 - (out & 1)) ^ (out >>> 1);
        return out
    }
    utf8(len=this.vu()) {
        return new TextDecoder().decode(this.buffer.subarray(this.at, this.at += len));
    }
    array(read, length=this.vu()) {
        let arr = Array(length);
        for (let i = 0; i < length; i++) {
            arr[i] = read.call(this)
        }
        return arr
    }
    hexStr(len = 40) {
        return Array.from(this.buffer.slice(this.at, this.at + len)).map(e => (e | 0x100).toString(16).slice(1)).join(' ')
    }
}
module.exports = MiniReader
