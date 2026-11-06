import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const memory = multer.memoryStorage();

const imageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
]);

function imageFilter(_req, file, cb) {
  if (!imageMimeTypes.has(file.mimetype)) {
    cb(new ApiError(415, 'Only JPEG, PNG, WebP, AVIF, GIF, or SVG images are allowed.'));
    return;
  }
  cb(null, true);
}

const attachmentMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
]);

function attachmentFilter(_req, file, cb) {
  if (!attachmentMimeTypes.has(file.mimetype)) {
    cb(new ApiError(415, 'Unsupported attachment type. Use an image, PDF, DOCX, TXT, or ZIP.'));
    return;
  }
  cb(null, true);
}

export const uploadImage = multer({
  storage: memory,
  limits: { fileSize: 6 * 1024 * 1024, files: 1 },
  fileFilter: imageFilter,
});

export const uploadAttachment = multer({
  storage: memory,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: attachmentFilter,
});
