import { defineConfig } from 'vite';  
import react from '@vitejs/plugin-react';  
import { resolve } from 'path';  
  
export default defineConfig({  
  base: '/WatthieuGame/', // Remplacez <nom-du-repo> par le nom de votre dépôt GitHub  
  plugins: [react()],  
  resolve: {  
    alias: {  
      '@': resolve(__dirname, 'src'),  
    },  
  },  
});