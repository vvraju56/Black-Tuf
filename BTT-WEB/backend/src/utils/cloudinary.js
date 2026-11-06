import { v2 as cloudinary } from 'cloudinary';
import { env, cloudinaryConfigured } from '../config/env.js';
import { ApiError } from './ApiError.js';

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

function assertConfigured() {
  if (!cloudinaryConfigured) {
    throw new ApiError(
      503,
      'Image storage is not configured. Add Cloudinary credentials to the API environment.'
    );
  }
}

/**
 * Upload an in-memory file buffer to Cloudinary.
 * Images are optimised on delivery; raw files are stored as-is.
 */
export function uploadBuffer(buffer, { folder = 'blacktuf', resourceType = 'image' } = {}) {
  assertConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        overwrite: false,
        unique_filename: true,
        transformation:
          resourceType === 'image'
            ? [{ quality: 'auto', fetch_format: 'auto' }]
            : undefined,
      },
      (error, result) => {
        if (error || !result) {
          reject(new ApiError(502, 'File upload failed. Please try again.'));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
}
