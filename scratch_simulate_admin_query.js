import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './models/Property.js';
import Seller from './models/Seller.js';
import Agency from './models/Agency.js';

dotenv.config();

async function simulateAdminCall() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const matchStage = { title: 'gggooodd' };
    
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'sellers',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'agencies',
          localField: 'agencyId',
          foreignField: '_id',
          as: 'agency'
        }
      },
      { $unwind: { path: '$agency', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          status: 1,
          'seller.name': 1,
          'agency.name': 1
        }
      }
    ];

    const results = await Property.aggregate(pipeline);
    
    console.log(`Query returned ${results.length} results for title "gggooodd"`);
    results.forEach((r, i) => {
        console.log(`[${i}] Title: ${r.title}, Agency: ${r.agency?.name || 'N/A'}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

simulateAdminCall();
