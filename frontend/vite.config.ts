import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: { target: "es2020" },
  },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 3000, // Increased from default 1500kB to 3000kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('monaco-editor')) return 'monaco';
            if (id.includes('quill')) return 'quill';
            if (id.includes('radix-ui')) return 'radix';
            return 'vendor';
          }
        },
      },
    },
  },
});
