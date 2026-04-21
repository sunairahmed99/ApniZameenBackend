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

// Configure Multer for Cloudinary with Dynamic Resource Typing
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith('video/');
        return {
            folder: 'zameen_clone_properties',
            resource_type: isVideo ? 'video' : 'image',
            allowed_formats: isVideo 
                ? ['mp4', 'mkv', 'mov', 'avi'] 
                : ['jpg', 'png', 'jpeg', 'webp'],
            chunk_size: isVideo ? 6000000 : undefined, // ~6MB chunks for videos
            // Set public_id to preserve filenames or add unique suffix
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        };
    },
});

const uploadPropertyMedia = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit for high-quality property videos
    }
});

export default uploadPropertyMedia;
