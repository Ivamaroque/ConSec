const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7284';

console.log('Proxy target:', target);

const PROXY_CONFIG = [
  {
    context: [
      "/weatherforecast",
      "/api"
   ],
    proxyTimeout: 10000,
    target: target,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    headers: {
      Connection: 'Keep-Alive'
    }
  }
]

module.exports = PROXY_CONFIG;
