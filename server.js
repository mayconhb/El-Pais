const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath.split('?')[0]);

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, 'index.html'), (err2, content2) => {
          if (err2) {
            res.writeHead(404);
            res.end('Not Found');
          } else {
            res.writeHead(200, { 
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache'
            });
            res.end(content2);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      const cacheControl = ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable';
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': cacheControl
      });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Static server running at http://0.0.0.0:${PORT}/`);
});
