import express from "express";
import multer from 'multer';
import { createCloudinaryStorage } from "../middleware/imageUploadMiddleware.js";
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    getBlogBySlug,
    updateBlog,
    deleteBlog
} from "../controllers/blogController.js";

const blogRouter = express.Router();

// Setup Cloudinary storage for blogs
const blogStorage = createCloudinaryStorage('zameen_blogs');
const uploadBlog = multer({ storage: blogStorage });

blogRouter.get('/', getAllBlogs);
blogRouter.get("/slug/:slug", getBlogBySlug);

blogRouter
    .route("/")
    .post(uploadBlog.single('thumbnail'), createBlog);

blogRouter
    .route("/:id")
    .get(getBlogById)
    .put(uploadBlog.single('thumbnail'), updateBlog)
    .delete(deleteBlog);

export default blogRouter;
