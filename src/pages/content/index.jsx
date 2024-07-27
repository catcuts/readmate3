import React from 'react';
import { createRoot } from 'react-dom/client';

import Floater from '@pages/content/Floater';

import './style.css'

const div = document.createElement('div');
div.id = '__root';
document.body.appendChild(div);

const rootContainer = document.querySelector('#__root');
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);
root.render(
  <Floater />
);

try {
  console.log('content script loaded');
} catch (e) {
  console.error(e);
}
