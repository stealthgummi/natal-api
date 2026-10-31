const { calculateNatalChart } = require('../lib/ephemeris.js');
const { AstroOverlayEngine } = require('../lib/engine.js');
const { generateDossier } = require('../lib/interpretations.js');
const { verifyRapidApi } = require('../lib/auth.js');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-RapidAPI-Key, X-RapidAPI-Host, X-RapidAPI-Proxy-Secret');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // RapidAPI Paywall Validation
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

    const birth = body.birth_data || body;
    const size = parseInt(body.size) || 800;

    // Calculate Astronomical Positions
    const chartData = calculateNatalChart({
      date: birth.date,
      birth_date: birth.date || birth.birth_date,
      birth_time: birth.time || birth.birth_time,
      city: birth.city || 'Cincinnati',
      latitude: birth.latitude || birth.lat,
      longitude: birth.longitude || birth.lon,
      timezone: birth.timezone
    });

    // Render Transparent Vector Overlay
    const engine = new AstroOverlayEngine({ size });
    const svg = engine.render(chartData);
    const aspects = engine.calculateAspects(chartData.planets);

    // Generate Interpretive Readings
    const dossier = generateDossier(chartData);

    // Build Base64 Data URI
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      meta: {
        location: chartData.meta.resolved_location,
        timezone: chartData.meta.timezone,
        utc_time: chartData.meta.utc_time
      },
      dossier: dossier,
      aspects: aspects,
      visual_package: {
        overlay_svg: svg,
        overlay_data_uri: dataUri,
        note: "Drop this transparent overlay SVG directly over your custom skin or background."
      }
    }, null, 2));

  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 400;
    res.end(JSON.stringify({
      error: 'Dossier generation failed',
      details: error.message
    }));
  }
};

