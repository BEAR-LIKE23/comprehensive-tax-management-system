
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY is replaced with the actual value during build
      // We default to '' to prevent it from being undefined in the code
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Prevents 'process is not defined' error in browser
      'process.env': {}
    },
  };
});
