import { ArrowBack, ArrowForward } from "@mui/icons-material"
import { Box, Button, Stack, Typography } from "@mui/material"
import { useEffect, useMemo, useState } from "react"

export default function EpubView({ url }: { url: string }) {
    const [rootFilePath, setRootFilePath] = useState<string | null>(null)
    const [title, setTitle] = useState<string | null>(null)
    const [items, setItems] = useState<Array<{ id: string, href: string, mediaType: string }>>([])
    const htmlItems = useMemo(() => items.filter(item => item.mediaType === 'application/xhtml+xml' || item.mediaType === 'text/html'), [items])
    const [htmlItemPosition, setHtmlItemPosition] = useState<number>(0)

    const xmlParser = useMemo(() => {
        return new DOMParser()
    }, [])

    useEffect(() => {
        if (title) {
            document.title = title
        }
    }, [title])

    useEffect(() => {
        (async () => {
            const containerText = await fetch(url + '/META-INF/container.xml').then(res => res.text())
            const containerDocument = xmlParser.parseFromString(containerText, 'application/xml')
            const rootfileElement = containerDocument.querySelector('rootfile')
            if (rootfileElement) {
                const fullPath = rootfileElement.getAttribute('full-path')
                if (fullPath) {
                    setRootFilePath(fullPath)
                }
            }
        })()
    }, [url])

    useEffect(() => {
        if (url && rootFilePath) {
            (async () => {
                const packageText = await fetch(url + '/' + rootFilePath).then(res => res.text())
                const packageDocument = xmlParser.parseFromString(packageText, 'application/xml')
                const titleElement = packageDocument.querySelector('metadata > title')
                if (titleElement) {
                    setTitle(titleElement.textContent)
                }
                const itemElements = packageDocument.querySelectorAll('manifest > item')
                const itemsArray: Array<{ id: string, href: string, mediaType: string }> = []
                itemElements.forEach((itemElement) => {
                    const id = itemElement.getAttribute('id')
                    const href = itemElement.getAttribute('href')
                    const mediaType = itemElement.getAttribute('media-type')
                    if (id && href && mediaType) {
                        console.log(href)
                        itemsArray.push({ id, href, mediaType })
                    }
                })
                setItems(itemsArray)
            })()
        }
    }, [url, rootFilePath])

    if (!rootFilePath) {
        return <Typography>Loading...</Typography>
    }

    // The HTML files are accessed relative to the root file path
    const rootDir = rootFilePath.substring(0, rootFilePath.lastIndexOf('/'))

    return <Box>
        {items.length > 0 ? (
            <Stack direction="column" spacing={2}>
                <iframe
                    title="EPUB Viewer"
                    src={url + '/' + rootDir + '/' + htmlItems[htmlItemPosition].href}
                    style={{ width: '100%', height: '80vh', border: 'none' }}
                />
                <Stack direction="row" spacing={2} justifyContent="space-between">
                    <Button
                        variant="contained"
                        startIcon={<ArrowBack />}
                        disabled={htmlItemPosition === 0}
                        onClick={() => setHtmlItemPosition(htmlItemPosition - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="contained"
                        endIcon={<ArrowForward />}
                        disabled={htmlItemPosition === htmlItems.length - 1}
                        onClick={() => setHtmlItemPosition(htmlItemPosition + 1)}
                    >
                        Next
                    </Button>
                </Stack>
            </Stack>
        ) : (
            <Typography>Empty book</Typography>
        )}
    </Box>
}
