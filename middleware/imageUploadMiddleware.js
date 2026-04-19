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

// Generic Cloudinary storage configuration
export const createCloudinaryStorage = (folder = 'general_uploads', allowedFormats = ['jpg', 'png', 'jpeg', 'webp', 'svg', 'gif', 'bmp', 'tiff', 'pdf', 'doc', 'docx', 'txt']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: allowedFormats,
      // Remove transformation to keep original file sizes
      resource_type: 'auto' // Allow any file type
    },
  });
};

// Generic multer upload middleware factory
export const createUploadMiddleware = (fieldName, folder = 'general_uploads', maxFiles = 1) => {
  const storage = createCloudinaryStorage(folder);

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: maxFiles
    },
    fileFilter: (req, file, cb) => {
      // Check if file is an image
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  });

  return upload.single(fieldName);
};

// Pre-configured middleware for common use cases
export const uploadProjectImage = createUploadMiddleware('thumbnail', 'zameen_projects');
export const uploadAgencyLogo = createUploadMiddleware('logo', 'zameen_agencies');
export const uploadBannerImage = createUploadMiddleware('image', 'zameen_banners');
export const uploadGeneralImage = createUploadMiddleware('image', 'general_uploads');

// Multiple file upload middleware
export const createMultipleUploadMiddleware = (fieldName, folder = 'general_uploads', maxFiles = 5) => {
  const storage = createCloudinaryStorage(folder);

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB per file
      files: maxFiles
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  });

  return upload.array(fieldName, maxFiles);
};

// Error handling middleware for multer
export const handleMulterError = (req, res, next) => {
  // This middleware runs after multer and checks for errors
  if (req.fileValidationError) {
    return res.status(400).json({ message: req.fileValidationError });
  }

  // If there's a multer error from the previous middleware
  if (req.multerError) {
    return res.status(400).json({ message: req.multerError });
  }

  next();
};

export default {
  createUploadMiddleware,
  createMultipleUploadMiddleware,
  uploadProjectImage,
  uploadAgencyLogo,
  uploadBannerImage,
  uploadGeneralImage,
  handleMulterError
};
