#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const querystring = require('querystring');

const PORT = Number(process.env.MOCK_FORMSPREE_PORT) || 8787;
const configPath = path.resolve(__dirname, '../assets/js/contact-config.js');

let config = {};
try {
  const fileContents = fs.readFileSync(configPath, 'utf8');
  const context = { window: {} };
  vm.runInNewContext(fileContents, context, { filename: 'contact-config.js' });
  config = context.window.FORMSPREE_CONFIG || {};
} catch (error) {
  console.warn('[mock-formspree] Unable to load contact-config.js:', error.message);
  config = {};
}

const successRedirect = config.successRedirect || 'contact-success.html?status=success';
const errorRedirect = config.errorRedirect || 'contact-error.html?status=error';

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://localhost:${PORT}`);
  const forceError = requestUrl.searchParams.get('forceError') === '1';

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.socket.destroy();
      }
    });
    req.on('end', () => {
      const parsed = querystring.parse(body);
      const payloadSummary = Object.keys(parsed);

      const redirectTarget = parsed._redirect || successRedirect;
      const errorTarget = parsed._error || errorRedirect;

      if (forceError) {
        res.statusCode = 303;
        res.setHeader('Location', errorTarget);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, redirect: errorTarget, receivedKeys: payloadSummary }));
        return;
      }

      res.statusCode = 303;
      res.setHeader('Location', redirectTarget);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, receivedKeys: payloadSummary, redirect: redirectTarget }));
    });
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({
    ok: true,
    hint: 'POST form data to simulate Formspree redirect responses',
    successRedirect,
    errorRedirect,
    forceErrorParam: 'forceError=1'
  }, null, 2));
});

server.listen(PORT, () => {
  console.log(`[mock-formspree] Listening on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('\n[mock-formspree] Server stopped');
    process.exit(0);
  });
});
