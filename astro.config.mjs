// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://integrant.com.au',
  output: 'static',
  // Matches vercel.json (`trailingSlash: false`), so canonicals and sitemap
  // entries name the URL that is actually served rather than one that 308s.
  trailingSlash: 'never',
  integrations: [sitemap()],
  // Honour an externally assigned dev-server port; Astro's default 4321
  // stands when PORT is unset.
  server: process.env.PORT ? { port: Number(process.env.PORT) } : {},
  vite: {
    plugins: [tailwindcss()],
  },
});
