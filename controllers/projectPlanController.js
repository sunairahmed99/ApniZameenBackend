import ProjectPlan from '../models/ProjectPlan.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new project plan
// @route   POST /api/project-plans
// @access  Private (Admin)
const createProjectPlan = asyncHandler(async (req, res) => {
    const { name, price, durationInDays, description, features } = req.body;

    const plan = await ProjectPlan.create({
        name,
        price,
        durationInDays,
        description,
        features
    });

    res.status(201).json(plan);
});

// @desc    Get all active project plans
// @route   GET /api/project-plans
// @access  Public
const getProjectPlans = asyncHandler(async (req, res) => {
    const plans = await ProjectPlan.find({ isActive: true });
    res.json(plans);
});

// @desc    Get all project plans (Admin)
// @route   GET /api/project-plans/admin
// @access  Private (Admin)
const getAllProjectPlansAdmin = asyncHandler(async (req, res) => {
    const plans = await ProjectPlan.find({});
    res.json(plans);
});

// @desc    Update project plan
// @route   PUT /api/project-plans/:id
// @access  Private (Admin)
const updateProjectPlan = asyncHandler(async (req, res) => {
    const plan = await ProjectPlan.findById(req.params.id);

    if (plan) {
        plan.name = req.body.name || plan.name;
        plan.price = req.body.price || plan.price;
        plan.durationInDays = req.body.durationInDays || plan.durationInDays;
        plan.description = req.body.description || plan.description;
        plan.features = req.body.features || plan.features;
        plan.isActive = req.body.isActive !== undefined ? req.body.isActive : plan.isActive;

        const updatedPlan = await plan.save();
        res.json(updatedPlan);
    } else {
        res.status(404);
        throw new Error('Project Plan not found');
    }
});

// @desc    Delete project plan
// @route   DELETE /api/project-plans/:id
// @access  Private (Admin)
const deleteProjectPlan = asyncHandler(async (req, res) => {
    const plan = await ProjectPlan.findById(req.params.id);
    if (plan) {
        await ProjectPlan.deleteOne({ _id: req.params.id });
        res.json({ message: 'Project Plan removed' });
    } else {
        res.status(404);
        throw new Error('Project Plan not found');
    }
});

export {
    createProjectPlan,
    getProjectPlans,
    getAllProjectPlansAdmin,
    updateProjectPlan,
    deleteProjectPlan
};
