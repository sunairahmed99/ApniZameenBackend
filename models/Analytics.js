import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    eventType: {
        type: String,
        required: true,
        enum: ['visit', 'search', 'contact_click', 'property_view']
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ip: {
        type: String
    },
    SellerAgent: {
        type: String
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
    }
}, { timestamps: true });

analyticsSchema.index({ eventType: 1 });
analyticsSchema.index({ seller: 1 });
analyticsSchema.index({ createdAt: -1 });

export default mongoose.model('Analytics', analyticsSchema);

