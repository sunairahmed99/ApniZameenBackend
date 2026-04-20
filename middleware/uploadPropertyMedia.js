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

// Configure Multer for Cloudinary with Video Support
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'zameen_clone_properties',
        resource_type: 'auto', // CRITICAL: This allows videos, images, and other files
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mkv', 'mov', 'avi'],
        // Note: transformation is generally for images. Cloudinary handles video differently.
        // We keep it empty or minimal for 'auto' resource types to avoid errors with videos.
    },
});

const uploadPropertyMedia = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit for high-quality property videos
    }
});

export default uploadPropertyMedia;
