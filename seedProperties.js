import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import Property from './models/Property.js';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const CONTACT_EMAIL = 'sunairahmed9908@gmail.com';
const CONTACT_WHATSAPP = '03082011585';
const TARGET_TOTAL = 100000; // 1 lakh

// ==================== Realistic Pakistani Property Data ====================

const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot', 'Gujranwala', 'Bahawalpur'];

const areasByCityMap = {
  'Karachi': [
    { areaName: 'DHA Defence', blocks: ['Phase 1', 'Phase 2', 'Phase 4', 'Phase 5', 'Phase 6', 'Phase 7', 'Phase 8'] },
    { areaName: 'Clifton', blocks: ['Block 1', 'Block 2', 'Block 3', 'Block 4', 'Block 5', 'Block 7', 'Block 8', 'Block 9'] },
    { areaName: 'Gulshan-e-Iqbal', blocks: ['Block 1', 'Block 2', 'Block 3', 'Block 4', 'Block 5', 'Block 6', 'Block 7', 'Block 10', 'Block 13', 'Block 14'] },
    { areaName: 'Gulistan-e-Jauhar', blocks: ['Block 1', 'Block 2', 'Block 3', 'Block 4', 'Block 5', 'Block 7', 'Block 12', 'Block 13', 'Block 14', 'Block 15', 'Block 16', 'Block 17', 'Block 18', 'Block 19', 'Block 20'] },
    { areaName: 'North Nazimabad', blocks: ['Block A', 'Block B', 'Block C', 'Block D', 'Block F', 'Block H', 'Block J', 'Block K', 'Block L', 'Block M', 'Block N'] },
    { areaName: 'Nazimabad', blocks: ['Block 1', 'Block 2', 'Block 3', 'Block 4', 'Block 5'] },
    { areaName: 'Bahria Town Karachi', blocks: ['Precinct 1', 'Precinct 2', 'Precinct 10', 'Precinct 11', 'Precinct 15', 'Precinct 19', 'Precinct 27', 'Precinct 31'] },
    { areaName: 'Scheme 33', blocks: ['Sector 17-A', 'Sector 18', 'Sector 20', 'Sector 21', 'Sector 25-A', 'Sector 34'] },
    { areaName: 'Malir', blocks: ['Malir City', 'Malir Halt', 'Malir Cantt'] },
    { areaName: 'Korangi', blocks: ['Sector 31-G', 'Sector 33', 'Sector 35-A'] },
    { areaName: 'FB Area', blocks: ['Block 1', 'Block 3', 'Block 5', 'Block 7', 'Block 10', 'Block 12', 'Block 13', 'Block 14', 'Block 16', 'Block 17'] },
    { areaName: 'PECHS', blocks: ['Block 2', 'Block 3', 'Block 6'] },
    { areaName: 'Surjani Town', blocks: ['Sector 1', 'Sector 4', 'Sector 5', 'Sector 7'] },
    { areaName: 'Gadap Town', blocks: ['Gadap Town', 'Kathore'] },
    { areaName: 'North Karachi', blocks: ['Sector 5-C', 'Sector 10', 'Sector 11-B', 'Sector 11-C'] },
    { areaName: 'Saadi Town', blocks: ['Block 1', 'Block 2', 'Block 3', 'Block 4', 'Block 5', 'Block 7'] },
  ],
  'Lahore': [
    { areaName: 'DHA Lahore', blocks: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6', 'Phase 7', 'Phase 8', 'Phase 9'] },
    { areaName: 'Bahria Town Lahore', blocks: ['Sector A', 'Sector B', 'Sector C', 'Sector D', 'Sector E', 'Sector F', 'Safari Valley', 'Jinnah Block', 'Iqbal Block', 'Usman Block', 'Tipu Sultan Block'] },
    { areaName: 'Johar Town', blocks: ['Block A', 'Block B', 'Block C', 'Block D', 'Block E', 'Block F', 'Block G', 'Block H', 'Block J', 'Block R'] },
    { areaName: 'Gulberg', blocks: ['Block A', 'Block B', 'Block C', 'Block D', 'Block E', 'Block F'] },
    { areaName: 'Model Town', blocks: ['Block A', 'Block B', 'Block C', 'Block D', 'Block E', 'Block F', 'Block G', 'Block H', 'Block J', 'Block K', 'Block L', 'Block M', 'Block N', 'Block P', 'Block Q', 'Block R'] },
    { areaName: 'Garden Town', blocks: ['Block A', 'Block B'] },
    { areaName: 'Township', blocks: ['Sector A', 'Sector B', 'Sector C'] },
    { areaName: 'Cantt', blocks: ['Cantt Area', 'Sarfraz Colony'] },
    { areaName: 'Wapda Town', blocks: ['Phase 1', 'Phase 2'] },
    { areaName: 'Valencia', blocks: ['Block A', 'Block B', 'Block C', 'Block D', 'Block E', 'Block F', 'Block G', 'Block H'] },
    { areaName: 'LDA Avenue', blocks: ['Block A', 'Block B', 'Block C', 'Block D', 'Block E'] },
    { areaName: 'Iqbal Town', blocks: ['Raza Block', 'Nishtar Block', 'Karim Block', 'Mehran Block'] },
    { areaName: 'EME Society', blocks: ['Block A', 'Block B', 'Block C', 'Block D', 'Block E'] },
    { areaName: 'Lake City', blocks: ['Sector M-1', 'Sector M-2', 'Sector M-3', 'Sector M-7'] },
    { areaName: 'PCSIR Housing Scheme', blocks: ['Phase 1', 'Phase 2'] },
  ],
  'Islamabad': [
    { areaName: 'DHA Islamabad', blocks: ['Phase 1', 'Phase 2', 'Phase 5'] },
    { areaName: 'Bahria Town Islamabad', blocks: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6', 'Phase 7', 'Phase 8', 'Bahria Enclave'] },
    { areaName: 'E-11', blocks: ['E-11/1', 'E-11/2', 'E-11/3', 'E-11/4'] },
    { areaName: 'F-10', blocks: ['F-10/1', 'F-10/2', 'F-10/3', 'F-10/4'] },
    { areaName: 'F-11', blocks: ['F-11/1', 'F-11/2', 'F-11/3', 'F-11/4'] },
    { areaName: 'G-11', blocks: ['G-11/1', 'G-11/2', 'G-11/3', 'G-11/4'] },
    { areaName: 'G-13', blocks: ['G-13/1', 'G-13/2', 'G-13/3', 'G-13/4'] },
    { areaName: 'I-8', blocks: ['I-8/1', 'I-8/2', 'I-8/3', 'I-8/4'] },
    { areaName: 'I-10', blocks: ['I-10/1', 'I-10/2', 'I-10/3', 'I-10/4'] },
    { areaName: 'I-14', blocks: ['I-14/1', 'I-14/2', 'I-14/3', 'I-14/4'] },
    { areaName: 'D-12', blocks: ['D-12/1', 'D-12/2', 'D-12/3', 'D-12/4'] },
    { areaName: 'B-17', blocks: ['Block A', 'Block B', 'Block C', 'Block D', 'Block E'] },
    { areaName: 'CDA Sector', blocks: ['F-6', 'F-7', 'F-8', 'G-6', 'G-7', 'G-8', 'G-9', 'G-10'] },
    { areaName: 'Pakistan Town', blocks: ['Phase 1', 'Phase 2'] },
    { areaName: 'PWD Housing Scheme', blocks: ['Block A', 'Block B', 'Block C', 'Block D'] },
  ],
  'Rawalpindi': [
    { areaName: 'Bahria Town Rawalpindi', blocks: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6', 'Phase 7', 'Phase 8'] },
    { areaName: 'DHA Rawalpindi', blocks: ['Phase 1', 'Phase 2'] },
    { areaName: 'Satellite Town', blocks: ['Block A', 'Block B', 'Block C', 'Block D', 'Block E', 'Block F'] },
    { areaName: 'Chaklala Scheme', blocks: ['Sector 1', 'Sector 2', 'Sector 3'] },
    { areaName: 'Gulraiz Housing Scheme', blocks: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6', 'Phase 7'] },
    { areaName: 'Adiala Road', blocks: ['Adiala Road'] },
    { areaName: 'Airport Housing Society', blocks: ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4'] },
    { areaName: 'Media Town', blocks: ['Block A', 'Block B', 'Block C'] },
  ],
  'Faisalabad': [
    { areaName: 'Eden Valley', blocks: ['Block A', 'Block B', 'Block C', 'Block D'] },
    { areaName: 'Citi Housing', blocks: ['Phase 1', 'Phase 2', 'Phase 3'] },
    { areaName: 'Canal Road', blocks: ['Canal Road'] },
    { areaName: 'Peoples Colony', blocks: ['Colony 1', 'Colony 2'] },
    { areaName: 'Madina Town', blocks: ['Block A', 'Block B'] },
    { areaName: 'Millat Town', blocks: ['Block A', 'Block B', 'Block C'] },
    { areaName: 'Susan Road', blocks: ['Susan Road'] },
    { areaName: 'Kohinoor City', blocks: ['Block A', 'Block B'] },
  ],
  'Multan': [
    { areaName: 'DHA Multan', blocks: ['Phase 1', 'Phase 2'] },
    { areaName: 'Bosan Road', blocks: ['Bosan Road'] },
    { areaName: 'Shah Rukn-e-Alam Colony', blocks: ['Block A', 'Block B', 'Block C', 'Block D', 'Block E'] },
    { areaName: 'Wapda Town', blocks: ['Phase 1', 'Phase 2'] },
    { areaName: 'Cantt Area', blocks: ['Cantt'] },
    { areaName: 'Gulgasht Colony', blocks: ['Block A', 'Block B'] },
  ],
  'Peshawar': [
    { areaName: 'Hayatabad', blocks: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6', 'Phase 7'] },
    { areaName: 'University Town', blocks: ['Sector A', 'Sector B', 'Sector C'] },
    { areaName: 'DHA Peshawar', blocks: ['Phase 1'] },
    { areaName: 'Regi Model Town', blocks: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'] },
    { areaName: 'Cantt Area', blocks: ['Cantt'] },
  ],
  'Quetta': [
    { areaName: 'Satellite Town', blocks: ['Block 1', 'Block 2', 'Block 3'] },
    { areaName: 'Chiltan Housing Scheme', blocks: ['Phase 1', 'Phase 2'] },
    { areaName: 'Samungli Road', blocks: ['Samungli Road'] },
    { areaName: 'Airport Road', blocks: ['Airport Road'] },
  ],
  'Hyderabad': [
    { areaName: 'Latifabad', blocks: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Unit 7', 'Unit 8', 'Unit 9', 'Unit 10'] },
    { areaName: 'Qasimabad', blocks: ['Block A', 'Block B', 'Block C'] },
    { areaName: 'Hala Naka', blocks: ['Hala Naka'] },
    { areaName: 'Cantt', blocks: ['Cantt'] },
  ],
  'Sialkot': [
    { areaName: 'Cantt', blocks: ['Cantt'] },
    { areaName: 'Defence Road', blocks: ['Defence Road'] },
    { areaName: 'Paris Road', blocks: ['Paris Road'] },
  ],
  'Gujranwala': [
    { areaName: 'Citi Housing', blocks: ['Phase 1', 'Phase 2'] },
    { areaName: 'DC Colony', blocks: ['Block A', 'Block B', 'Block C'] },
    { areaName: 'Model Town', blocks: ['Block A', 'Block B'] },
  ],
  'Bahawalpur': [
    { areaName: 'Model Town', blocks: ['Block A', 'Block B', 'Block C'] },
    { areaName: 'Satellite Town', blocks: ['Block 1', 'Block 2'] },
    { areaName: 'Yazman Road', blocks: ['Yazman Road'] },
  ],
};

const propertyTypes = ['House', 'Plot', 'Flat', 'Commercial', 'Upper Portion', 'Lower Portion', 'Farm House', 'Room', 'Penthouse'];
const purposes = ['For Sale', 'For Rent'];

// Price ranges by property type & purpose (in PKR)
const priceRanges = {
  'House': { 'For Sale': { min: 5000000, max: 150000000 }, 'For Rent': { min: 25000, max: 500000 } },
  'Plot': { 'For Sale': { min: 1000000, max: 200000000 }, 'For Rent': { min: 10000, max: 200000 } },
  'Flat': { 'For Sale': { min: 2000000, max: 80000000 }, 'For Rent': { min: 15000, max: 300000 } },
  'Commercial': { 'For Sale': { min: 5000000, max: 500000000 }, 'For Rent': { min: 30000, max: 1000000 } },
  'Upper Portion': { 'For Sale': { min: 3000000, max: 50000000 }, 'For Rent': { min: 15000, max: 150000 } },
  'Lower Portion': { 'For Sale': { min: 3500000, max: 60000000 }, 'For Rent': { min: 18000, max: 180000 } },
  'Farm House': { 'For Sale': { min: 20000000, max: 500000000 }, 'For Rent': { min: 50000, max: 1000000 } },
  'Room': { 'For Sale': { min: 500000, max: 5000000 }, 'For Rent': { min: 5000, max: 25000 } },
  'Penthouse': { 'For Sale': { min: 10000000, max: 200000000 }, 'For Rent': { min: 50000, max: 500000 } },
};

// Area sizes by property type (value in Marla unless otherwise)
const areaSizes = {
  'House': { values: [3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20, 1, 2], units: ['Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Kanal', 'Kanal'] },
  'Plot': { values: [3, 4, 5, 7, 8, 10, 12, 14, 16, 20, 1, 2, 4, 120, 240, 400, 500, 600, 1000], units: ['Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Kanal', 'Kanal', 'Kanal', 'Square Yards', 'Square Yards', 'Square Yards', 'Square Yards', 'Square Yards', 'Square Yards'] },
  'Flat': { values: [500, 650, 800, 950, 1000, 1200, 1400, 1600, 1800, 2000, 2400, 2800, 3000], units: ['Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft'] },
  'Commercial': { values: [200, 400, 600, 800, 1000, 1500, 2000, 3000, 5000, 8, 10, 16, 1, 2], units: ['Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Marla', 'Marla', 'Marla', 'Kanal', 'Kanal'] },
  'Upper Portion': { values: [5, 7, 8, 10, 12, 14, 1], units: ['Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Kanal'] },
  'Lower Portion': { values: [5, 7, 8, 10, 12, 14, 1], units: ['Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Marla', 'Kanal'] },
  'Farm House': { values: [2, 4, 8, 10, 20, 40], units: ['Kanal', 'Kanal', 'Kanal', 'Kanal', 'Kanal', 'Kanal'] },
  'Room': { values: [150, 200, 250, 300, 400, 500], units: ['Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft'] },
  'Penthouse': { values: [2000, 2500, 3000, 3500, 4000, 5000], units: ['Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft', 'Sqft'] },
};

const bedroomsByType = {
  'House': [2, 3, 4, 5, 6, 7, 8, 10],
  'Flat': [1, 2, 3, 4],
  'Upper Portion': [2, 3, 4],
  'Lower Portion': [2, 3, 4],
  'Farm House': [3, 4, 5, 6, 8],
  'Room': [1],
  'Penthouse': [3, 4, 5],
};

const bathroomsByType = {
  'House': [1, 2, 3, 4, 5, 6],
  'Flat': [1, 2, 3],
  'Upper Portion': [1, 2, 3],
  'Lower Portion': [1, 2, 3],
  'Farm House': [2, 3, 4, 5],
  'Room': [1],
  'Penthouse': [2, 3, 4],
};

// ==================== Helpers ====================

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundPrice(price) {
  if (price >= 10000000) return Math.round(price / 1000000) * 1000000;
  if (price >= 1000000) return Math.round(price / 100000) * 100000;
  if (price >= 100000) return Math.round(price / 10000) * 10000;
  if (price >= 10000) return Math.round(price / 1000) * 1000;
  return Math.round(price / 500) * 500;
}

function generateTitle(propertyType, purpose, areaName, blockName, areaVal, areaUnit, bedrooms) {
  const templates = [
    () => `${areaVal} ${areaUnit} ${propertyType} for ${purpose === 'For Sale' ? 'Sale' : 'Rent'} in ${blockName}, ${areaName}`,
    () => `Beautiful ${propertyType} ${purpose === 'For Sale' ? 'Available for Sale' : 'for Rent'} in ${areaName} ${blockName}`,
    () => `${bedrooms ? bedrooms + ' Bedroom ' : ''}${propertyType} in ${areaName} - ${blockName}`,
    () => `${purpose === 'For Sale' ? 'Brand New' : 'Well Maintained'} ${propertyType} in ${blockName}, ${areaName}`,
    () => `${areaVal} ${areaUnit} ${bedrooms ? bedrooms + ' Bed ' : ''}${propertyType} - ${areaName}`,
    () => `Prime Location ${propertyType} in ${blockName} ${areaName}`,
    () => `${propertyType} Available in ${areaName} ${blockName} - ${areaVal} ${areaUnit}`,
    () => `Affordable ${propertyType} for ${purpose === 'For Sale' ? 'Sale' : 'Rent'} - ${areaName}`,
  ];
  return rand(templates)();
}

function generateDescription(propertyType, purpose, areaName, blockName, areaVal, areaUnit, bedrooms, bathrooms, price) {
  const priceLabel = price >= 10000000 ? `${(price / 10000000).toFixed(1)} Crore` : price >= 100000 ? `${(price / 100000).toFixed(1)} Lac` : `${price.toLocaleString()}`;
  const bedsStr = bedrooms ? `${bedrooms} spacious bedrooms` : '';
  const bathsStr = bathrooms ? `${bathrooms} bathrooms` : '';
  
  const descs = [
    `This stunning ${areaVal} ${areaUnit} ${propertyType} is located in the heart of ${blockName}, ${areaName}. ${bedsStr ? `Featuring ${bedsStr} and ${bathsStr}, this` : 'This'} property is ideal for families looking for a comfortable and modern living space. Priced at ${priceLabel} PKR. Contact us for more details and a site visit.`,
    `A well-maintained ${propertyType} available ${purpose === 'For Sale' ? 'for sale' : 'on rent'} in ${areaName}, ${blockName}. ${bedsStr ? `It offers ${bedsStr} with ${bathsStr}.` : ''} The property is situated in a prime location with easy access to main roads, schools, hospitals, and shopping centers. Price: ${priceLabel} PKR.`,
    `Looking for a ${propertyType.toLowerCase()} in ${areaName}? This ${areaVal} ${areaUnit} property in ${blockName} is perfect for you. ${bedsStr ? `With ${bedsStr} and ${bathsStr}, it provides` : 'It provides'} ample living space. ${purpose === 'For Sale' ? 'Ownership transfer included.' : 'Available for immediate move-in.'} Contact for viewing.`,
    `Premium ${propertyType.toLowerCase()} ${purpose === 'For Sale' ? 'on sale' : 'available for rent'} at ${blockName}, ${areaName}. Total area: ${areaVal} ${areaUnit}. ${bedsStr ? `${bedsStr}, ${bathsStr}.` : ''} Excellent location with all amenities nearby. Don't miss this opportunity! Price: ${priceLabel} PKR.`,
  ];
  return rand(descs);
}

function generateProperty(city) {
  const areas = areasByCityMap[city] || areasByCityMap['Karachi'];
  const area = rand(areas);
  const block = rand(area.blocks);
  const propertyType = rand(propertyTypes);
  const purpose = rand(purposes);
  
  const sizeData = areaSizes[propertyType];
  const sizeIdx = randInt(0, sizeData.values.length - 1);
  const areaVal = sizeData.values[sizeIdx];
  const areaUnit = sizeData.units[sizeIdx];

  const range = priceRanges[propertyType][purpose];
  const price = roundPrice(randInt(range.min, range.max));

  const bedrooms = bedroomsByType[propertyType] ? rand(bedroomsByType[propertyType]) : undefined;
  const bathrooms = bathroomsByType[propertyType] ? rand(bathroomsByType[propertyType]) : undefined;

  const title = generateTitle(propertyType, purpose, area.areaName, block, areaVal, areaUnit, bedrooms);
  const description = generateDescription(propertyType, purpose, area.areaName, block, areaVal, areaUnit, bedrooms, bathrooms, price);

  return {
    title,
    description,
    purpose,
    propertyType,
    price,
    area: { value: areaVal, unit: areaUnit },
    state: 'Sindh',
    city,
    areaName: area.areaName,
    blockName: block,
    address: `${block}, ${area.areaName}, ${city}`,
    bedrooms,
    bathrooms,
    images: [],
    status: 'approved',
    email: CONTACT_EMAIL,
    whatsapp: CONTACT_WHATSAPP,
    isBoosted: Math.random() < 0.02,
    isFeatured: Math.random() < 0.05,
    isVerified: Math.random() < 0.3,
    views: randInt(0, 500),
    leads: randInt(0, 20),
    createdAt: new Date(Date.now() - randInt(0, 90 * 24 * 60 * 60 * 1000)), // random date within last 90 days
  };
}

// Set correct state for each city
function getState(city) {
  const stateMap = {
    'Karachi': 'Sindh', 'Hyderabad': 'Sindh',
    'Lahore': 'Punjab', 'Rawalpindi': 'Punjab', 'Faisalabad': 'Punjab', 'Multan': 'Punjab', 'Sialkot': 'Punjab', 'Gujranwala': 'Punjab', 'Bahawalpur': 'Punjab',
    'Islamabad': 'Islamabad Capital Territory',
    'Peshawar': 'Khyber Pakhtunkhwa',
    'Quetta': 'Balochistan',
  };
  return stateMap[city] || 'Punjab';
}

// ==================== Main ====================

async function main() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
    });
    console.log('✅ Connected to MongoDB');

    // ===== Step 1: Update existing properties without contact info =====
    console.log('\n📝 Step 1: Updating existing properties with contact details...');
    const updateResult = await Property.updateMany(
      {
        $or: [
          { email: { $exists: false } },
          { email: '' },
          { email: null },
          { whatsapp: { $exists: false } },
          { whatsapp: '' },
          { whatsapp: null },
        ]
      },
      {
        $set: {
          email: CONTACT_EMAIL,
          whatsapp: CONTACT_WHATSAPP,
        }
      }
    );
    console.log(`   ✅ Updated ${updateResult.modifiedCount} properties with contact details`);

    // ===== Step 2: Count existing and add more =====
    const existingCount = await Property.countDocuments();
    console.log(`\n📊 Step 2: Current property count: ${existingCount.toLocaleString()}`);

    const needed = TARGET_TOTAL - existingCount;
    if (needed <= 0) {
      console.log(`   ✅ Already have ${existingCount.toLocaleString()} properties (target: ${TARGET_TOTAL.toLocaleString()}). No new properties needed!`);
      await mongoose.connection.close();
      process.exit(0);
      return;
    }

    console.log(`   📊 Need to add ${needed.toLocaleString()} more properties to reach ${TARGET_TOTAL.toLocaleString()}`);

    // ===== Step 3: Bulk insert in batches =====
    const BATCH_SIZE = 5000;
    const totalBatches = Math.ceil(needed / BATCH_SIZE);
    let inserted = 0;

    // Weight cities by real-world property volume
    const cityWeights = [
      { city: 'Karachi', weight: 25 },
      { city: 'Lahore', weight: 25 },
      { city: 'Islamabad', weight: 15 },
      { city: 'Rawalpindi', weight: 10 },
      { city: 'Faisalabad', weight: 5 },
      { city: 'Multan', weight: 5 },
      { city: 'Peshawar', weight: 4 },
      { city: 'Quetta', weight: 3 },
      { city: 'Hyderabad', weight: 3 },
      { city: 'Sialkot', weight: 2 },
      { city: 'Gujranwala', weight: 2 },
      { city: 'Bahawalpur', weight: 1 },
    ];

    function weightedRandomCity() {
      const totalWeight = cityWeights.reduce((s, c) => s + c.weight, 0);
      let r = Math.random() * totalWeight;
      for (const cw of cityWeights) {
        r -= cw.weight;
        if (r <= 0) return cw.city;
      }
      return 'Karachi';
    }

    console.log(`\n🚀 Step 3: Inserting ${needed.toLocaleString()} properties in ${totalBatches} batches of ${BATCH_SIZE}...\n`);

    for (let batch = 0; batch < totalBatches; batch++) {
      const batchSize = Math.min(BATCH_SIZE, needed - inserted);
      const properties = [];

      for (let i = 0; i < batchSize; i++) {
        const city = weightedRandomCity();
        const prop = generateProperty(city);
        prop.state = getState(city);
        properties.push(prop);
      }

      try {
        await Property.insertMany(properties, { ordered: false });
        inserted += batchSize;
        const pct = ((inserted / needed) * 100).toFixed(1);
        console.log(`   ✅ Batch ${batch + 1}/${totalBatches} done — ${inserted.toLocaleString()}/${needed.toLocaleString()} (${pct}%)`);
      } catch (err) {
        // insertMany with ordered:false continues on error
        inserted += batchSize;
        console.log(`   ⚠️  Batch ${batch + 1} completed with some errors: ${err.message.substring(0, 100)}`);
      }
    }

    const finalCount = await Property.countDocuments();
    console.log(`\n🎉 Done! Total properties in database: ${finalCount.toLocaleString()}`);

    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
