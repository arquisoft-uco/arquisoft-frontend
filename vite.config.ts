import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setup.ts'],
    // Por defecto Vitest vacía los .css; el test de arquitectura lee src/tailwind.css con ?raw.
    css: { include: [/\.css\?raw/] },
  },
});
