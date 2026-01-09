import { ArrowBack, ArrowForward } from "@mui/icons-material"
import { Box, Button, Stack, Typography } from "@mui/material"
import { useEffect, useMemo, useState } from "react"

export default function EpubView({ url }: { url: string }) {
    // TODO
    const [rootFilePath, setRootFilePath] = useState<string | null>(null)
    const [title, setTitle] = useState<string | null>(null)
    const [items, setItems] = useState<Array<{ id: string, href: string, mediaType: string }>>([])
    const [itemPosition, setItemPosition] = useState<number>(0)

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

    return <Box>
        {items.length > 0 ? (
            <Stack direction="column" spacing={2}>
                <iframe
                    title="EPUB Viewer"
                    src={url + '/' + items[itemPosition].href}
                    style={{ width: '100%', height: '80vh', border: 'none' }}
                />
                <Stack direction="row" spacing={2} justifyContent="space-between">
                    <Button
                        variant="contained"
                        startIcon={<ArrowBack />}
                        disabled={itemPosition === 0}
                        onClick={() => setItemPosition(itemPosition - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="contained"
                        endIcon={<ArrowForward />}
                        disabled={itemPosition === items.length - 1}    
                        onClick={() => setItemPosition(itemPosition + 1)}
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
