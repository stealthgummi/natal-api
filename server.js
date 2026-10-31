const http = require('http');
const { AstroOverlayEngine } = require('./lib/engine.js');
const { calculateNatalChart } = require('./lib/ephemeris.js');
const { generateDossier } = require('./lib/interpretations.js');

const PORT = 3033;

const server = http.createServer((req, res) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key, X-RapidAPI-Host, X-RapidAPI-Proxy-Secret',
    'Access-Control-Max-Age': '86400'
  };

  Object.entries(corsHeaders).forEach(([h, v]) => res.setHeader(h, v));

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Resolve original requested path across Vercel, proxies, and local server
  const forwarded = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'] || req.headers['x-original-url'] || req.headers['x-rewrite-url'];
  const rawPath = forwarded || (url.pathname === '/server.js' ? '/' : url.pathname);
  const p = rawPath.split('?')[0].toLowerCase();

  // 1. POST /v1/chart.svg - Pure Transparent Overlay
  if ((p === '/v1/chart.svg' || p === '/v1/chart' || p === '/api/chart' || p === '/v1/chart/natal.svg' || p === '/api/natal-svg' || p.endsWith('/chart.svg') || p.endsWith('/chart') || p.endsWith('/natal-svg')) && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const birth = payload.birth_data || payload;

        const chartData = calculateNatalChart({
          date: birth.date,
          birth_date: birth.date || birth.birth_date,
          birth_time: birth.time || birth.birth_time,
          city: birth.city || 'New York',
          latitude: birth.latitude || birth.lat,
          longitude: birth.longitude || birth.lon,
          timezone: birth.timezone
        });

        const size = parseInt(payload.size) || 800;
        const engine = new AstroOverlayEngine({ size });
        const svg = engine.render(chartData);

        res.writeHead(200, {
          'Content-Type': 'image/svg+xml',
          'X-Astro-Overlay': 'v1.0'
        });
        res.end(svg);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Calculation failed', details: err.message }));
      }
    });
    return;
  }

  // 2. POST /v1/chart/dossier - Visual Overlay + Interpretive Starter Readings
  if ((p === '/v1/chart/dossier' || p === '/v1/chart/dossier.json' || p === '/api/dossier' || p.endsWith('/dossier') || p.endsWith('/dossier.json')) && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const birth = payload.birth_data || payload;

        const chartData = calculateNatalChart({
          date: birth.date,
          birth_date: birth.date || birth.birth_date,
          birth_time: birth.time || birth.birth_time,
          city: birth.city || 'Cincinnati',
          latitude: birth.latitude || birth.lat,
          longitude: birth.longitude || birth.lon,
          timezone: birth.timezone
        });

        const engine = new AstroOverlayEngine();
        const aspects = engine.calculateAspects(chartData.planets);
        const dossier = generateDossier(chartData);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          meta: {
            location: chartData.meta.resolved_location,
            timezone: chartData.meta.timezone,
            utc_time: chartData.meta.utc_time
          },
          dossier: dossier,
          aspects: aspects
        }, null, 2));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Dossier generation failed', details: err.message }));
      }
    });
    return;
  }

  // 3. GET /v1/chart/sample.svg - The Official Brand Reference Chart (The Architect's Chart)
  if ((p === '/v1/chart/sample.svg' || p === '/api/sample' || p.endsWith('/sample.svg') || p.endsWith('/sample')) && req.method === 'GET') {
    const chartData = calculateNatalChart({
      birth_date: '1971-03-02',
      birth_time: '13:11',
      city: 'Cincinnati'
    });
    const engine = new AstroOverlayEngine({ size: 800 });
    const svg = engine.render(chartData);

    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(svg);
    return;
  }

  // 3. Root health check
  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      product: 'Easy Chart API - Headless Transparent Vector Overlay Engine',
      version: '1.0.0',
      brand_color: '#004aad',
      endpoint: 'POST /v1/chart.svg'
    }, null, 2));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Endpoint not found',
    received_path: p,
    raw_url: req.url,
    forwarded: forwarded || null,
    headers: req.headers
  }));
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  ✦ AstroOverlay API running on http://localhost:${PORT}`);
  console.log(`  ✦ Endpoint: POST http://localhost:${PORT}/v1/chart.svg`);
  console.log(`======================================================\n`);
});
