import React, { useState, createContext } from 'react';
import { createRoot } from 'react-dom/client';

import Floater from '@pages/content/Floater';
import Chatbox from '@pages/content/Chatbox';

import getMaxZIndex from '@utils/get-max-z-index';

import './style.css'

const ZIndexContext = createContext(0);

function App() {
  const initMaxZIndex = getMaxZIndex();

  console.log(`initMaxzIndex: ${initMaxZIndex}`);

  const [zIndex, setZIndex] = useState(initMaxZIndex);

  window.addEventListener('load', function onPageLoaded() {
    const maxZIndex = getMaxZIndex();
    console.log(`Readmate3 已等待页面加载完成，当前最大的 z-index 为 ${maxZIndex}`);
    setZIndex(maxZIndex);
    window.removeEventListener('load', onPageLoaded);
  });

  return (
    <ZIndexContext.Provider value={zIndex}>
      <Chatbox chatRecords={chatRecords} />
      <Floater />
    </ZIndexContext.Provider>
  );
}

const div = document.createElement('div');
div.id = 'readmate-extension-root';
// 设置根元素的样式，这样可以确保根元素的样式不会被网页的样式覆盖
div.style.cssText = `
  line-height: 1.5;
  font-size: 16px;
  font-family: Arial, sans-serif;
`;
document.body.appendChild(div);

const rootContainer = document.querySelector('#readmate-extension-root');
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);
root.render(<App />);

try {
  console.log('content script loaded');
} catch (e) {
  console.error(e);
}

export { ZIndexContext };