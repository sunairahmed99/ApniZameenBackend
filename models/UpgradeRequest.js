import mongoose from 'mongoose';

const UpgradeRequestSchema = new mongoose.Schema({
    agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeaturedPlan',
        required: true
    },
    paymentImage: {
        type: String, // URL of the screenshot
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

export default mongoose.model("UpgradeRequest", UpgradeRequestSchema);
