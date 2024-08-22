import React, { useState, useEffect, useRef } from 'react';
import defaultFileTypeImg from '@assets/img/defaultFileType.svg';
import imageFileTypeImg from '@assets/img/imageFileType.svg';
import jpgFileTypeImg from '@assets/img/jpgFileType.svg';
import pngFileTypeImg from '@assets/img/pngFileType.svg';
import bmpFileTypeImg from '@assets/img/bmpFileType.svg';
import gifFileTypeImg from '@assets/img/gifFileType.svg';
import svgFileTypeImg from '@assets/img/svgFileType.svg';
import musicFileTypeImg from '@assets/img/musicFileType.svg';
import videoFileTypeImg from '@assets/img/videoFileType.svg';
import mp4FileTypeImg from '@assets/img/mp4FileType.svg';
import txtFileTypeImg from '@assets/img/txtFileType.svg';
import pdfFileTypeImg from '@assets/img/pdfFileType.svg';
import wordFileTypeImg from '@assets/img/wordFileType.svg';
import excelFileTypeImg from '@assets/img/excelFileType.svg';
import pptFileTypeImg from '@assets/img/pptFileType.svg';
import zipFileTypeImg from '@assets/img/zipFileType.svg';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (file) => {
  // 这里可以根据文件类型返回不同的图标
  const fileExtName = file.name.split('.').pop().toLowerCase();
  switch (fileExtName) {
    case 'jpg':
    case 'jpeg':
      return jpgFileTypeImg;
    case 'png':
      return pngFileTypeImg;
    case 'gif':
      return gifFileTypeImg;
    case 'bmp':
      return bmpFileTypeImg;
    case 'svg':
      return svgFileTypeImg;
    case 'mp3':
      return musicFileTypeImg;
    case 'mp4':
      return mp4FileTypeImg;
    case 'txt':
      return txtFileTypeImg;
    case 'pdf':
      return pdfFileTypeImg;
    case 'doc':
    case 'docx':
      return wordFileTypeImg;
    case 'xls':
    case 'xlsx':
      return excelFileTypeImg;
    case 'ppt':
    case 'pptx':
      return pptFileTypeImg;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
    case 'bz2':
    case 'xz':
      return zipFileTypeImg;
    default:
      return defaultFileTypeImg;
  };
};

const File = ({ index, file, onRemove }) => {
  return (
    <div key={index} className="relative bg-gray-100 rounded-2xs p-2 text-sm group">
      <div className="flex items-center">
        <div className="mr-2">
          <img
            src={chrome.runtime.getURL(getFileIcon(file))}
            alt="File"
            className="w-8 h-8"
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="truncate">{file.name}</div>
          <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onRemove) onRemove(index);
        }}
        className="absolute top-1 right-1 bg-gray-200 hover:bg-gray-300 border-0 rounded-2xs-full w-4 h-4 flex items-center justify-center text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  );
};

export default File;