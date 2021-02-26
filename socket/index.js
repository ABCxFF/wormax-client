const WebSocket = require('ws')
const EventEmitter = require('events');
const { Reader, Writer } = require('../coder/index')
const WriterSending = require('./sender');

const { IncomingPackets, OutgoingPackets } = require('./protocol')

let quickU16Swap = (int) => ((int & 0xFF) << 8) | ((int >> 8) & 0xFF)

class SocketClient extends EventEmitter {
    constructor(initData, cookies, socketOptions = {}) {
        super()
        this._cookies = cookies;
        this._initData = initData


        this._socket = new WebSocket(initData.ip, {
            headers: {
                'cookie': this._cookies.toString()
            },
            ...socketOptions
        });
        this._socket.binaryType = 'arraybuffer'
        this._react()
    }
    _react() {
        this._socket.on('open', () => {
            const { core } = this._initData;

            this.emit('socket-open');

            this.send().u8(0xA0, 0xE1, 0xBE, 0x84, 0x38).u16(quickU16Swap(core.length)).utf8(core, 1).done();
        });

        this._socket.on('message', (buf) => {
            const reader = new Reader(buf);
            const header = reader.u8();
            if (IncomingPackets[header]) {
                const packet = IncomingPackets[header](reader);
                if (!packet) return;

                this.emit(packet.name, packet.content)

            }
        })

        this._socket.on('error', (err) => {
            this.emit('socket-error', err);
        })

        this._socket.on('close', (code) => {
            this.emit('close', code);
        })
    }
    close() {
        this._socket.close()
    }
    enter() {
        return this.send().u8(0x30, 0x01, 0x0D, 0x00).utf8(this._initData.spawnId).u8(0x00).utf8('enter').u8(0x00).utf8('GameService').done()
    }
    send() {
        return new WriterSending(this._socket)
    }
}

module.exports = SocketClient
