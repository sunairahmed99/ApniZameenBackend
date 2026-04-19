import PaymentInfo from '../models/PaymentInfo.js';

export const getPaymentInfo = async (req, res) => {
    try {
        const info = await PaymentInfo.find().lean();
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPaymentInfo = async (req, res) => {
    try {
        const { text, isActive } = req.body;
        const newInfo = new PaymentInfo({ text, isActive });
        await newInfo.save();
        res.status(201).json(newInfo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updatePaymentInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, isActive } = req.body;
        const updatedInfo = await PaymentInfo.findByIdAndUpdate(id, { text, isActive }, { new: true });
        res.status(200).json(updatedInfo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deletePaymentInfo = async (req, res) => {
    try {
        const { id } = req.params;
        await PaymentInfo.findByIdAndDelete(id);
        res.status(200).json({ message: 'Payment info deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
