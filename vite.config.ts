import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'url'
import fs from 'node:fs'
import path from 'node:path'

function copyAnimationAssetsPlugin(): Plugin {
  return {
    name: 'copy-animation-assets',
    closeBundle() {
      try {
        const rootDir = fileURLToPath(new URL('.', import.meta.url))
        const srcAnim = path.resolve(rootDir, 'animation')
        const destAnim = path.resolve(rootDir, 'dist/animation')
        if (fs.existsSync(srcAnim)) {
          fs.cpSync(srcAnim, destAnim, { recursive: true })
        }
        const animOtter = path.resolve(rootDir, 'animation/Otter_icon_closing_animation_1080p_20261025225329.mp4')
        const publicOtter = path.resolve(rootDir, 'public/Otter_icon_closing_animation_1080p_20261025225329.mp4')
        const destOtter = path.resolve(rootDir, 'dist/Otter_icon_closing_animation_1080p_20261025225329.mp4')
        if (fs.existsSync(animOtter) && !fs.existsSync(destOtter)) {
          fs.copyFileSync(animOtter, destOtter)
        } else if (fs.existsSync(publicOtter) && !fs.existsSync(destOtter)) {
          fs.copyFileSync(publicOtter, destOtter)
        }
      } catch (e) {
        console.warn('Animation assets copy warning:', e)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copyAnimationAssetsPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
