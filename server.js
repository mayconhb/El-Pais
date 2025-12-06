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
  let urlPath = req.url.split('?')[0];
  
  // Remove trailing slash for consistency (except for root)
  if (urlPath !== '/' && urlPath.endsWith('/')) {
    urlPath = urlPath.slice(0, -1);
  }
  
  // Determine file path
  let filePath;
  if (urlPath === '/') {
    filePath = path.join(__dirname, 'index.html');
  } else {
    filePath = path.join(__dirname, urlPath);
  }
  
  // Check if it's a directory, if so try to serve index.html inside it
  const tryServeFile = (tryPath, fallbackToRoot = true) => {
    fs.stat(tryPath, (statErr, stats) => {
      if (statErr) {
        // File doesn't exist
        if (fallbackToRoot) {
          // Try serving root index.html for SPA-like behavior
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
          res.writeHead(404);
          res.end('Not Found');
        }
        return;
      }
      
      if (stats.isDirectory()) {
        // Try to serve index.html inside the directory
        const indexPath = path.join(tryPath, 'index.html');
        fs.readFile(indexPath, (err, content) => {
          if (err) {
            res.writeHead(404);
            res.end('Not Found');
          } else {
            res.writeHead(200, { 
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache'
            });
            res.end(content);
          }
        });
      } else {
        // Serve the file
        const ext = path.extname(tryPath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        
        fs.readFile(tryPath, (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error');
          } else {
            const cacheControl = ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable';
            res.writeHead(200, { 
              'Content-Type': contentType,
              'Cache-Control': cacheControl
            });
            res.end(content);
          }
        });
      }
    });
  };
  
  tryServeFile(filePath);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Static server running at http://0.0.0.0:${PORT}/`);
});
