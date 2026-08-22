const http = require('http');
const qs = require('querystring');

const base = 'http://127.0.0.1:5000';
let cookies = [];
const req = (m, path, body) => new Promise((resolve) => {
  const data = body ? JSON.stringify(body) : null;
  const headers = { 'Content-Type': 'application/json' };
  if (cookies.length) headers.Cookie = cookies.join('; ');
  const r = http.request({ method: m, hostname: '127.0.0.1', port: 5000, path, headers }, (res) => {
    let d = ''; res.on('data', (c) => (d += c));
    res.on('end', () => {
      if (res.headers['set-cookie']) cookies = res.headers['set-cookie'].map((c) => c.split(';')[0]);
      resolve({ status: res.statusCode, body: d });
    });
  });
  r.on('error', (e) => resolve({ status: 'ERR', body: e.message }));
  if (data) r.write(data);
  r.end();
});

(async () => {
  console.log('health:', (await req('GET', '/health')).body.slice(0, 60));
  const reg = await req('POST', '/api/auth/register', { name: 'Black Tuf User', email: 'black-tuf-' + Date.now() + '@test.com', password: 'pass1234' });
  console.log('register:', reg.status);
  const login = await req('POST', '/api/auth/login', { email: JSON.parse(reg.body).data?.user?.email || 'black-tuf@test.com', password: 'pass1234' });
  console.log('login:', login.status, 'cookie set:', !!cookies.find((c) => c.startsWith('accessToken')));
  // wishlist (needs auth) - add a product by slug
  const prods = JSON.parse((await req('GET', '/api/products?limit=1')).body);
  const pid = prods.data.products[0]._id;
  const w = await req('POST', '/api/marketplace/wishlist/' + pid);
  console.log('wishlist add:', w.status);
  const wl = await req('GET', '/api/marketplace/wishlist');
  console.log('wishlist get:', wl.status, 'count:', JSON.parse(wl.body).data?.products?.length);
  const del = await req('DELETE', '/api/marketplace/wishlist/' + pid);
  console.log('wishlist remove:', del.status);
  // profile (verify token works)
  const me = await req('GET', '/api/auth/me');
  console.log('me:', me.status, 'role:', JSON.parse(me.body).data?.user?.role);
})();
