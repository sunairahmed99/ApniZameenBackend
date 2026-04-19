import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: false
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: false
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: false // If it's a project inquiry, might not have a specific seller yet, or admin
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    message: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'responded', 'closed'],
        default: 'pending'
    }
});

inquirySchema.index({ sellerId: 1 });
inquirySchema.index({ propertyId: 1 });
inquirySchema.index({ projectId: 1 });
inquirySchema.index({ date: -1 });

export default mongoose.model('Inquiry', inquirySchema);
