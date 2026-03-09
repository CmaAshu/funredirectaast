import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { unlinkSync, existsSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'remove-redirects',
      closeBundle() {
        const redirectsPath = resolve(__dirname, 'dist/_redirects')
        if (existsSync(redirectsPath)) {
          unlinkSync(redirectsPath)
          console.log('Removed dist/_redirects')
        }
      }
    }
  ],
  base: '/',
})
