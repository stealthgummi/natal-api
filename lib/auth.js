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

  const proxySecret = req.headers['x-rapidapi-proxy-secret'];
  const rapidUser = req.headers['x-rapidapi-user'] || 'anonymous';

  if (proxySecret !== expectedSecret) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 403;
    res.end(JSON.stringify({
      error: 'Direct access forbidden',
      message: 'This API must be accessed via RapidAPI. Please subscribe to obtain an API key.'
    }));
    return false;
  }

  // Tag request with authenticated RapidAPI user ID
  req.rapidUser = rapidUser;
  return true;
}

module.exports = { verifyRapidApi };

