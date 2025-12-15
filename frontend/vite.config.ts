import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Minimal Vite config for this React + TS app
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  preview: {
    port: 3000,
  },
});


