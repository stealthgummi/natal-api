const { calculateNatalChart } = require('../lib/ephemeris.js');
const { AstroSvgEngine } = require('../lib/engine.js');
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

    const theme = req.query?.theme || body.theme || 'midnight';
    const size = parseInt(req.query?.size || body.size) || 800;
    const houseSystem = body.house_system || 'whole_sign';

    const birth = body.birth_data || body;
    const chartData = calculateNatalChart({
      date: birth.date,
      birth_date: birth.date || birth.birth_date,
      birth_time: birth.time || birth.birth_time,
      time: birth.time || birth.birth_time,
      city: birth.city,
      latitude: birth.latitude || birth.lat,
      longitude: birth.longitude || birth.lon,
      timezone: birth.timezone,
      house_system: houseSystem
    });

    const engine = new AstroSvgEngine({ theme, size });
    const svg = engine.render(chartData);
    const aspects = engine.calculateAspects(chartData.planets);

    const svgBase64 = Buffer.from(svg).toString('base64');
    const dataUri = `data:image/svg+xml;base64,${svgBase64}`;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      meta: chartData.meta,
      angles: chartData.angles,
      planets: chartData.planets,
      houses: chartData.houses,
      aspects,
      chart_vector: {
        theme,
        size,
        data_uri: dataUri,
        raw_svg: svg
      }
    }, null, 2));

  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 400;
    res.end(JSON.stringify({
      error: 'Calculation failed',
      details: error.message
    }));
  }
};

