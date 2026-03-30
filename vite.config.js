import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error',

  preview: {
    host: '0.0.0.0',
    port: 10000,
    allowedHosts: [
      'mobart.onrender.com'
    ]
  },

  server: {
    host: '0.0.0.0'
  },

  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true
    }),
    react(),
  ]
});
