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
  console.log("Testing pagination and sorting params...");
  const res = await get('https://giftfactory-api.onrender.com/api/v1/web/products?page=1&limit=5&sortBy=createdAt&order=desc');
  console.log("Status:", res.statusCode);
  if (res.statusCode !== 200) {
    console.log("Error details:", JSON.stringify(res.body, null, 2));
  } else {
    console.log("Success! Returned", res.body?.data?.length, "products.");
  }
}

main().catch(console.error);
