// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://integrant.com.au',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
