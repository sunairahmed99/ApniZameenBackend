import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        default: null
    },
    type: {
        type: String,
        enum: ['state', 'city', 'area', 'block'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

LocationSchema.index({ name: 1 });
LocationSchema.index({ parent: 1 });
LocationSchema.index({ type: 1 });

export default mongoose.model("Location", LocationSchema);
