import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
// PWA-Konfiguration: Manifest + Service Worker.
// - Precache aller statischen Assets → Buchungsdaten offline verfügbar (Flugzeug!).
// - Runtime-Cache für Open-Meteo (StaleWhileRevalidate, 30 min).
// - Runtime-Cache für Flug-APIs (CacheFirst), sofern später aktiviert.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon.svg'],
      manifest: {
        name: 'Zypern 2026',
        short_name: 'Zypern 2026',
        description:
          'Private Familien-Urlaubs-App für Aradippou (Zypern), 17.07.–07.08.2026',
        lang: 'de',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#0c7fa8',
        icons: [
          {
            src: '/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        // App-Shortcuts (Android Long-Press, v0.5 §14).
        shortcuts: [
          { name: 'Flüge', url: '/fluege', icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }] },
          { name: 'Strände', url: '/entdecken', icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }] },
          { name: 'Einkaufen', url: '/entdecken/einkaufen', icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }] },
          { name: 'Notfall', url: '/mehr', icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Open-Meteo cachen: veraltete Daten sofort zeigen, dann aktualisieren.
        // v0.2: Marine-Endpoint + AllOrigins-Proxy ergänzt (60 min).
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname === 'api.open-meteo.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'open-meteo-cache',
              expiration: { maxAgeSeconds: 60 * 30 }, // 30 min
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'marine-api.open-meteo.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'open-meteo-marine-cache',
              expiration: { maxAgeSeconds: 60 * 60 }, // 60 min
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'api.allorigins.win',
            handler: 'CacheFirst',
            options: {
              cacheName: 'allorigins-cache',
              expiration: { maxAgeSeconds: 60 * 60, maxEntries: 50 }, // 60 min
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
