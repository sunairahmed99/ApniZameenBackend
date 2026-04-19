import FeaturedPlan from '../models/FeaturedPlan.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new plan
// @route   POST /api/plans
// @access  Private (Admin)
const createPlan = asyncHandler(async (req, res) => {
    const { name, price, durationInDays, description } = req.body;

    const plan = await FeaturedPlan.create({
        name,
        price,
        durationInDays,
        description
    });

    res.status(201).json(plan);
});

// @desc    Get all active plans
// @route   GET /api/plans
// @access  Public
const getPlans = asyncHandler(async (req, res) => {
    const plans = await FeaturedPlan.find({ isActive: true });
    res.json(plans);
});

// @desc    Get all plans (Admin)
// @route   GET /api/plans/admin
// @access  Private (Admin)
const getAllPlansAdmin = asyncHandler(async (req, res) => {
    const plans = await FeaturedPlan.find({});
    res.json(plans);
});

// @desc    Update plan
// @route   PUT /api/plans/:id
// @access  Private (Admin)
const updatePlan = asyncHandler(async (req, res) => {
    const plan = await FeaturedPlan.findById(req.params.id);

    if (plan) {
        plan.name = req.body.name || plan.name;
        plan.price = req.body.price || plan.price;
        plan.durationInDays = req.body.durationInDays || plan.durationInDays;
        plan.description = req.body.description || plan.description;
        plan.isActive = req.body.isActive !== undefined ? req.body.isActive : plan.isActive;

        const updatedPlan = await plan.save();
        res.json(updatedPlan);
    } else {
        res.status(404);
        throw new Error('Plan not found');
    }
});

// @desc    Delete plan
// @route   DELETE /api/plans/:id
// @access  Private (Admin)
const deletePlan = asyncHandler(async (req, res) => { // Soft delete usually better, but let's do hard or toggle active
    const plan = await FeaturedPlan.findById(req.params.id);
    if (plan) {
        await FeaturedPlan.deleteOne({ _id: req.params.id });
        res.json({ message: 'Plan removed' });
    } else {
        res.status(404);
        throw new Error('Plan not found');
    }
});

export {
    createPlan,
    getPlans,
    getAllPlansAdmin,
    updatePlan,
    deletePlan
};
