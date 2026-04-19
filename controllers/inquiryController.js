import Inquiry from '../models/Inquiry.js';

export const createInquiry = async (req, res) => {
    try {
        const { projectId, propertyId, sellerId, name, phone, email, message } = req.body;
        const newInquiry = new Inquiry({ projectId, propertyId, sellerId, name, phone, email, message });
        await newInquiry.save();
        res.status(201).json(newInquiry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find().populate('projectId', 'name').sort({ date: -1 }).lean();
        res.status(200).json(inquiries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getInquiriesForSeller = async (req, res) => {
    try {
        const sellerId = req.seller._id;
        const inquiries = await Inquiry.find({ sellerId })
            .populate('propertyId', 'title')
            .sort({ date: -1 })
            .lean(); // Assuming 'date' or 'createdAt' exists
        res.status(200).json(inquiries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


