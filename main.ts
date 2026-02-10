import { app, BrowserWindow, ipcMain, Event, protocol } from 'electron'
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

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'epub',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true
    }
  }
])

app.whenReady().then(() => {
    protocol.handle('epub', request => {
        console.log(request.url)
    for (const server of zipServers) {
        if (request.url.startsWith(`epub://${server.id}/`)) {
            const filePath = request.url.replace(`epub://${server.id}/`, '')
            return server.handleFileRequest(filePath)
        }
    }
    return new Response('Not found', { status: 404 })
})

    ipcMain.handle('loadFile', async (event: Event, data: ArrayBuffer) => {
        const id = crypto.randomUUID()
        const zip = new AdmZip(Buffer.from(data))
        const zipServer = new ZipServer(id, zip)
        zipServers.push(zipServer)
        return id
    })

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
