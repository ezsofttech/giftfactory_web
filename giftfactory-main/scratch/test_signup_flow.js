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
  const email = 'xdspidy2022@gmail.com';
  console.log(`Sending login OTP to: ${email}...`);
  const res = await post('https://giftfactory-api.onrender.com/api/v1/customer/send-otp-login', {
    email,
    mode: 'email'
  });
  console.log("Status code:", res.statusCode);
  console.log("Response body:", JSON.stringify(res.body, null, 2));
}

main().catch(console.error);
