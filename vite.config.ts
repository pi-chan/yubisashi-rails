import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/yubisashi-rails.ts',
      formats: ['es'],
    },
  },
})
