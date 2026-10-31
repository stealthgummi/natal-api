module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
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
