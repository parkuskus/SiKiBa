import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SIAGA Bunda - Sistem Informasi Antisipasi & menjaGA Bunda',
        short_name: 'SIAGA Bunda',
        lang: 'id',
        description: 'Siaga menjaga bunda dan buah hati — skrining ibu hamil, nifas & bayi baru lahir (PDUPT Poltekkes Bandung)',
        theme_color: '#6B8E73',
        background_color: '#FFFDEC',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'logo-pwa-512x512.png', sizes: '192x192 512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'google-maps', expiration: { maxEntries: 20, maxAgeSeconds: 86400 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
