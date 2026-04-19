import ProjectRequest from '../models/ProjectRequest.js';
import ProjectPlan from '../models/ProjectPlan.js';

// Create a new project request
export const createProjectRequest = async (req, res) => {
    try {
        const { planId, projectName } = req.body;
        const sellerId = req.seller._id; 
        const paymentScreenshot = req.file ? req.file.path : null;

        if (!paymentScreenshot) {
            return res.status(400).json({ message: "Payment screenshot is required" });
        }

        const newRequest = new ProjectRequest({
            sellerId,
            planId,
            projectName,
            paymentScreenshot
        });

        await newRequest.save();
        res.status(201).json({ message: "Project request submitted successfully", request: newRequest });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get requests for the logged-in seller
export const getMyProjectRequests = async (req, res) => {
    try {
        const sellerId = req.seller._id;
        const requests = await ProjectRequest.find({ sellerId })
            .populate('planId')
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all requests (Admin)
export const getAllProjectRequests = async (req, res) => {
    try {
        const requests = await ProjectRequest.find()
            .populate('sellerId', 'name email')
            .populate('planId')
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update request status (Admin)
export const updateProjectRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        const updatedRequest = await ProjectRequest.findByIdAndUpdate(
            id,
            { status, rejectionReason },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.status(200).json({ message: `Request ${status} successfully`, request: updatedRequest });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a request
export const deleteProjectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        await ProjectRequest.findByIdAndDelete(id);
        res.status(200).json({ message: "Project request deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


