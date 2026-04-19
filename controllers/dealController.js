import Deal from '../models/Deal.js';

// Create a new deal
export const createDeal = async (req, res) => {
    try {

        const deal = new Deal(req.body);
        await deal.save();

        res.status(201).json(deal);
    } catch (error) {

        res.status(400).json({ message: error.message, errors: error.errors });
    }
};

// Get all deals (Admin sees all, public sees active)
export const getDeals = async (req, res) => {
    try {
        // Simple filter: if query has role=admin show all, else active
        // But for now let's just return all and filter on frontend or active only for sellers
        const { role } = req.query;
        let query = {};
        if (role !== 'admin') {
            query.isActive = true;
        }
        const deals = await Deal.find(query);
        res.status(200).json(deals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a deal
export const updateDeal = async (req, res) => {
    try {
        const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(deal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a deal
export const deleteDeal = async (req, res) => {
    try {
        await Deal.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deal deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
