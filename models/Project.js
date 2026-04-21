import mongoose from 'mongoose';

const MarkerSchema = new mongoose.Schema({
  name: { type: String },
  type: { type: String },
  lat: { type: Number },
  lng: { type: Number }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  city: {
    type: String,
    required: true
  },
  area: {
    type: String
  },
  address: {
    type: String
  },
  priceRange: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      default: "Crore"
    }
  },
  sizeRange: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      default: "sqft"
    }
  },
  projectTypes: [String], // Flats, Penthouse, Offices, etc.
  thumbnail: String,
  gallery: [String],
  description: String,
  
  developer: {
    name: String,
    logo: String,
    description: String
  },

  marketedBy: {
    name: String,
    logo: String
  },

  // Amenities/Features categorized
  amenities: {
    mainFeatures: [String],
    rooms: [String],
    businessAndCommunication: [String],
    communityFeatures: [String],
    healthcareRecreational: [String],
    nearbyFacilities: [String],
    otherFacilities: [String]
  },

  // Inventory/Units
  inventory: [
    {
      category: String, // e.g., "Flat", "Penthouse"
      priceRange: {
        min: Number,
        max: Number
      },
      units: [
        {
          title: String, // e.g., "Studio residential Apartment"
          area: String,
          beds: Number,
          baths: Number,
          price: String,
          floorPlan: String // Image URL for this unit
        }
      ]
    }
  ],

  developmentUpdates: [
    {
      date: String,
      title: String,
      description: String,
      image: String
    }
  ],

  floorPlans: [
    {
      title: String,
      image: String
    }
  ],

  paymentPlans: [String], // Array of image URLs

  location: {
    lat: Number,
    lng: Number,
    markers: [MarkerSchema]
  },

  threeDWalkthroughUrl: String,
  videoUrl: String,

  isHot: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

ProjectSchema.pre('save', async function () {
  if (!this.isModified('name')) return;

  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

// Indexes - slug index is created automatically by unique: true
ProjectSchema.index({ city: 1 });
ProjectSchema.index({ isHot: 1 });
ProjectSchema.index({ isTrending: 1 });
ProjectSchema.index({ isActive: 1 });

export default mongoose.model("Project", ProjectSchema);
