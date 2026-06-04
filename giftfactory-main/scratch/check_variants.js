const http = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const productId = 'cmpqu8syt000a97fp9xkxjbvr';
  const res = await get(`https://giftfactory-api.onrender.com/api/v1/web/products/${productId}`);
  const product = res.data || res;
  console.log("Variants found:", product.variants || product.variantIds);
}

main().catch(console.error);
