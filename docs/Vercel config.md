### Using vercel.json rewrites to proxy all API
```JSON
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://52.207.234.21/admin-api/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Using vercel proxy.js to proxy API
```JSON
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/proxy.js",
      "use": "@vercel/node"
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/proxy"
    },
    {
      "source": "/api/:path*/",
      "destination": "/api/proxy"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```