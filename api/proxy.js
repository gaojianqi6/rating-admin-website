module.exports = async (req, res) => {
  // Get the API base URL from environment variables (or default to hardcoded value)
  const apiBaseUrl = process.env.API_URL || 'http://52.207.234.21/admin-api/api';

  // Extract the path from the request URL, removing the /api prefix
  // e.g., /api/v1/templates/?pageSize=100 → /v1/templates/?pageSize=100
  const path = req.url.replace(/^\/api/, '');
  const url = `${apiBaseUrl}${path}`;

  try {
    // Make the request to the external API
    const apiResponse = await fetch(url, {
      method: req.method, // Forward the original request method (GET, POST, etc.)
      headers: {
        // Forward relevant headers from the client request
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        ...(req.headers['x-requested-with'] && { 'X-Requested-With': req.headers['x-requested-with'] }),
        // Optionally mimic a browser User-Agent to avoid API redirects
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      redirect: 'manual', // Prevent fetch from automatically following redirects
    });

    // Check if the API response is a redirect (3xx status code)
    if (apiResponse.status >= 300 && apiResponse.status < 400) {
      const location = apiResponse.headers.get('Location');
      if (location) {
        // Log the redirect for debugging
        console.log(`Redirect detected: ${location}`);

        // Correct the redirect URL if it strips /admin-api/api/
        let correctedLocation = location;
        if (location.startsWith('http://52.207.234.21/api/')) {
          correctedLocation = location.replace(
            'http://52.207.234.21/api/',
            'http://52.207.234.21/admin-api/api/'
          );
        }

        // Instead of passing the redirect to the client, follow it manually
        const redirectResponse = await fetch(correctedLocation, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
          body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
          redirect: 'manual',
        });

        // Copy headers from the final API response
        redirectResponse.headers.forEach((value, name) => {
          res.setHeader(name, value);
        });

        // Send the final response to the client
        const data = await redirectResponse.arrayBuffer();
        res.status(redirectResponse.status).send(Buffer.from(data));
        return;
      }
    }

    // If no redirect, forward the API response to the client
    apiResponse.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });

    const data = await apiResponse.arrayBuffer();
    res.status(apiResponse.status).send(Buffer.from(data));
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
};