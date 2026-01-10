import { app, BrowserWindow, ipcMain, Event } from 'electron'
import path from 'path'
import AdmZip from 'adm-zip'
import ZipServer from './zip-server'
import setupPlatform from './platform-setup'

setupPlatform()

const createWindow = () => {
    const win = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    })

    if (process.env.ELECTRON_EPUB_READER_MODE === 'dev') {
        win.loadURL('http://localhost:5173')
    } else {
        win.loadFile('index.html')
    }
}

const zipServers: ZipServer[] = []

app.whenReady().then(() => {
    ipcMain.handle('loadFile', async (event: Event, data: ArrayBuffer) => {
        console.log('File loaded with size:', data.byteLength)
        const zip = new AdmZip(Buffer.from(data))
        const zipServer = new ZipServer(zip)
        zipServers.push(zipServer)
        const url = await zipServer.start()
        console.log(url)
        return url
    })

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
