import { createApp } from '../src/app.js';
import { connectDatabase } from '../src/config/db.js';

let cachedApp = null;
let dbPromise = null;

async function getApp() {
  if (cachedApp) return cachedApp;
  if (!dbPromise) {
    dbPromise = connectDatabase().catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  await dbPromise;
  cachedApp = createApp();
  return cachedApp;
}

export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('[api] Failed to handle request:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'Internal server error.' }));
  }
}