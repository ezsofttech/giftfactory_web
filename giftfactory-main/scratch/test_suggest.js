const http = require('https');

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
  const query = 'mouse';
  console.log(`Fetching suggestions for '${query}'...`);
  const res = await get(`https://giftfactory-api.onrender.com/api/v1/web/products/suggest?query=${encodeURIComponent(query)}`);
  console.log("Suggestions status code:", res.statusCode);
  console.log("Suggestions response body:", JSON.stringify(res.body, null, 2));
}

main().catch(console.error);
