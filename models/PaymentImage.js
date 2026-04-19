import mongoose from 'mongoose';

const paymentImageSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller', 
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['banner', 'agency', 'property', 'other'],
        default: 'other'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model('PaymentImage', paymentImageSchema);
