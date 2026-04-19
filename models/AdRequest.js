import mongoose from 'mongoose';

const adRequestSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true
    },
    deal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdDeal",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    adImage: {
        type: String, // URL from Cloudinary/Multer
        required: true
    },
    paymentScreenshot: {
        type: String, // URL from Cloudinary/Multer
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: false
    },
    amount: {
        type: Number
    }
}, { timestamps: true });

adRequestSchema.index({ seller: 1 });
adRequestSchema.index({ status: 1 });
adRequestSchema.index({ isActive: 1 });

export default mongoose.model("AdRequest", adRequestSchema);
