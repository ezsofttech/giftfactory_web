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
  const res = await get(baseUrl + '/api-json'); // Swagger specs are usually at /api-json or /swagger-json
  let spec = null;
  if (res.statusCode === 200) {
    spec = res.body;
  } else {
    // Try swagger-json
    const res2 = await get(baseUrl + '/swagger-json');
    if (res2.statusCode === 200) {
      spec = res2.body;
    }
  }

  if (!spec) {
    console.log('Failed to fetch swagger spec from /api-json or /swagger-json');
    return;
  }

  console.log('Paths available containing elastic-search:');
  const paths = Object.keys(spec.paths).filter(p => p.includes('elastic-search'));
  for (const p of paths) {
    console.log(`\nPath: ${p}`);
    console.log(JSON.stringify(spec.paths[p], null, 2));
  }
}

main().catch(console.error);
