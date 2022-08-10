const config = require('../capacitor.config.json')
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const os = require('os')

const serve = require('electron-serve')
const scheme = config.scheme
const origin =  `${scheme}://-`

class Pixie {
    constructor() {
        this.createWindow()
        this.registerIPCHandlers()
    }

    createWindow() {
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            frame: false,
            show: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })

        this.window.once('ready-to-show', () => this.window.show())
    }

    registerIPCHandlers() {
        ipcMain.on('get-os-data', this.getOSData)
        ipcMain.handle('maximize', () => this.window.isMaximized() ? this.window.unmaximize() : this.window.maximize())
        ipcMain.handle('minimize', () => this.window.minimize())
    }

    getOSData(event) {
        const platform = os.platform()

        event.returnValue = {
            platform,
            isMac: platform === 'darwin',
            isWindows: platform === 'win32',
            isLinux: platform === 'linux'
        }
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
    app.enableSandbox()

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
