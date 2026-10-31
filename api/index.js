const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const acceptsHtml = (req.headers.accept && req.headers.accept.includes('text/html')) || req.query?.format === 'html';
  const wantsJson = req.query?.format === 'json';

  if (acceptsHtml && !wantsJson) {
    try {
      const htmlPath = path.join(process.cwd(), 'index.html');
      if (fs.existsSync(htmlPath)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.statusCode = 200;
        res.end(fs.readFileSync(htmlPath, 'utf8'));
        return;
      }
    } catch (e) {}
  }

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({
    status: 'online',
    product: 'Easy Chart API - Headless Transparent Vector Overlay Engine',
    version: '1.0.0',
    brand_color: '#004aad',
    endpoints: [
      'POST /v1/chart.svg',
      'POST /v1/chart/dossier',
      'GET /v1/chart/sample.svg'
    ]
  }, null, 2));
};

