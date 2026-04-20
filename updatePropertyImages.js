import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import Property from './models/Property.js';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

// ==================== Property Images by Type ====================
// Using varied Unsplash property images for each type

const imagesByType = {
  'House': [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
    'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80',
    'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800&q=80',
    'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80',
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
    'https://images.unsplash.com/photo-1600573472556-e636c2acda9e?w=800&q=80',
  ],
  'Flat': [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&q=80',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80',
    'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
    'https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
    'https://images.unsplash.com/photo-1560440021-33f9b867899d?w=800&q=80',
  ],
  'Plot': [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80',
    'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=800&q=80',
    'https://images.unsplash.com/photo-1582407947092-703f28a0dfbd?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    'https://images.unsplash.com/photo-1595880500386-4b33823b29cd?w=800&q=80',
    'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    'https://images.unsplash.com/photo-1623298317883-6b70254edf31?w=800&q=80',
    'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80',
    'https://images.unsplash.com/photo-1604357209793-fca5dca89f97?w=800&q=80',
    'https://images.unsplash.com/photo-1595953708595-8d002df9c6bf?w=800&q=80',
    'https://images.unsplash.com/photo-1516156008796-094e2d1e0fcd?w=800&q=80',
  ],
  'Commercial': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80',
    'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&q=80',
    'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80',
    'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&q=80',
    'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=800&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
    'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80',
    'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
  ],
  'Upper Portion': [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
    'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
    'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80',
    'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
  ],
  'Lower Portion': [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
    'https://images.unsplash.com/photo-1600573472556-e636c2acda9e?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
  ],
  'Farm House': [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&q=80',
    'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&q=80',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
    'https://images.unsplash.com/photo-1580237541049-2d715a09486e?w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80',
  ],
  'Room': [
    'https://images.unsplash.com/photo-1522771739673-7615a14f3305?w=800&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
    'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
    'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
    'https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80',
    'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80',
    'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&q=80',
    'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&q=80',
  ],
  'Penthouse': [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80',
    'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  ],
};

// ==================== Main ====================

async function main() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 120000,
    });
    console.log('✅ Connected to MongoDB\n');

    const propertyTypes = Object.keys(imagesByType);

    for (const pType of propertyTypes) {
      const images = imagesByType[pType];
      const totalImages = images.length;
      
      console.log(`\n📷 Processing "${pType}" — ${totalImages} unique images available...`);

      // Count empty-image properties of this type
      const emptyCount = await Property.countDocuments({
        propertyType: pType,
        $or: [
          { images: { $exists: false } },
          { images: { $size: 0 } },
          { images: null }
        ]
      });

      console.log(`   Found ${emptyCount.toLocaleString()} properties without images`);

      if (emptyCount === 0) {
        console.log(`   ✅ All ${pType} properties already have images, skipping...`);
        continue;
      }

      // Process in batches - assign images using bulkWrite for performance
      const BATCH_SIZE = 5000;
      let processed = 0;

      while (processed < emptyCount) {
        // Fetch a batch of IDs without images
        const batch = await Property.find(
          {
            propertyType: pType,
            $or: [
              { images: { $exists: false } },
              { images: { $size: 0 } },
              { images: null }
            ]
          },
          { _id: 1 }
        ).limit(BATCH_SIZE).lean();

        if (batch.length === 0) break;

        // Build bulk operations - each property gets a random image from its type pool
        const bulkOps = batch.map(prop => {
          // Pick a random image - use the property ID hash for deterministic but varied selection
          const idStr = prop._id.toString();
          const hash = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const imgIndex = hash % totalImages;
          const selectedImage = images[imgIndex];

          return {
            updateOne: {
              filter: { _id: prop._id },
              update: { $set: { images: [selectedImage] } }
            }
          };
        });

        const result = await Property.bulkWrite(bulkOps, { ordered: false });
        processed += batch.length;
        
        const pct = Math.min(100, ((processed / emptyCount) * 100)).toFixed(1);
        console.log(`   ✅ Batch done — ${processed.toLocaleString()}/${emptyCount.toLocaleString()} (${pct}%) — Modified: ${result.modifiedCount}`);
      }

      console.log(`   🎉 "${pType}" complete!`);
    }

    // Also update any properties that somehow have images but they are the same default
    console.log('\n\n📊 Final Summary:');
    for (const pType of propertyTypes) {
      const count = await Property.countDocuments({ propertyType: pType });
      const withImages = await Property.countDocuments({ 
        propertyType: pType, 
        images: { $exists: true, $not: { $size: 0 } }
      });
      console.log(`   ${pType}: ${withImages.toLocaleString()}/${count.toLocaleString()} have images`);
    }

    const totalCount = await Property.countDocuments();
    const totalWithImages = await Property.countDocuments({ images: { $exists: true, $not: { $size: 0 } } });
    console.log(`\n   🎉 Total: ${totalWithImages.toLocaleString()}/${totalCount.toLocaleString()} properties have images`);

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
