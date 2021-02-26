class Cookie {
    constructor(str) {
        this.key = str.slice(0, str.indexOf('='))
        this.val = str.slice(str.indexOf('=') + 1, str.indexOf(';'))
    }
    set(val) {
        return this.val = val;
    }
    setKey(key) {
        return this.key = key
    }
    get() {
        return this.val
    }
    toString() {
        return `${this.key}=${this.val}`
    }
}

class CookieList {
    constructor(...cookies) {
        if (cookies.length === 1) cookies = cookies.split(';').map(str => new Cookie(str.trim()))

        this.cookies = {}
        for (let cookie of cookies) {
            if (typeof cookie === "string") cookie = new Cookie(cookie)
            this.cookies[cookie.key] = cookie
        }
    }
    add(...cookies) {
        for (let cookie of cookies) {
            this.cookies[cookie.key] = cookie
        }
        return Object.values(this.cookies).length
    }
    get(key) {
        return this.cookies.hasOwnProperty(key) ? this.cookies[key].get() : ""
    }
    set(key, val) {
        return this.cookies.hasOwnProperty(key) ? (this.cookies[key].set(val)) : ""
    }
    remove(...keys) {
        for (let key of keys) {
            this.cookies[key] = null
        }
        return Object.values(this.cookies).length
    }

    toString() {
        let out = []
        for (let cookieKey in this.cookies) {
            let cookie = this.cookies[cookieKey]
            if (cookie instanceof Cookie) out.push(cookie.toString())
        }
        return out.join(';')
    }

}
module.exports = { Cookie, CookieList }