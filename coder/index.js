const Reader = require('./reader');
const Writer = require('./writer')

Number.prototype.endianSwap = function endianSwap() {
    return Reader.endianSwap(this);
}

module.exports = {
    Reader,
    Writer
}