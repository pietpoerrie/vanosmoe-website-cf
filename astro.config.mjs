import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.vanosmoe.be',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  server: {
    port: 4321,
    host: true
  }
});
