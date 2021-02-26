const { Reader, Writer } = require('../coder/index')

module.exports = class WriterSending extends Writer {
    constructor(socket) {
        super()

        this._socket = socket;
    }
    done() {
        const buf = this.write();

        return this._socket.send(buf)
    }
}
