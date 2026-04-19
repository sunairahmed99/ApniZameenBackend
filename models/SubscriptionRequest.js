import mongoose from 'mongoose';

const subscriptionRequestSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    dealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal',
        required: true
    },
    paymentScreenshot: {
        type: String, // URL of the uploaded image
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String
    },
    quotaRemaining: {
        type: Number,
        default: 0
    },
    expiryDate: {
        type: Date
    }
}, { timestamps: true });

subscriptionRequestSchema.index({ sellerId: 1 });
subscriptionRequestSchema.index({ status: 1 });

export default mongoose.model("SubscriptionRequest", subscriptionRequestSchema);
