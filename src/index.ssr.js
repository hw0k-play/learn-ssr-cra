import React from 'react';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { renderToString } from 'react-dom/server';
import { choosePort } from 'react-dev-utils/WebpackDevServerUtils';

import App from './App';

const host = process.env.HOST ?? '0.0.0.0';
const parsedPort = parseInt(process.env.PORT, 10);
const port = parsedPort && !isNaN(parsedPort) ? parsedPort : 8080;

const app = express();
let server;

const assetManifest = JSON.parse(
  fs.readFileSync(path.resolve('./build/asset-manifest.json'), 'utf8')
);

const jsChunks = Object.keys(assetManifest.files)
  .filter(key => /chunk\.js$/.exec(key))
  .map(key => `<script src="${assetManifest.files[key]}"></script>`)
  .join('');

function createAppContainerHTML(reactRoot) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <link rel="icon" href="/favicon.ico" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta
        name="description"
        content="Web site created using create-react-app"
      />
      <title>React App</title>
      <link rel="stylesheet" href="${assetManifest.files['main.css']}" />
    </head>
    <body>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div id="root">
        ${reactRoot}
      </div>
      <script src="${assetManifest.files['runtime-main.js']}"></script>
      ${jsChunks}
      <script src="${assetManifest.files['main.js']}"></script>
    </body>
  </html>
  `;
}

function render(req, res, next) {
  const jsx = (
    <App />
  );

  const root = renderToString(jsx);
  res.status(200).send(createAppContainerHTML(root));
}

const serve = express.static(path.resolve('./build'), { index: false });

app.use(serve);
app.use(render);

choosePort(host, port)
  .then(selectedPort => {
    server = app.listen(selectedPort, () => {
      console.log(`Server is running on ${host}:${selectedPort}`);
    });
  })
  .catch(err => {
    console.error(err)
  });

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.stdin.on('end', shutdown);

function shutdown() {
  server.close();
  process.exit();
}
