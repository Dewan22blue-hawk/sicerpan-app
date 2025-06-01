import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa'; // <-- Import VitePWA

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'), // Tetap dikomentari atau dihapus, karena tidak aktif.
  publicDir: resolve(__dirname, 'src', 'public'), // <--- Ini adalah lokasi aset publik Anda
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    // <-- Tambahkan bagian plugins ini
    VitePWA({
      registerType: 'autoUpdate',
      // Aset yang akan di-precache oleh Workbox (path relatif dari publicDir)
      includeAssets: ['favicon.ico', 'icons/*.png', 'icons/*.svg', 'screenshots/*.png'],

      manifest: {
        name: 'Dicoding Story App',
        short_name: 'StoryApp',
        description: 'Berbagi cerita seputar Dicoding, ekspresikan diri Anda sehari-hari dengan cerita menarik! By Denny Irawan',
        theme_color: '#4CAF50',
        background_color: '#F8F8F8',
        display: 'standalone',
        start_url: '/', // URL awal saat PWA dibuka (relatif ke root domain)

        icons: [
          { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
        shortcuts: [{ name: 'Tambah Cerita Baru', short_name: 'Tambah', description: 'Cepat menambahkan cerita baru ke aplikasi.', url: '/#/add-story', icons: [{ src: 'icons/add-story-icon.png', sizes: '192x192' }] }],
        screenshots: [
          { src: 'screenshots/desktop-screenshot.png', sizes: '1280x800', type: 'image/png', form_factor: 'wide', label: 'Tampilan desktop beranda' },
          { src: 'screenshots/mobile-screenshot.png', sizes: '750x1334', type: 'image/png', form_factor: 'narrow', label: 'Tampilan mobile beranda' },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,gif,webmanifest,json}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://story-api.dicoding.dev',
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://unpkg.com' || url.origin === 'https://cdnjs.cloudflare.com',
            handler: 'CacheFirst',
            options: { cacheName: 'cdn-cache', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
    }),
  ],
});
