import PaymentPrice from '../models/PaymentPrice.js';

// @desc    Get all payment prices
// @route   GET /api/payment-prices
// @access  Public
export const getPaymentPrices = async (req, res) => {
    try {
        const prices = await PaymentPrice.find().lean();
        res.json(prices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a payment price
// @route   POST /api/payment-prices
// @access  Private/Admin
export const createPaymentPrice = async (req, res) => {
    const { paymentType, price, description, date } = req.body;

    try {
        const newPrice = new PaymentPrice({
            paymentType,
            price,
            description,
            date: date || new Date()
        });

        const savedPrice = await newPrice.save();
        res.status(201).json(savedPrice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a payment price
// @route   PUT /api/payment-prices/:id
// @access  Private/Admin
export const updatePaymentPrice = async (req, res) => {
    const { paymentType, price, description, date } = req.body;

    try {
        const paymentPrice = await PaymentPrice.findById(req.params.id);

        if (paymentPrice) {
            paymentPrice.paymentType = paymentType || paymentPrice.paymentType;
            paymentPrice.price = price !== undefined ? price : paymentPrice.price;
            paymentPrice.description = description || paymentPrice.description;
            paymentPrice.date = date || paymentPrice.date;

            const updatedPrice = await paymentPrice.save();
            res.json(updatedPrice);
        } else {
            res.status(404).json({ message: 'Payment price not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a payment price
// @route   DELETE /api/payment-prices/:id
// @access  Private/Admin
export const deletePaymentPrice = async (req, res) => {
    try {
        const paymentPrice = await PaymentPrice.findById(req.params.id);

        if (paymentPrice) {
            await paymentPrice.deleteOne();
            res.json({ message: 'Payment price removed' });
        } else {
            res.status(404).json({ message: 'Payment price not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
