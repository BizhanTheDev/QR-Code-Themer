import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_ADSENSE_CLIENT_ID': JSON.stringify(env.VITE_ADSENSE_CLIENT_ID),
        'process.env.VITE_ADSENSE_SLOT_ID': JSON.stringify(env.VITE_ADSENSE_SLOT_ID),
      },
      resolve: {
        alias: {
          // FIX: `__dirname` is not available in ES modules.
          // We construct the directory name from `import.meta.url`.
          '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.'),
        }
      }
    };
});