const config = require('../config');
const fetch = require('node-fetch');
const { Cookie, CookieList } = require('./cookies');
const { Writer, Reader } = require('../coder/index');



class APIClient {
    constructor(headerConsts = config.headers, options) {
        this._constHeaders = headerConsts === 'default' ? config.headers : headerConsts;
        this.options = { lang: options.lang || "en", party: options.party }
        this._cookies = new CookieList();
        this._sessionData = new Uint8Array(0);
        this._sharePerm = false;

    }

    static checkErr(buf, successCode = 30) {
        buf = new Uint8Array(buf);

        if (buf[0] !== successCode) {

            throw new Error(new TextDecoder().decode(buf) + ' :: ' + Error().stack)
        } else return false
    }

    recieveInitCookies(set = true) {
        let cookies = null;
        return fetch("http://wormax.io/" + (this.options.party ? "?party=" + this.options.party : "")).then(res => {
            cookies = new CookieList(...res.headers.raw()['set-cookie']);

            return cookies
        }).then(cookies => {
            return fetch("http://wormax.io/service/serve", {
                "headers": {
                    ...this._constHeaders,
                    "content-type": "application/octet-stream; charset=utf-8",
                    "cookie": cookies.toString(),
                },
                "referrer": "http://wormax.io/" + this.options.party,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": new Writer().u8(0x30, 0x01, 0x28, 0x00, 1, 0, 0, 0).utf8(this._constHeaders.clientbuild).u8(1, 0).utf8(this.options.lang).u8(0, 0, 3, 32, 0, 0, 5, 0, 0, 0, 3, 32, 0, 0, 5, 0, 0).utf8('enter').u8(0).utf8('PortalService').write(),
                "method": "POST",
                "mode": "cors"
            })
        }).then(async res => {
            await res.arrayBuffer().then(buf => (this._sessionData = new Uint8Array(buf)))

            let addedCookies = Array.from(res.headers.raw()['set-cookie']).map(str => new Cookie(str))

            cookies.add(...addedCookies);

            if (set) this.cookies = cookies;

            return cookies
        }).catch(err => {
            throw new Error('Trouble initiating api cookie handshake :: Fatal ' + err.stack)
        })
    }

    triggerSharePerms() {
        if (this.cookies instanceof CookieList) {
            return fetch("http://wormax.io/service/serve", {
                "headers": {
                    ...this._constHeaders,
                    "content-type": "application/octet-stream; charset=utf-8",
                    cookie: this.cookies.toString()
                },
                "referrer": "http://wormax.io/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": new Writer().u8(0x30, 0, 0).utf8('share').u8(0).utf8('PortalService').write(),
                "method": "POST",
                "mode": "cors"
            }).then(res => res.arrayBuffer()).then(buf => {
                APIClient.checkErr(buf, 0x00)

                this._sharePerm = true;
                // return new Promise(r => setTimeout(r, 2000));
            }).catch(err => {
                throw new Error('in request `triggerSharePerms` : ' + err.message)
            })
        } else throw new Error('Invalid cookies property on client')
    }

    getServerRegions() {
        if (this.cookies instanceof CookieList) {
            return fetch("http://wormax.io/service/serve", {
                "headers": {
                    ...this._constHeaders,
                    "content-type": "application/octet-stream; charset=utf-8",
                    cookie: this.cookies.toString()
                },
                "referrer": "http://wormax.io/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": new Writer().u8(0x30, 0, 0).utf8('getRegions').u8(0).utf8('PortalService').write(),
                "method": "POST",
                "mode": "cors"
            }).then(res => res.arrayBuffer()).then(buf => {
                APIClient.checkErr(buf, 0x16)
                const reader = new Reader(buf);
                reader.u8()
                const regions = reader.array(function () {
                    const region = {
                        _unknowns: [this.u8(), this.u8()],
                        id: this.utf8()
                    }
                    region._unknowns.push(this.u8(), this.u8());
                    region.ip = this.utf8();
                    return region
                })

                return regions;
            }).catch(err => {
                throw new Error('in request `getServerRegions` : ' + err.message)
            })
        } else throw new Error('Invalid cookies property on client')
    }

    getServersByRegion(region = 'US') {
        if (this.cookies instanceof CookieList) {
            return fetch("http://wormax.io/service/serve", {
                "headers": {
                    ...this._constHeaders,
                    "content-type": "application/octet-stream; charset=utf-8",
                    cookie: this.cookies.toString()
                },
                "referrer": "http://wormax.io/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": new Writer().u8(0x30, 2, 13, 0).utf8(region).u8(5, 0, 0).utf8('getServers').u8(0).utf8('PortalService').write(),
                "method": "POST",
                "mode": "cors"
            }).then(res => res.arrayBuffer()).then(buf => {
                APIClient.checkErr(buf, 0x16)
                const reader = new Reader(buf);
                reader.u8();
                const servers = reader.array(function () {
                    const server = {
                        _unknowns: [this.u8(), this.u8()],
                        key: this.utf8()
                    }
                    server._unknowns.push(this.u8(), this.u8())
                    server.ip = this.utf8()

                    return server
                })

                return servers;
            }).catch(err => {
                throw new Error('in request `getServerByRegion` : ' + err.message)
            })
        } else throw new Error('Invalid cookies property on client')
    }
    async selectSkin(id) {
        if (!this._sharePerm) {
            await this.triggerSharePerms()
            console.log('selecting')
            return this.selectSkin(id)
        }
        if (this.cookies instanceof CookieList) {
            fetch("http://wormax.io/service/serve", {
                "headers": {
                    ...this._constHeaders,
                    "content-type": "application/octet-stream; charset=utf-8",
                    cookie: this.cookies.toString()
                },
                "referrer": "http://wormax.io/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": new Writer().u8(0x30, 1, 6, id, 0).utf8('changeSkin').u8(0).utf8('PortalService').write(),
                "method": "POST",
                "mode": "cors"
            }).then(res => res.arrayBuffer()).then(buf => {
                APIClient.checkErr(buf, 0x00)
                this._skin = id
            }).catch(err => {
                throw new Error('in request `selectSkin` : ' + err.message)
            })
        } else throw new Error('Invalid cookies property on client')
    }
    getSpawnData(serverKey, name = 'Bot') {
        if (this.cookies instanceof CookieList) {
            return fetch("http://wormax.io/service/serve", {
                "headers": {
                    ...this._constHeaders,
                    "content-type": "application/octet-stream; charset=utf-8",
                    cookie: this.cookies.toString()
                },
                "referrer": "http://wormax.io/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": new Writer().u8(0x30, 8, 13, 0).utf8(serverKey).u8(5, 0, 13, 0).utf8(name).u8(6, this._skin || 0, 0, 0, 0).i32(10).i32(0).u16(0).utf8('startPlay').u8(0).utf8('PortalService').write(),
                "method": "POST",
                "mode": "cors",
            }).then(res => res.arrayBuffer()).then(buf => {
                APIClient.checkErr(buf, 41)

                const reader = new Reader(buf);
                reader.u8();

                const parsed = {
                    _unknowns: [reader.u8()],
                }

                const uuidBuf = new Uint8Array(reader.array(function () { return this.u8() }))
                parsed.uuid = new TextDecoder().decode(uuidBuf)

                parsed._unknowns.push(reader.u8());
                parsed.header = reader.utf8()

                parsed._unknowns.push(reader.u8());

                parsed.core = reader.utf8(reader.i32().endianSwap())
                parsed._unknowns.push(reader.u8());
                parsed.ip = reader.utf8()

                if (this._sessionData.byteLength === 0) {
                    console.warn('Session data not defined yet. Continuing')
                } else {
                    const identifier = parsed.uuid.split('-')[4]
                    const address = new TextDecoder().decode(this._sessionData).indexOf(identifier)
                    if (address === -1) {
                        console.warn('Unable to find spawn ID; closing out');
                    } else {
                        const r = new Reader(this._sessionData);
                        r.at = address + identifier.length;
                        const firstByte = parsed.uuid.charCodeAt(0);
                        while (true) {
                            if (r.u8() === firstByte) {
                                r.at -= 2;
                                break;
                            }
                        }
                        r.utf8();
                        r.at += 2
                        parsed.spawnId = r.utf8()
                    }
                }

                return parsed;
            }).catch(err => {
                throw new Error('in request `getSpawnData` : ' + err.message)
            })
        } else throw new Error('Invalid cookies property on client')
    }
}
module.exports = APIClient