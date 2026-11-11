import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const apiUrl = process.env.services__server__http__0
  || process.env.CAMPUSFIX_API_URL
  || 'http://localhost:5528';

export default defineConfig({
  plugins: [sveltekit({ adapter: adapter({ fallback: 'index.html', pages: 'dist', assets: 'dist' }) })],
  server: {
    host: '127.0.0.1',
    open: process.env.VITE_BROWSER === 'true',
    proxy: {
      '/api': { target: apiUrl, changeOrigin: true }
    }
  }
});
