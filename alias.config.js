import { resolve } from 'path';

export const pwd = resolve(__dirname);
export const srcDir = resolve(pwd, 'src');
export const pagesDir = resolve(srcDir, 'pages');
export const assetsDir = resolve(srcDir, 'assets');
export const publicDir = resolve(pwd, 'public');
