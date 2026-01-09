import http from 'http'
import AdmZip from 'adm-zip'
import mime from 'mime'

export default class ZipServer {
    private server: http.Server
    private zip: AdmZip
    private entries: AdmZip.IZipEntry[]

    constructor(zip: AdmZip) {
        this.zip = zip
        this.entries = zip.getEntries()
        this.server = http.createServer(this.requestListener.bind(this))
    }

    private requestListener(req: http.IncomingMessage, res: http.ServerResponse) {
        res.setHeader('Access-Control-Allow-Origin', '*')
        if (!req.url) {
            res.statusCode = 400
            res.end('Bad Request')
            return
        }
        const entryPath = decodeURIComponent(req.url.slice(1))
        const entry = this.entries.find(e => e.entryName === entryPath)
        if (entry) {
            res.statusCode = 200
            res.setHeader('Content-Type', mime.getType(entryPath) ?? 'text/plain')
            res.end(entry.getData())
        }else {
            res.statusCode = 404
            res.end('Not Found')
        }
    }

    async start(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.server.listen(0, 'localhost', () => {
                const address = this.server.address()
                if (address && typeof address === 'object') {
                    const port = address.port
                    resolve(`http://localhost:${port}`)
                } else {
                    reject(new Error('Failed to start server'))
                }
            })
        })
    }
}
