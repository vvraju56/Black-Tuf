import { getFirebaseStorage } from '../config/firebase.js';
import { ApiError } from './ApiError.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function uploadToFirebaseStorage(file, folder = 'products') {
  const storage = getFirebaseStorage();
  if (!storage) throw new ApiError(503, 'Firebase Storage is not configured.');

  if (!file) throw new ApiError(400, 'No file provided.');
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new ApiError(422, 'Unsupported file type. Use JPEG, PNG, WebP, or GIF.');
  }
  if (file.size > MAX_SIZE) {
    throw new ApiError(422, 'File too large. Maximum size is 5 MB.');
  }

  const bucket = storage.bucket();
  const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const path = `${folder}/${safeName}`;
  const blob = bucket.file(path);

  await blob.save(file.buffer, {
    metadata: { contentType: file.mimetype },
    resumable: false,
  });

  await blob.makePublic();
  return {
    url: `https://storage.googleapis.com/${bucket.name}/${path}`,
    path,
    contentType: file.mimetype,
    size: file.size,
  };
}

export async function deleteFromFirebaseStorage(path) {
  const storage = getFirebaseStorage();
  if (!storage || !path) return;
  try {
    await storage.bucket().file(path).delete();
  } catch {
    // Ignore missing files.
  }
}