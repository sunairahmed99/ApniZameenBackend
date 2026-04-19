import mongoose from 'mongoose';

const paymentEntrySchema = new mongoose.Schema({
    paymentImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentImage',
        required: true
    },
    paymentType: {
        type: String, // 'banner', 'agency', 'property'
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller', // Admin Seller
        required: true
    },
    notes: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model('PaymentEntry', paymentEntrySchema);

