import mongoose from 'mongoose';

const bannerAdSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: false // Changed to false to avoid validation error
  },

  title: String,
  description: String,

  bannerImage: String, // Cloudinary / S3 URL 
  redirectUrl: String,

  paymentScreenshot: String,

  startDate: Date,
  endDate: Date,

  duration: {
    type: Number,
    default: 30 // days 
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  isActive: {
    type: Boolean,
    default: false
  },

  amount: {
    type: Number,
    default: 2000
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BannerPlan',
    required: false
  }

}, { timestamps: true });

bannerAdSchema.index({ status: 1 });
bannerAdSchema.index({ isActive: 1 });
bannerAdSchema.index({ seller: 1 });

export default mongoose.model("BannerAd", bannerAdSchema);
