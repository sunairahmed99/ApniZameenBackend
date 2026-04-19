import express from 'express';
import {
    createProjectPlan,
    getProjectPlans,
    getAllProjectPlansAdmin,
    updateProjectPlan,
    deleteProjectPlan
} from '../controllers/projectPlanController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/all') // For admin to see all including inactive
    .get(getAllProjectPlansAdmin);

router.route('/')
    .get(getProjectPlans)
    .post(createProjectPlan);
// .post(protect, admin, createProjectPlan);

router.route('/:id')
    .put(updateProjectPlan)
    // .put(protect, admin, updateProjectPlan)
    .delete(deleteProjectPlan);
// .delete(protect, admin, deleteProjectPlan);

export default router;
