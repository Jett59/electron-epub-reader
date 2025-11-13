import { app, BrowserWindow } from 'electron'

const createWindow = () => {
    const win = new BrowserWindow({})

    if (process.env.ELECTRON_EPUB_READER_MODE === 'dev') {
        win.loadURL('http://localhost:5173')
    } else {
        win.loadFile('index.html')
    }
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
