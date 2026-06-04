const http = require('https');

function post(url, body) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(body || {});
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });
    
    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const routes = [
    { method: 'GET', url: 'https://giftfactory-api.onrender.com/api/v1/address/list' },
    { method: 'POST', url: 'http://192.168.1.17:3000/api/v1/address' }
  ];

  for (const route of routes) {
    console.log(`Testing ${route.method} ${route.url}...`);
    try {
      let res;
      if (route.method === 'GET') {
        res = await get(route.url);
      } else {
        res = await post(route.url, {});
      }
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response:`, JSON.stringify(res.body).substring(0, 150));
    } catch (e) {
      console.error(`Error on ${route.url}:`, e.message);
    }
    console.log('---');
  }
}

main().catch(console.error);
