import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Split the heaviest third-party code out of the main bundle so the
    // initial download stays lean (fixes the >500kB chunk warning).
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-charts': ['recharts'],
          'vendor-pdf': ['jspdf'],
        },
      },
    },
  },
});
