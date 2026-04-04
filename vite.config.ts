import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/rss': {
        target: 'https://www.edu.tw',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/rss/, ''),
      },
    },
  },
})
