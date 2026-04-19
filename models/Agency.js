import mongoose from 'mongoose';

const AgencySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  logo: {
    type: String // image URL
  },
  image: {
    type: String // Cover Image URL
  },
  city: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'rejected'],
    default: 'pending' // Admin approval required by default
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredEndDate: {
    type: Date
  },
  featuredPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeaturedPlan'
  },
  isTitanium: {
    type: Boolean,
    default: false
  },
  titaniumEndDate: {
    type: Date
  }
}, { timestamps: true });

AgencySchema.index({ ownerId: 1 });

export default mongoose.model("Agency", AgencySchema);
