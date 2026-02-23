import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // Use relative paths for deployment flexibility
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate PIXI.js into its own chunk for better caching
          'pixi': ['pixi.js']
        }
      }
    },
    target: 'es2018', // Good browser support while maintaining modern features
    minify: 'esbuild', // Fast minification
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // Optimize for production
  esbuild: {
    drop: ['console', 'debugger'], // Remove console.log in production
  }
})