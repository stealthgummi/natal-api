const { calculateNatalChart } = require('../lib/ephemeris.js');
const { AstroOverlayEngine } = require('../lib/engine.js');
const { verifyRapidApi } = require('../lib/auth.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-RapidAPI-Key, X-RapidAPI-Host, X-RapidAPI-Proxy-Secret');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // RapidAPI Subscription Gate
  if (!verifyRapidApi(req, res)) {
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body || '{}');
    } else if (!body) {
      body = {};
    }

    const size = parseInt(req.query?.size || body.size) || 800;
    const houseSystem = body.house_system || 'whole_sign';
    const birth = body.birth_data || body;

    // Calculate Astronomical Positions
    const chartData = calculateNatalChart({
      date: birth.date,
      birth_date: birth.date || birth.birth_date,
      birth_time: birth.time || birth.birth_time,
      city: birth.city || 'Cincinnati',
      latitude: birth.latitude || birth.lat,
      longitude: birth.longitude || birth.lon,
      timezone: birth.timezone,
      house_system: houseSystem
    });

    // Render Pure Transparent Overlay
    const engine = new AstroOverlayEngine({ size });
    const svg = engine.render(chartData);

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
    res.setHeader('X-Astro-Overlay', 'v1.0');
    res.statusCode = 200;
    res.end(svg);

  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 400;
    res.end(JSON.stringify({
      error: 'Chart generation failed',
      details: error.message
    }));
  }
};
