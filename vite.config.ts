import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Forzar el uso de una única instancia de React para evitar errores de Hooks
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
        // Asegurar que no se externalicen dependencias críticas accidentalmente
        external: [],
    }
  }
});