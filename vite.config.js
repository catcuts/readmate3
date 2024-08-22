import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';
import makeManifest from './utils/plugins/make-manifest';
import buildContentScript from './utils/plugins/build-content-script';
import { outputFolderName } from './utils/constants';
import copyI18n from './utils/plugins/copy-i18n';
import alias from '@rollup/plugin-alias';
import svgr from "vite-plugin-svgr";
import { pwd, utilsDir, srcDir, pagesDir, assetsDir, publicDir } from './alias.config';

const outDir = resolve(pwd, outputFolderName);

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@utils': utilsDir,
      '@src': srcDir,
      '@assets': assetsDir,
      '@pages': pagesDir,
    },
  },
  plugins: [
    alias({
      entries: {
        '@utils': utilsDir,
        '@src': srcDir,
        '@assets': assetsDir,
        '@pages': pagesDir,
      },
    }),
    // svgr(),
    react(),
    makeManifest(),
    buildContentScript(),
    copyI18n(),
  ],
  publicDir,
  build: {
    outDir,
    sourcemap: process.env.__DEV__ === 'true',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        devtools: resolve(pagesDir, 'devtools', 'index.html'),
        panel: resolve(pagesDir, 'panel', 'index.html'),
        background: resolve(pagesDir, 'background', 'index.js'),
        popup: resolve(pagesDir, 'popup', 'index.html'),
        newtab: resolve(pagesDir, 'newtab', 'index.html'),
        options: resolve(pagesDir, 'options', 'index.html'),
      },
      output: {
        entryFileNames: (chunk) => `src/pages/${chunk.name}/index.js`,
      },
    },
    minify: 'terser',
    terserOptions: {
      output: {
        ascii_only: true,
      },
    },
  },
});
