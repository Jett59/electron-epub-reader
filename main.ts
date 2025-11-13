const { app, BrowserWindow, ipcMain, event } = require('electron')
const path = require('path')

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

app.whenReady().then(() => {
    ipcMain.handle('loadFile', (event: Event, data: ArrayBuffer) => {
        console.log('File loaded with size:', data.byteLength)
    })

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
