import mongoose from 'mongoose';

const projectRequestSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectPlan',
        required: true
    },
    projectName: {
        type: String,
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
    }
}, { timestamps: true });

projectRequestSchema.index({ sellerId: 1 });
projectRequestSchema.index({ status: 1 });

export default mongoose.model("ProjectRequest", projectRequestSchema);
