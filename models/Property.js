import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: false // Seller login handled later
    },
    // Contact Info
    email: {
        type: String,
        required: true,
        trim: true
    },
    whatsapp: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['For Sale', 'For Rent'],
        required: true
    },
    propertyType: {
        type: String,
        enum: [
            'House', 'Flat', 'Farm House', 'Upper Portion', 'Lower Portion', 'Penthouse', 'Room',
            'Residential Plot', 'Commercial Plot', 'Agricultural Land', 'Industrial Land', 'Plot File',
            'Office', 'Shop', 'Warehouse', 'Factory', 'Building', 'Other'
        ],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    area: {
        value: Number,
        unit: {
            type: String,
            enum: ['Marla', 'Sqft', 'Kanal', 'Square Yards'],
            default: 'Marla'
        }
    },
    // Location Details
    state: String,
    city: String,
    areaName: String, // Neighborhood/Society name
    blockName: String, // Specific block within area
    address: String,
    lat: Number,
    lng: Number,

    // Property Details
    bedrooms: Number,
    bathrooms: Number,

    // Media (Cloudinary URLs)
    images: [{
        type: String
    }],
    video: {
        type: String // URL
    },

    // Analytics
    views: {
        type: Number,
        default: 0
    },
    leads: {
        type: Number,
        default: 0
    },

    // Status & Visibility
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'sold', 'rented'],
        default: 'pending'
    },
    isBoosted: {
        type: Boolean,
        default: false
    },
    boostExpiry: {
        type: Date
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    expiryDate: {
        type: Date
    },

    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PropertyPlan'
    },
    agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency'
    }

}, { timestamps: true });

// Indexing for search performance
PropertySchema.index({ status: 1, city: 1, purpose: 1, propertyType: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ createdAt: -1 });
PropertySchema.index({ isBoosted: -1, isFeatured: -1, createdAt: -1 });
PropertySchema.index({ sellerId: 1 });
PropertySchema.index({ status: 1, areaName: 1 }); // Optimize Search by Area
PropertySchema.index({ status: 1, title: 1 }); // Optimize Search by Title (Regex)
PropertySchema.index({ sellerId: 1, status: 1, expiryDate: 1 }); // For seller dashboard stats
PropertySchema.index({ sellerId: 1, isBoosted: 1, isFeatured: 1 }); // For boosted/featured count
PropertySchema.index({ title: 'text', description: 'text' });

export default mongoose.model("Property", PropertySchema);
