import colorLog from '../log';
import { build } from 'vite'; 
import { resolve } from 'path';
import { outputFolderName } from '../constants';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

import { pwd, utilsDir, srcDir, pagesDir, assetsDir, publicDir } from '../../alias.config';

const packages = [
  {
    content:  resolve(pwd, 'src/pages/content/index.jsx')
  },
];

const outDir = resolve(pwd, outputFolderName); 

export default function buildContentScript() {
  return {
    name: 'build-content',
    async buildEnd() {
      for (const _package of packages) {
        await build({
          publicDir: false,
          resolve: {
            alias: {
              '@utils': utilsDir,
              '@src': srcDir,
              '@assets': assetsDir,
              '@pages': pagesDir,
            },
          },
          plugins: [ cssInjectedByJsPlugin() ],
          build: {
            outDir,
            sourcemap: process.env.__DEV__ === 'true',
            emptyOutDir: false,
            rollupOptions: {
              input: _package,
              output: {
                entryFileNames: (chunk) => {
                  return `src/pages/${chunk.name}/index.js`;
                },
              },
            },
            minify: 'terser',
            terserOptions: {
              output: {
                ascii_only: true,
              },
            },
          },
          configFile: false,
        });
      }
      colorLog('Content code build sucessfully', 'success');
    },
  };
}
