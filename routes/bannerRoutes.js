import express from "express";
import multer from 'multer';
import { createCloudinaryStorage } from "../middleware/imageUploadMiddleware.js";
import {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
import cacheMiddleware from '../middleware/cacheMiddleware.js';

const bannerrouter = express.Router();

// Create multer instance for banners
const bannerStorage = createCloudinaryStorage('zameen_banners');
const uploadBanner = multer({
  storage: bannerStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB (increased limit)
  fileFilter: (req, file, cb) => {
    // Allow all file types for now (remove restriction)
    cb(null, true);
  }
});

bannerrouter
  .route("/")
  .get(cacheMiddleware(600), getBanners)
  .post(uploadBanner.single('image'), createBanner);

bannerrouter
  .route("/:id")
  .get(getBannerById)
  .put(uploadBanner.single('image'), updateBanner)
  .delete(deleteBanner);

export default bannerrouter;
