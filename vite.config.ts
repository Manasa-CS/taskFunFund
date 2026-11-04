import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  base: '/taskFunFund/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'TaskFunFund',
        short_name: 'TaskFunFund',
        description: 'Do tasks, have fun, grow your fund.',
        theme_color: '#ffd43b',
        background_color: '#fffbeb',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/taskFunFund/',
        scope: '/taskFunFund/',
        icons: [
          { src: '/icons/icon-48.webp', sizes: '48x48', type: 'image/webp' },
          { src: '/icons/icon-72.webp', sizes: '72x72', type: 'image/webp' },
          { src: '/icons/icon-96.webp', sizes: '96x96', type: 'image/webp' },
          { src: '/icons/icon-128.webp', sizes: '128x128', type: 'image/webp' },
          { src: '/icons/icon-192.webp', sizes: '192x192', type: 'image/webp', purpose: 'any' },
          { src: '/icons/icon-256.webp', sizes: '256x256', type: 'image/webp' },
          { src: '/icons/icon-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'any' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,webp,png,svg,ico}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
