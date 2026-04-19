import PaymentImage from '../models/PaymentImage.js';
import PaymentEntry from '../models/PaymentEntry.js';

// @desc    Upload Payment Proof Image
// @route   POST /api/payments/upload
// @access  Private (Seller/Seller)
export const uploadPaymentProof = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const seller = req.seller; 

        const { category } = req.body;

        const paymentImage = new PaymentImage({
            seller: seller._id,
            imageUrl: req.file.path || req.file.location, // Depends on Multer storage (Cloudinary uses location/path)
            category: category || 'other',
            status: 'pending'
        });

        await paymentImage.save();

        res.status(201).json({
            message: 'Payment proof uploaded successfully',
            paymentImage
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pending payment images
// @route   GET /api/payments/pending
// @access  Private (Admin)
export const getPendingPayments = async (req, res) => {
    try {
        const { category } = req.query;

        const query = { status: 'pending' };
        if (category) {
            query.category = category;
        }

        const pendingPayments = await PaymentImage.find(query)
            .populate('seller', 'name email') // Populate seller details
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(pendingPayments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Review Payment (Approve/Reject)
// @route   POST /api/payments/review
// @access  Private (Admin)
export const reviewPayment = async (req, res) => {
    try {
        const { paymentImageId, status, amount, notes } = req.body;

        if (!paymentImageId || !status) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const paymentImage = await PaymentImage.findById(paymentImageId);
        if (!paymentImage) {
            return res.status(404).json({ message: 'Payment proof not found' });
        }

        paymentImage.status = status;
        await paymentImage.save();

        if (status === 'approved') {
            // Create a PaymentEntry for visibility / record keeping
            const paymentEntry = new PaymentEntry({
                paymentImage: paymentImage._id,
                paymentType: paymentImage.category,
                amount: amount || 0,
                approvedBy: req.seller._id, // Assumes Admin seller in req.seller
                notes: notes || ''
            });

            await paymentEntry.save();
            await paymentImage.save();

            res.status(200).json({ message: 'Payment rejected', paymentImage });
        } else {
            res.status(400).json({ message: 'Invalid action' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



