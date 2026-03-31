import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    fs: {
      // docs/ は frontend/ の外にあるので親ディレクトリのアクセスを許可
      allow: [path.resolve(__dirname, '..')],
    },
  },
})
