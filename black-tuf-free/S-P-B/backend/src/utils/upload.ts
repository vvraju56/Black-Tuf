import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import upload from 'multer';
import { Readable } from 'stream';
import config from '../config/index';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

export interface UploadResult {
  url: string;
  publicId: string;
  secure_url?: string;
}

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder = 'blacktuf'
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = Readable.from(file.buffer);
    stream.on('error', (err) => reject(err));

    const uploadOptions = {
      folder,
      resource_type: 'image' as const,
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));
        resolve({
          url: result.secure_url || result.url,
          publicId: result.public_id,
          secure_url: result.secure_url
        });
      }
    );
    stream.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
};

export const generateOrderNumber = (prefix = 'ORD'): string => {
  const date = new Date();
  const dateStr =
    date.getFullYear().toString().slice(2) +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${dateStr}${random}`;
};

export const calculatePagination = (page: number, limit: number, count: number) => {
  const totalPages = Math.ceil(count / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  return { page, totalPages, total: count, hasNext, hasPrev, limit };
};

const storage = upload.memoryStorage();

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: upload.FileFilterCallback) => {
  if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
    cb(null, true);
  } else {
    (cb as any)(new Error('Only image and video files are allowed!'), false);
  }
};

export const uploadMiddleware = upload({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

export const uploadSingle = uploadMiddleware.single('file');
export const uploadMulti = uploadMiddleware.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 },
  { name: 'documents', maxCount: 5 }
]);


