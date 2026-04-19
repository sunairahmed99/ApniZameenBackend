import BannerPlan from '../models/BannerPlan.js';

// Get all plans (public/seller)
export const getActivePlans = async (req, res) => {
    try {
        const plans = await BannerPlan.find({ isActive: true }).lean();
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all plans
export const getAllPlans = async (req, res) => {
    try {
        const plans = await BannerPlan.find().lean();
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Create plan
export const createPlan = async (req, res) => {
    try {
        const newPlan = new BannerPlan(req.body);
        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Update plan
export const updatePlan = async (req, res) => {
    try {
        const updatedPlan = await BannerPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedPlan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Delete plan
export const deletePlan = async (req, res) => {
    try {
        await BannerPlan.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Plan deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
