import express from 'express';
import React from 'react';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { renderToString } from 'react-dom/server';
import { HomePage, notNextServerSideProps } from './app/pages/index.jsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.get('/', async (req, res) => {
  const initialData = await notNextServerSideProps(fetch);
  const htmlContent = renderToString(<HomePage {...initialData.props} />);

  const html = `<!DOCTYPE html >
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>React SSR</title>
      </head>
      <body>
        <div id="root">${htmlContent}</div>
        <script>window.__SSR_DATA__ = ${JSON.stringify(initialData.props)}</script>
        <script src="/dist/client.js"></script>
      </body>
    </html>
  `;
  res.send(html);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
