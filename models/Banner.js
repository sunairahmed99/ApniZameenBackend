import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  buttonText: {
    type: String,
    trim: true,
    default: 'Learn More'
  },
  page: {
    type: String,
    required: true,
    default: 'home'
  },
  active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

bannerSchema.index({ page: 1 });
bannerSchema.index({ active: 1 });
bannerSchema.index({ order: 1 });

export default mongoose.model('Banner', bannerSchema);
