import { getFirestore } from '../config/firebase.js';

/**
 * Lightweight change events published to Firestore for real-time UI updates.
 * MongoDB remains the source of truth; Firestore only carries notification events.
 */

const COLLECTION = 'events';

async function publishEvent(type, payload, attempt = 0) {
  const db = getFirestore();
  if (!db) return; // Firebase not configured; skip silently.

  try {
    await db.collection(COLLECTION).add({
      type,
      payload,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    if (attempt < 3) {
      const delay = 200 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return publishEvent(type, payload, attempt + 1);
    }
    console.error('[firestore] Failed to publish event after retries:', type, error?.message || error);
    // Outbox fallback: persist to MongoDB for later replay.
    try {
      const { EventOutbox } = await import('../models/EventOutbox.js');
      await EventOutbox.create({ type, payload, status: 'pending', attempts: attempt });
    } catch {
      // Model may not exist; ignore.
    }
  }
}

export async function publishProductEvent(action, product) {
  return publishEvent('product', {
    action, // created | updated | published | deleted
    id: String(product?._id || product?.id || ''),
    slug: product?.slug || '',
    status: product?.status || '',
    name: product?.name || '',
  });
}

export async function publishSupportEvent(action, ticket) {
  return publishEvent('support', {
    action,
    id: String(ticket?._id || ticket?.id || ''),
    status: ticket?.status || '',
  });
}

export async function publishMessageEvent(action, message) {
  return publishEvent('message', {
    action,
    id: String(message?._id || message?.id || ''),
    status: message?.status || '',
  });
}