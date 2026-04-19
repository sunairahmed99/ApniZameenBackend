import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'zameen_clone_banners',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'svg'],
    transformation: [
      { width: 1920, height: 600, crop: 'limit' }, // Limit max size for banners
      { quality: 'auto:good' }, // Auto optimize quality
      { fetch_format: 'auto' } // Auto format conversion
    ]
  },
});

const upload = multer({ storage: storage });

export default upload;
