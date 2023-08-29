import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
  assetsInclude: ['**/*.md'],
  plugins: [react()],
  build: {
        minify: false
    },
  define: {
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for segment analytics lib to work
    global: {},
  },
});
