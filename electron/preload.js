const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
    'electron',
    {
        ...ipcRenderer.sendSync('get-os-data'),
        maximize: () => ipcRenderer.invoke('maximize'),
        minimize: () => ipcRenderer.invoke('minimize')
    }
)