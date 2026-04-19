import mongoose from 'mongoose';

const BrowseSectionSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["homes", "plots", "commercial"],
    required: true
  },

  section: {
    type: String,
    enum: ["popular", "type", "area-size"],
    required: true
  },

  title: {
    type: String,
    required: true   // Popular, Type, Area Size
  },

  groups: [
    {
      groupTitle: {
        type: String,
        required: true   // e.g. "On Installments", "Flats", "Houses"
      },

      items: [
        {
          label: {
            type: String,
            required: true   // "1 Bedroom Flats"
          },
          filters: {
            type: Object,    // flexible filters
            default: {}
          }
        }
      ]
    }
  ],

  order: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

BrowseSectionSchema.index({ category: 1 });
BrowseSectionSchema.index({ isActive: 1 });

export default mongoose.model("BrowseSection", BrowseSectionSchema);
