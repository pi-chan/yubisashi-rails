import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    cors: true,
  },
  build: {
    lib: {
      entry: 'src/yubisashi-rails.ts',
      formats: ['es'],
    },
  },
})
