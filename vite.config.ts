import { copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const outDir = fileURLToPath(new URL('./dist', import.meta.url));

// Static hosts like GitHub Pages serve 404.html for any unknown path. Making it
// the app lets a palette path (`/7ab4c8`) load the SPA, which then routes it.
const spaFallback = (): Plugin => ({
  name: 'spa-fallback',
  apply: 'build',
  closeBundle: async () => {
    await copyFile(`${outDir}/index.html`, `${outDir}/404.html`);
  },
});

export default defineConfig({
  root: fileURLToPath(new URL('./src/ui', import.meta.url)),
  plugins: [react(), tailwindcss(), spaFallback()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir,
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        // Libraries change less often than the app: their own chunks stay
        // cached across deploys. Shiki, grammars, color names and the editor
        // are split out already, loaded on demand.
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
            {
              name: 'base-ui',
              test: /[\\/]node_modules[\\/](@base-ui|@floating-ui)[\\/]/,
            },
          ],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
