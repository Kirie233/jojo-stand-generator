import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const textBaseUrl = env.VITE_GEMINI_BASE_URL || 'https://api.bltcy.ai/';
  const imageBaseUrl = env.VITE_IMAGE_BASE_URL || 'https://api.bltcy.ai/';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/__text_api': {
          target: textBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/__text_api/, ''),
        },
        '/__image_api': {
          target: imageBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/__image_api/, ''),
        },
      },
    },
  };
})
