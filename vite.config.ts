import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import tailwindcssPlugin from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcssPlugin,
        autoprefixer
      ]
    }
  }
})
