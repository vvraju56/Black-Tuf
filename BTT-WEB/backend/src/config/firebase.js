import admin from 'firebase-admin';
import { env } from './env.js';

let firebaseApp = null;
let firestore = null;
let storage = null;
let messaging = null;

function initFirebaseAdmin() {
  if (firebaseApp) return firebaseApp;

  const projectId = process.env.FIREBASE_PROJECT_ID || env.firebaseProjectId;
  if (!projectId) {
    console.warn('[firebase] FIREBASE_PROJECT_ID not set; Firebase Admin disabled.');
    return null;
  }

  try {
    // Prefer Application Default Credentials (service identity / Secret Manager).
    // Fall back to explicit service account JSON via FIREBASE_SERVICE_ACCOUNT_JSON.
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }
    firestore = admin.firestore();
    storage = admin.storage();
    messaging = admin.messaging();
    console.log('[firebase] Firebase Admin initialized.');
  } catch (error) {
    console.warn('[firebase] Failed to initialize Firebase Admin:', error?.message || error);
    firebaseApp = null;
  }
  return firebaseApp;
}

export function getFirebaseAdmin() {
  return firebaseApp || initFirebaseAdmin();
}

export function getFirestore() {
  if (!firebaseApp) initFirebaseAdmin();
  return firestore;
}

export function getFirebaseStorage() {
  if (!firebaseApp) initFirebaseAdmin();
  return storage;
}

export function getFirebaseMessaging() {
  if (!firebaseApp) initFirebaseAdmin();
  return messaging;
}

export const firebaseConfigured = Boolean(process.env.FIREBASE_PROJECT_ID);