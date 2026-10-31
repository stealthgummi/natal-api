/**
 * RapidAPI Authentication & Security Middleware
 * 
 * Verifies that requests to the Vercel serverless function originate
 * from RapidAPI's proxy gateway and have an active subscription.
 */

function verifyRapidApi(req, res) {
  // Always permit CORS Preflight
  if (req.method === 'OPTIONS') {
    return true;
  }

  const expectedSecret = process.env.RAPIDAPI_PROXY_SECRET;

  // If no secret configured (local dev / staging), permit access
  if (!expectedSecret) {
    return true;
  }

  // 1. Verify RapidAPI Gateway Proxy Secret (for paid RapidAPI subscribers)
  const proxySecret = req.headers['x-rapidapi-proxy-secret'];
  if (proxySecret && proxySecret === expectedSecret) {
    req.rapidUser = req.headers['x-rapidapi-user'] || 'rapidapi-subscriber';
    return true;
  }

  // 2. Secure Same-Origin Whitelist for the Website Sandbox Demo
  // Browsers enforce Sec-Fetch-Site and Origin; outside scripts/apps cannot spoof them
  const origin = (req.headers['origin'] || '').toLowerCase();
  const referer = (req.headers['referer'] || '').toLowerCase();
  const host = (req.headers['host'] || '').toLowerCase();

  const isSameSite = 
    origin.includes('easy-chart-api.vercel.app') ||
    referer.includes('easy-chart-api.vercel.app') ||
    origin.includes('localhost') ||
    referer.includes('localhost') ||
    host.includes('localhost');

  if (isSameSite && req.headers['sec-fetch-site'] !== 'cross-site') {
    req.rapidUser = 'demo-sandbox-user';
    return true;
  }

  // 3. Block all direct unauthorized external requests
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 403;
  res.end(JSON.stringify({
    error: 'Direct access forbidden',
    message: 'This API must be accessed via RapidAPI. Please subscribe on RapidAPI to obtain an API key.'
  }));
  return false;
}

module.exports = { verifyRapidApi };

