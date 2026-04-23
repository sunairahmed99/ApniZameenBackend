import express from "express";
import multer from 'multer';
import { createCloudinaryStorage } from "../middleware/imageUploadMiddleware.js";
import cacheMiddleware from '../middleware/cacheMiddleware.js';
import {
  createProject,
  getAllProjects,
  getProjectById,
  getProjectBySlug,
  updateProject,
  deleteProject
} from "../controllers/projectController.js";

const projectRouter = express.Router();

projectRouter.get('/', cacheMiddleware(300), getAllProjects);
projectRouter.get("/slug/:slug", getProjectBySlug);

// Create multer instance for projects
const projectStorage = createCloudinaryStorage('zameen_projects');
const uploadProject = multer({
  storage: projectStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB (increased limit)
  fileFilter: (req, file, cb) => {
    // Allow all file types for now (remove restriction)
    cb(null, true);
  }
});

// Fields for project uploads
const projectFields = [
  { name: 'thumbnail', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
  { name: 'developerLogo', maxCount: 1 },
  { name: 'marketedByLogo', maxCount: 1 },
  { name: 'projectFloorPlans', maxCount: 10 },
  { name: 'projectPaymentPlans', maxCount: 5 },
  { name: 'updateImages', maxCount: 10 },
  { name: 'unitFloorPlans', maxCount: 20 }
];

projectRouter
  .route("/")
  .get(getAllProjects)
  .post(uploadProject.fields(projectFields), createProject);

projectRouter
  .route("/:id")
  .get(getProjectById)
  .put(uploadProject.fields(projectFields), updateProject)
  .delete(deleteProject);

export default projectRouter;
