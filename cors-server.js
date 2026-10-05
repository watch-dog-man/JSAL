const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 8765;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.txt': 'text/plain', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.map': 'application/json', '.mjs': 'application/javascript',
};

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
}

function proxyRequest(targetUrl, res) {
  const parsed = new URL(targetUrl);
  const proto = parsed.protocol === 'https:' ? https : http;
  const req = proto.get(parsed, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (proxyRes) => {
    if ([301, 302, 303, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
      return proxyRequest(new URL(proxyRes.headers.location, targetUrl).href, res);
    }
    setCors(res);
    res.writeHead(proxyRes.statusCode, { 'Content-Type': proxyRes.headers['content-type'] || 'text/plain' });
    proxyRes.pipe(res);
  });
  req.on('error', (e) => {
    setCors(res);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + e.message);
  });
  req.setTimeout(15000, () => { req.destroy(); });
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, 'http://localhost:' + PORT);

  if (req.method === 'OPTIONS') {
    setCors(res);
    res.writeHead(204);
    return res.end();
  }

  if (reqUrl.pathname === '/proxy') {
    const target = reqUrl.searchParams.get('url');
    if (!target) {
      setCors(res);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('Missing ?url= parameter');
    }
    if (!/^https?:\/\//i.test(target)) {
      setCors(res);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('Only http/https URLs supported');
    }
    return proxyRequest(target, res);
  }

  let filePath = path.join(ROOT, decodeURIComponent(reqUrl.pathname));
  if (filePath.endsWith(path.sep) || filePath === ROOT) filePath = path.join(filePath, 'index.html');

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      if (!err && stat.isDirectory()) {
        setCors(res);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        const files = fs.readdirSync(filePath);
        const list = files.map(f => '<li><a href="' + path.posix.join(reqUrl.pathname, f) + '">' + f + '</a></li>').join('');
        return res.end('<html><body><h1>Index of ' + reqUrl.pathname + '</h1><ul>' + list + '</ul></body></html>');
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    const ext = path.extname(filePath).toLowerCase();
    setCors(res);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
  console.log('CORS proxy at http://localhost:' + PORT + '/proxy?url=<target>');
});
