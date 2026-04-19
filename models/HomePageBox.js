import mongoose from 'mongoose';

const homePageBoxSchema = new mongoose.Schema({
  boxKey: {
    type: String,
    required: true,
    enum: ['homes', 'plots', 'commercial'],
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sections: [{
    sectionTitle: {
      type: String,
      required: true
    },
    filtersLabel: {
      type: String, // e.g., "Type | Area Size"
      required: true
    },
    items: [{
      title: {
        type: String,
        required: true
      },
      query: {
        propertyCategory: {
          type: String,
          enum: ['Residential', 'Commercial', 'Plot'],
          // required: true // Can be optional if Seller wants flexible queries later
        },
        propertyType: {
          type: String,
          enum: [
            'House', 'Flat', 'Upper Portion', 'Lower Portion', 'Farm House', 'Room', 'Penthouse',
            'Plot', 'Residential Plot', 'Commercial Plot', 'Agricultural Land', 'Industrial Land', 'Plot File', 'Plot Form',
            'Shop', 'Office', 'Warehouse', 'Factory', 'Building', 'Land'
          ]
        },
        areaSize: {
          type: Number
        },
        areaUnit: {
          type: String,
          enum: ['Marla', 'Kanal', 'SqFt', 'Square Yards']
        },
        installmentAvailable: {
          type: Boolean
        },
        possession: {
          type: Boolean
        },
        // Future Safe Optional Fields
        purpose: String,
        city: String,
        area: String,
        priceMin: Number,
        priceMax: Number,
        condition: String
      }
    }]
  }]
}, {
  timestamps: true
});

homePageBoxSchema.index({ boxKey: 1 });
homePageBoxSchema.index({ isActive: 1 });

const HomePageBox = mongoose.model('HomePageBox', homePageBoxSchema);

export default HomePageBox;

