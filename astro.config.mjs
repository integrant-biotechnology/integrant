// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://integrant.com.au',
  output: 'static',
  integrations: [sitemap()],
  // Honour a harness-assigned port (Claude Code preview autoPort); Astro's
  // default 4321 stands when PORT is unset.
  server: process.env.PORT ? { port: Number(process.env.PORT) } : {},
  vite: {
    plugins: [tailwindcss()],
  },
});
