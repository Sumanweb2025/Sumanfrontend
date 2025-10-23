import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

   // Public directory for static assets
  publicDir: 'public',

   // Production build optimizations
  build: {
     // Output directory
    outDir: 'dist',
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'react-icons'],
          'vendor-charts': ['chart.js', 'react-chartjs-2', 'recharts'],
          'vendor-forms': ['react-select', 'react-phone-input-2'],
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Source maps for production debugging (optional, can disable for smaller builds)
    sourcemap: false,
    
    // Target modern browsers for smaller bundle
    target: 'es2015'
  },
  
  // Development server optimizations
  server: {
    // Enable HMR
    hmr: true,
    // Optimize deps
    watch: {
      usePolling: false
    }
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'framer-motion'
    ]
  }
})
