import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';

// for production builds swap to using the published version of prong editor, rather than the local one
function fixStringify() {
  return {
    name: 'fix-stringify',

    transform(src, id) {
      if (id.includes('utils/stringify.ts')) {
        const code = src.replace(
          'const stringify = require("json-stringify-pretty-compact");',
          "import stringify from 'json-stringify-pretty-compact';",
        );
        return {code, map: null};
      }
    },
  };
}

export default defineConfig({
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
  assetsInclude: ['**/*.md'],
  plugins: [react(), fixStringify()],
  build: {
    minify: false,
  },
  define: {
    // By default, Vite doesn't include shims for NodeJS
    global: {},
  },
});
