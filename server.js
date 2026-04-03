// ─────────────────────────────────────────────────────────────────────────────
// ST-Trading-EDU — Local Development Server
// Run: node server.js
// Requires: .env file with DATABASE_URL=your_neon_connection_string
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT = process.env.PORT || 3000;

// ── MIME types ────────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

// ── Route API requests to the correct handler ─────────────────────────────────
function routeApi(pathname, req, res) {
  // Normalize: /api/auth/login → auth/login
  const rel = pathname.replace(/^\/api\//, '');

  let handlerPath;

  // Explicit routes
  if (rel === 'auth/login')   handlerPath = path.join(__dirname, 'api/auth/login.js');
  else if (rel === 'auth/session')  handlerPath = path.join(__dirname, 'api/auth/session.js');
  else if (rel === 'auth/logout')   handlerPath = path.join(__dirname, 'api/auth/logout.js');
  else if (rel === 'users' || rel === 'users/')  handlerPath = path.join(__dirname, 'api/users/index.js');
  else if (rel === 'modules')       handlerPath = path.join(__dirname, 'api/modules.js');
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  if (!fs.existsSync(handlerPath)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Handler not found: ' + rel }));
    return;
  }

  // Build a minimal req/res shim compatible with Vercel handler signature
  const parsedUrl = url.parse(req.url, true);
  req.query = parsedUrl.query;

  // Collect body
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    if (body) {
      try { req.body = JSON.parse(body); } catch(e) { req.body = {}; }
    } else {
      req.body = {};
    }

    // Shim res methods to Node http.ServerResponse
    if (!res.status) {
      res.status = function(code) {
        res.statusCode = code;
        return res;
      };
    }
    if (!res.json) {
      res.json = function(data) {
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/json');
        }
        res.end(JSON.stringify(data));
        return res;
      };
    }
    if (!res.end._patched) {
      const _origEnd = res.end.bind(res);
      res.end = function(data) {
        return _origEnd(data);
      };
      res.end._patched = true;
    }

    try {
      // Delete cached module so hot-reload works in dev
      delete require.cache[require.resolve(handlerPath)];
      const handler = require(handlerPath);
      handler(req, res);
    } catch(e) {
      console.error('Handler error:', e);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error', detail: e.message });
      }
    }
  });
}

// ── Static file server ────────────────────────────────────────────────────────
function serveStatic(pathname, res) {
  // Default to main app
  if (pathname === '/' || pathname === '') pathname = '/index.html';

  const filePath = path.join(__dirname, pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + pathname);
      return;
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

// ── Main server ───────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname  = decodeURIComponent(parsedUrl.pathname);

  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (pathname.startsWith('/api/')) {
    routeApi(pathname, req, res);
  } else {
    serveStatic(pathname, res);
  }
});

server.listen(PORT, () => {
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│  ST-Trading-EDU — Local Dev Server          │');
  console.log('├─────────────────────────────────────────────┤');
  console.log('│  App:   http://localhost:' + PORT + '               │');
  console.log('│  Admin: http://localhost:' + PORT + '/admin.html    │');
  console.log('└─────────────────────────────────────────────┘\n');
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL is not set! Create a .env file with:');
    console.warn('   DATABASE_URL=postgresql://user:pass@host/dbname\n');
  } else {
    console.log('✅ DATABASE_URL is configured\n');
  }
});
