import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './models/Property.js';
import Agency from './models/Agency.js';

dotenv.config();

async function diagnose() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const title = 'gggooodd';
    const properties = await Property.find({ title }).lean();
    
    console.log(`Found ${properties.length} documents with title "${title}"`);
    
    properties.forEach((p, i) => {
        console.log(`[${i}] ID: ${p._id}, Status: ${p.status}, agencyId: ${p.agencyId}, sellerId: ${p.sellerId}`);
    });

    const totalAgencies = await Agency.countDocuments();
    console.log(`Total Agencies in DB: ${totalAgencies}`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

diagnose();
