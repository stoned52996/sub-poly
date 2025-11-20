import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // split vendor chunks to reduce single large bundle sizes
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('node_modules/vue') || id.includes('node_modules/@vue')) return 'vendor-vue';
            if (id.includes('node_modules/vue-router')) return 'vendor-vue-router';
            if (id.includes('node_modules/element-plus')) return 'vendor-element-plus';
            if (id.includes('node_modules/ant-design-vue')) return 'vendor-antdv';
            if (id.includes('node_modules/marked') || id.includes('node_modules/axios')) return 'vendor-utils';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000 // KB
  }
})
