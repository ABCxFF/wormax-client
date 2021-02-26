const IncomingPackets = {
    2: () => ({ name: 'accept', content: null }),
    69: (reader) => {

        const out = { name: 'leaderboard', content: { _unknowns: [] } };

        reader.endianSwap()

        if (reader.u8() !== 0x00) return console.warn('Invalid LB Packet Constant', reader.buffer);

        out.content.tick = reader.i32();
        out.content.playerCount = reader.i32();


        out.content.leaderboard = reader.array(function () {
            return {
                _unknowns: [this.u8()],
                name: this.utf8(),
                score: this.f32(true)
            }
        })

        return out;
    }
}
module.exports = { IncomingPackets }