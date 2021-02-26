const { Reader, Writer } = require('../coder/index')

module.exports = class WriterSending extends Writer {
    constructor(socket) {
        super()

        this._socket = socket;
    }
    done() {
        const buf = this.write();
        // console.log('Sending ' + new TextDecoder().decode(new Uint8Array(buf)))
        return this._socket.send(buf)
    }
}