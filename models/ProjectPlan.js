import mongoose from 'mongoose';

const ProjectPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    durationInDays: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    features: {
        type: [String],
        default: []
    },
    projectLimit: {
        type: Number,
        default: 1
    },
    planType: {
        type: String,
        enum: ['standard', 'titanium'],
        default: 'standard'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model("ProjectPlan", ProjectPlanSchema);
