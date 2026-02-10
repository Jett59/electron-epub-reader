import AdmZip from 'adm-zip'
import mime from 'mime'

export default class ZipServer {
    id: string
    private zip: AdmZip
    private entries: AdmZip.IZipEntry[]

    constructor(id: string, zip: AdmZip) {
        this.id = id
        this.zip = zip
        this.entries = zip.getEntries()
    }

    handleFileRequest(filePath: string): Response {
        const entry = this.entries.find(e => e.entryName === filePath)
        if (entry) {
            const content = entry.getData()
            // `content` is a Buffer, however the response demands an `ArrayBuffer`, so we convert it
            const contentArrayBuffer = Buffer.from(content)
            const contentType = mime.getType(filePath) || 'application/octet-stream'
            return new Response(contentArrayBuffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                }
            })
        } else {
            return new Response('File not Found', { status: 404 })
        }
    }
}
