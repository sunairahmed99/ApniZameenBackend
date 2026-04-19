import mongoose from 'mongoose';

const PropertyPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    maxProperties: {
        type: Number,
        default: 1
    },
    boostCredits: {
        type: Number,
        default: 0
    },
    durationDays: {
        type: Number,
        required: true
    },
    maxImages: {
        type: Number,
        default: 3
    },
    videoAllowed: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: String
}, { timestamps: true });

export default mongoose.model("PropertyPlan", PropertyPlanSchema);
