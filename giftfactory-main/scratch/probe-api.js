const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data.startsWith('{') || data.startsWith('[') ? JSON.parse(data) : data
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const baseUrl = 'http://192.168.1.17:3000';
  const res = await get(baseUrl + '/swagger-json');
  if (res.statusCode === 200) {
    const schemas = res.body.components?.schemas || {};
    console.log('RefreshTokenDto:', JSON.stringify(schemas['RefreshTokenDto'], null, 2));
  } else {
    console.log('Failed with code:', res.statusCode);
  }
}

main().catch(console.error);
