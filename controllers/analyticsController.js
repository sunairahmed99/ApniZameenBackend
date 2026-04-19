import Analytics from '../models/Analytics.js';

export const logEvent = async (req, res) => {
    try {
        const { eventType, details } = req.body;

        if (!eventType) {
            return res.status(400).json({ message: "Event type is required" });
        }

        // Use logged-in seller ID as owner
        const ownerId = req.seller ? req.seller._id : null;

        const newEvent = new Analytics({
            eventType,
            details,
            ip: req.ip,
            SellerAgent: req.headers['user-agent'],
            Seller: ownerId
        });

        await newEvent.save();
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to log event" });
    }
};




