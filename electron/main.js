const config = require('../capacitor.config.json')
const { app, BrowserWindow } = require('electron')

const serve = require('electron-serve')
const scheme = config.scheme
const origin =  `${scheme}://-`


class Pixie {
    constructor() {
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            frame: false
        })
    }

    resolve(path) {
        return this.join(origin, path)
    }

    join(...args) {
        return args.map(
            arg => {
                if (arg instanceof Array) return this.join(...arg)
                else return arg
            }
        ).join('/')
    }

    open(path = '') {
        this.window.loadURL(this.resolve(path))
    }
}

async function init() {
    serve({
        directory: `../${config.webDir}`,
        scheme,
        isCorsEnabled: false
    })

    await app.whenReady()
    
    const pixie = new Pixie()

    pixie.open('/')
}

init()
