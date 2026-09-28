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
        description: 'Siaga menjaga bunda dan buah hati — skrining ibu hamil, nifas & bayi baru lahir (PDUPT Poltekkes Bandung)',
        theme_color: '#6B8E73',
        background_color: '#FFFDEC',
        display: 'standalone',
        icons: [
          { src: 'logo-siaga-bunda.png', sizes: 'any', type: 'image/png', purpose: 'any maskable' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
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
