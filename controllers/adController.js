import AdDeal from '../models/AdDeal.js';
import AdRequest from '../models/AdRequest.js';

// --- AD DEALS (Admin) ---

export const createAdDeal = async (req, res) => {
    try {
        const deal = await AdDeal.create(req.body);
        res.status(201).json(deal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllAdDeals = async (req, res) => {
    try {
        const deals = await AdDeal.find().sort({ createdAt: -1 }).lean();
        res.status(200).json(deals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getActiveAdDeals = async (req, res) => {
    try {
        const deals = await AdDeal.find({ isActive: true }).sort({ createdAt: -1 }).lean();
        res.status(200).json(deals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAdDeal = async (req, res) => {
    try {
        const deal = await AdDeal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(deal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAdDeal = async (req, res) => {
    try {
        await AdDeal.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Ad deal deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- AD REQUESTS (Seller & Admin) ---

export const createAdRequest = async (req, res) => {
    try {
        const { title, description, startDate, dealId } = req.body;
        const sellerId = req.seller._id;

        const deal = await AdDeal.findById(dealId);
        if (!deal) return res.status(404).json({ message: "Ad deal not found" });

        let adImage = '';
        let paymentScreenshot = '';

        if (req.files) {
            if (req.files.adImage) adImage = req.files.adImage[0].path;
            if (req.files.paymentScreenshot) paymentScreenshot = req.files.paymentScreenshot[0].path;
        }

        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + deal.durationInDays);

        const newRequest = await AdRequest.create({
            seller: sellerId,
            deal: dealId,
            title,
            description,
            adImage,
            paymentScreenshot,
            startDate: start,
            endDate: end,
            amount: deal.price
        });

        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyAdRequests = async (req, res) => {
    try {
        const requests = await AdRequest.find({ seller: req.seller._id })
            .populate('deal')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllAdRequests = async (req, res) => {
    try {
        const requests = await AdRequest.find()
            .populate('seller', 'name email')
            .populate('deal')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAdRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await AdRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.status = status;
        if (status === 'approved') {
            request.isActive = true;
        } else {
            request.isActive = false;
        }

        await request.save();
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAdRequest = async (req, res) => {
    try {
        await AdRequest.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Ad request deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getActiveAdvertisements = async (req, res) => {
    try {
        const currentDate = new Date();
        const ads = await AdRequest.find({
            status: 'approved',
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        })
            .select('title adImage deal')
            .populate('deal', 'durationInDays')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(ads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


