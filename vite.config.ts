import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5214',
        changeOrigin: true
      },
      '/hubs': {
        target: 'http://localhost:5214',
        changeOrigin: true,
        ws: true
      },
      '/backend': {
        target: 'http://localhost:5214',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, '')
      }
    }
  }
});
