import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base 设为相对路径，配合 HashRouter 可适配 GitHub Pages 子路径部署
export default defineConfig({
  plugins: [react()],
  base: './',
})
