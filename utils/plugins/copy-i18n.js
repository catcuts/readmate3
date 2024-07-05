import * as fs from 'fs';
import * as path from 'path';
import colorLog from '../log';

const { resolve } = path;

const outDir = resolve(__dirname, '..', '..', 'public');


function copyDirRecursiveSync(src, dest) {
  const exists = fs.existsSync(src); // 判断源路径是否存在

  if (!exists) {
    throw new Error(`Source directory does not exist! src: ${src}`);
  }

  const stats = fs.statSync(src); // 获取源路径的文件信息

  if (stats.isFile()) {
    fs.copyFileSync(src, dest); // 如果源路径是一个文件，则直接复制
    return;
  }

  fs.mkdirSync(dest, { recursive: true }); // 创建目标目录

  const files = fs.readdirSync(src); // 获取源目录下的所有文件和子目录

  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    copyDirRecursiveSync(srcPath, destPath); // 递归调用该函数来复制文件和子目录
  }
}



export default function copyI18n() {
  return {
    name: 'make-i18n',
    buildEnd() {
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
      }

      const srcLocalesPath = resolve(__dirname, '..', '..', 'src', '_locales');

      const destLocalesPath = resolve(outDir, '_locales');

      copyDirRecursiveSync(srcLocalesPath, destLocalesPath)

      colorLog(`Manifest file copy complete: ${destLocalesPath}`, 'success');
    },
  };
}
