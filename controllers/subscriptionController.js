import SubscriptionRequest from '../models/SubscriptionRequest.js';
import Deal from '../models/Deal.js';
import Seller from '../models/Seller.js';

// Create a request
export const createSubscriptionRequest = async (req, res) => {
    try {
        const { sellerId, dealId } = req.body;
        const paymentScreenshot = req.file ? req.file.path : null;

        if (!paymentScreenshot) return res.status(400).json({ message: "Payment screenshot is required" });

        const request = new SubscriptionRequest({ sellerId, dealId, paymentScreenshot });
        await request.save();
        res.status(201).json(request);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get requests (filter by status optional)
export const getSubscriptionRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;

        const requests = await SubscriptionRequest.find(query)
            .populate('sellerId', 'name email')
            .populate('dealId', 'name price propertyLimit')
            .lean();

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approve/Reject Request
export const updateSubscriptionStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const request = await SubscriptionRequest.findById(req.params.id).populate('dealId');

        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (status === 'approved') {
            const deal = request.dealId;

            if (!deal) {
                return res.status(400).json({ message: 'The deal/package for this request no longer exists. Cannot approve.' });
            }

            const expiry = new Date();
            expiry.setDate(expiry.getDate() + (deal.durationDays || 30));

            // Initialize Per-Package Quota
            request.quotaRemaining = deal.propertyLimit || 0;
            request.expiryDate = expiry;

            // Quota is tracked on the SubscriptionRequest itself (quotaRemaining field)
            // No need to update Seller document
        }

        request.status = status;
        if (rejectionReason) request.rejectionReason = rejectionReason;
        if (rejectionReason) request.rejectionReason = rejectionReason;
        await request.save();

        res.status(200).json(request);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a request
export const deleteSubscriptionRequest = async (req, res) => {
    try {
        await SubscriptionRequest.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Request deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get approved and active subscriptions for a specific seller
export const getSellerSubscriptions = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const subscriptions = await SubscriptionRequest.find({
            sellerId,
            status: 'approved',
            quotaRemaining: { $gt: 0 }
        }).populate('dealId').lean();

        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

