import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if credentials exist in env
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️ Cloudinary storage initialized.');
} else {
  console.log('📁 Local directory storage initialized.');
}

/**
 * Uploads a file buffer to Cloudinary or falls back to local uploads folder
 * @param fileBuffer The file buffer from multer memoryStorage
 * @param originalName The original file name to resolve extensions
 * @param folder The folder name to upload/save into
 * @returns The public URL path to store in the database
 */
export const uploadFile = async (
  fileBuffer: Buffer,
  originalName: string,
  folder: string = 'uploads'
): Promise<string> => {
  if (useCloudinary) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `kids-shop/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return reject(new Error('Cloudinary upload failed'));
          }
          resolve(result!.secure_url);
        }
      );
      uploadStream.end(fileBuffer);
    });
  } else {
    // Local fallback
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${folder}-${uniqueSuffix}${path.extname(originalName)}`;
    const filePath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filePath, fileBuffer);
    return `/uploads/${filename}`;
  }
};
