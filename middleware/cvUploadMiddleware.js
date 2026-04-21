import multer from 'multer';
import { createCloudinaryStorage } from './imageUploadMiddleware.js';

// Multer upload middleware for CVs
// Allows PDF, DOC, DOCX, TXT
export const uploadCV = (fieldName = 'cv') => {
  const storage = createCloudinaryStorage('zameen_cvs', ['pdf', 'doc', 'docx', 'txt']);

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit for CVs
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type! Only PDF, DOC, DOCX, and TXT are allowed.'), false);
      }
    }
  });

  return upload.single(fieldName);
};

export default uploadCV;
