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

async function main() {
  const routes = [
    '/api/v1/customer/login-with-otp/by-email',
    '/api/v1/customer/login-with-otp/by-phone'
  ];

  for (const route of routes) {
    const url = `https://giftfactory-api.onrender.com${route}`;
    console.log(`Testing POST ${url}...`);
    try {
      const res = await post(url, {});
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response:`, JSON.stringify(res.body));
    } catch (e) {
      console.error(`Error on ${route}:`, e.message);
    }
    console.log('---');
  }
}

main().catch(console.error);
