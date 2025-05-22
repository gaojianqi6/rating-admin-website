module.exports = async (req, res) => {
  const apiBaseUrl = process.env.API_URL || 'http://52.207.234.21/admin-api/api';
  const path = req.url.replace(/^\/api/, '');
  const url = `${apiBaseUrl}${path}`;

  try {
    const apiResponse = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      redirect: 'manual',
    });

    if (apiResponse.status >= 300 && apiResponse.status < 400) {
      const location = apiResponse.headers.get('Location');
      if (location) {
        console.log(`Redirect detected: ${location}`);
        const correctedLocation = location.startsWith('http://52.207.234.21/api/')
          ? location.replace('http://52.207.234.21/api/', 'http://52.207.234.21/admin-api/api/')
          : location;
        const redirectResponse = await fetch(correctedLocation, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
          body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
          redirect: 'manual',
        });

        redirectResponse.headers.forEach((value, name) => {
          res.setHeader(name, value);
        });

        const data = await redirectResponse.arrayBuffer();
        res.status(redirectResponse.status).send(Buffer.from(data));
        return;
      }
    }

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