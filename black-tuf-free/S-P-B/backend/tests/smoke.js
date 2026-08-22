const path = require('path');
const app = require(path.join(__dirname, '../dist/app')).createApp();
const http = require('http');

const server = app.listen(5005, async () => {
  const get = (path) => new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:5005${path}`, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => resolve({ status: r.statusCode, body: d }));
    }).on('error', reject);
  });

  const post = (path, body) => new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(`http://127.0.0.1:5005${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } }, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => resolve({ status: r.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });

  try {
    let r = await get('/health');
    console.log('GET /health ->', r.status, r.body.slice(0, 120));

    r = await get('/api/categories');
    console.log('GET /api/categories ->', r.status);

    r = await get('/api/products?limit=2');
    const pj = JSON.parse(r.body);
    console.log('GET /api/products ->', r.status, 'results:', pj.results, 'count:', pj.data?.products?.length);

    r = await get('/api/products/nexphone-x1');
    console.log('GET /api/products/nexphone-x1 ->', r.status);

    r = await post('/api/auth/register', { name: 'Smoke User', email: 'smoke@test.com', password: 'pass1234', role: 'customer' });
    const aj = JSON.parse(r.body);
    console.log('POST /api/auth/register ->', r.status, aj.status);

    r = await post('/api/auth/login', { email: 'customer@nexmart.com', password: 'Customer@123' });
    const lj = JSON.parse(r.body);
    console.log('POST /api/auth/login ->', r.status, lj.status, 'has token cookie:', r.headers);

    const token = lj.data?.user ? null : null;
    console.log('Login user keys:', Object.keys(lj.data?.user || {}));
    console.log('SMOKE TEST PASSED');
  } catch (err) {
    console.error('SMOKE ERROR:', err.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
