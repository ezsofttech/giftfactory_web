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
  const paths = [
    '/api/v1/customer/login-with-otp',
    '/api/v1/customer/otp-verification',
    '/api/v1/customer/verify-otp',
    '/api/v1/customer/login-otp',
    '/api/v1/customer/verify-otp-login',
    '/api/v1/customer/otp-login',
    '/api/v1/customer/login/otp',
    '/api/v1/customer/email/login-with-otp',
    '/api/v1/customer/email/otp-verification',
    '/api/v1/customer/email/verify-otp',
    '/api/v1/customer/email/registration'
  ];

  for (const path of paths) {
    const url = `https://giftfactory-api.onrender.com${path}`;
    const res = await post(url, { email: 'test@example.com', otp: '123456' });
    console.log(`POST ${path} -> Status ${res.statusCode}, Body: ${JSON.stringify(res.body).substring(0, 150)}`);
  }
}

main().catch(console.error);
