import { useRef, useState } from 'react'
import { Box, Button, Stack } from '@mui/material'
import { FileOpen } from '@mui/icons-material'
import EpubView from './Epub'

// Declared in preload.ts
declare global {
  interface Window {
    epubReader: {
      loadFile: (data: ArrayBuffer) => Promise<string>
    }
  }
}

function App() {
  const filePickerRef = useRef<HTMLInputElement>(null)

  const [url, setUrl] = useState<string | null>(null)

  return <Stack direction="column">
    <Box>
      <Button variant="contained" startIcon={<FileOpen />} onClick={() => filePickerRef.current?.click()}>
        Open
      </Button>
      <input
        ref={filePickerRef}
        accept='.epub,application/epub+zip'
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            file.arrayBuffer().then((data) => {
              return window.epubReader.loadFile(data)
            }).then((url) => {
              setUrl(url)
            })
          }
        }}
      />
    </Box>
    <Box>
      {url && <EpubView url={url} />}
    </Box>
  </Stack>
}

export default App
