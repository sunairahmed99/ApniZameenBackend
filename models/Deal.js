import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    propertyLimit: {
        type: Number,
        required: true
    },
    durationDays: {
        type: Number,
        default: 30
    },
    planType: {
        type: String,
        enum: ['standard', 'titanium'],
        default: 'standard',
        required: true
    },
    description: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model("Deal", dealSchema);
