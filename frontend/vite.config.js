import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/gemtrack-biocristal/', // <-- Aquí pones el nombre de tu repo
  plugins: [react()],
});
