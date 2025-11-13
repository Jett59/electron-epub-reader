const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('epubReader', {
    loadFile: (data: ArrayBuffer) => ipcRenderer.invoke('loadFile', data)
})
