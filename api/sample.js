const { calculateNatalChart } = require('../lib/ephemeris.js');
const { AstroOverlayEngine } = require('../lib/engine.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const size = parseInt(req.query?.size) || 800;

  // The Official Brand Reference Chart (The Architect's Chart)
  const chartData = calculateNatalChart({
    birth_date: '1971-03-02',
    birth_time: '13:11',
    city: 'Cincinnati'
  });

  const engine = new AstroOverlayEngine({ size });
  const svg = engine.render(chartData);

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.statusCode = 200;
  res.end(svg);
};
