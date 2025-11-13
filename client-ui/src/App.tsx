import { useRef } from 'react'
import { Box, Button } from '@mui/material'

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

  return <Box>
    <Button variant="contained" onClick={() => filePickerRef.current?.click()}>
      Pick a file
    </Button>
    <input
      ref={filePickerRef}
      accept='.epub,application/epub+zip'
      type="file"
      style={{ display: 'none' }}
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) {
          file.arrayBuffer()  .then((data) => {
            return window.epubReader.loadFile(data)
          })
        }
      }}
    />
  </Box>
}

export default App
