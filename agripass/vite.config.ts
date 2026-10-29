import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath, URL } from 'node:url';

// `vite build` → standard multi-file build (deploy anywhere).
// `vite build --mode artifact` → single self-contained HTML for the hosted artifact.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'artifact' ? [viteSingleFile()] : [])],
  resolve: {
    alias: {
      // jsPDF's optional HTML renderer deps are not used (PDFs are drawn programmatically)
      html2canvas: fileURLToPath(new URL('./src/stubs/empty.ts', import.meta.url)),
      dompurify: fileURLToPath(new URL('./src/stubs/empty.ts', import.meta.url)),
      canvg: fileURLToPath(new URL('./src/stubs/empty.ts', import.meta.url)),
    },
  },
  build: { outDir: mode === 'artifact' ? 'dist-artifact' : 'dist', chunkSizeWarningLimit: 2000 },
}));
