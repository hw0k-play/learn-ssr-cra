import React from 'react';
import { renderToString } from 'react-dom/server';
// import './index.css';

import App from './App';

const html = renderToString(<App />);

console.log(html);