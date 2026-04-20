import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';
import bcrypt from 'bcryptjs';
import Seller from './models/Seller.js';
import Agency from './models/Agency.js';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

// ==================== Realistic Pakistani Agency Data ====================

const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot', 'Gujranwala', 'Bahawalpur'];

const agencyPrefixes = [
  'Al-Rehman', 'Al-Noor', 'Al-Huda', 'Al-Madina', 'Al-Qadir', 'Al-Farooq', 'Al-Habib',
  'Prime', 'Royal', 'Elite', 'Golden', 'Diamond', 'Pearl', 'Star', 'Crown', 'Silver', 'Platinum',
  'Pakistan', 'National', 'United', 'Metro', 'City', 'Urban', 'Modern', 'Global',
  'Green', 'Blue', 'White', 'Sky', 'Sun', 'Moon',
  'Khan', 'Ahmed', 'Ali', 'Hassan', 'Malik', 'Butt', 'Sheikh', 'Rana', 'Chaudhry', 'Syed',
  'Zameen', 'Makan', 'Ghar', 'Property', 'Realty', 'Estate',
  'Trust', 'Safe', 'Secure', 'Best', 'Top', 'First', 'Pro',
  'Capital', 'Fortune', 'Victory', 'Dream', 'Ideal', 'Superior', 'Legend', 'Empire',
  'Frontier', 'Horizon', 'Vista', 'Zenith', 'Apex', 'Summit', 'Prestige',
  'Hamza', 'Bilal', 'Usman', 'Fahad', 'Saad', 'Zain', 'Talha', 'Rizwan', 'Kamran', 'Imran',
];

const agencySuffixes = [
  'Real Estate', 'Properties', 'Property Dealers', 'Associates', 'Builders & Developers',
  'Estate Agency', 'Realtors', 'Property Consultants', 'Property Solutions', 'Group',
  'Developers', 'Enterprises', 'Housing', 'Land & Property', 'Construction & Real Estate',
  'Property Hub', 'Estate Consultant', 'Property Network', 'Investments', 'Property Mart',
];

const firstNames = [
  'Muhammad', 'Ahmed', 'Ali', 'Hassan', 'Usman', 'Bilal', 'Hamza', 'Fahad', 'Saad', 'Zain',
  'Talha', 'Rizwan', 'Kamran', 'Imran', 'Asad', 'Faisal', 'Naveed', 'Tariq', 'Zahid', 'Arif',
  'Waseem', 'Nadeem', 'Kashif', 'Sajid', 'Waqar', 'Adnan', 'Shahid', 'Khalid', 'Amir', 'Junaid',
  'Irfan', 'Shoaib', 'Aamir', 'Babar', 'Danish', 'Ehsan', 'Farhan', 'Ghulam', 'Habib', 'Iqbal',
  'Jawad', 'Kareem', 'Liaqat', 'Mansoor', 'Naeem', 'Omar', 'Pervaiz', 'Qasim', 'Rashid', 'Sohail',
];

const lastNames = [
  'Khan', 'Ahmed', 'Ali', 'Hassan', 'Malik', 'Butt', 'Sheikh', 'Rana', 'Chaudhry', 'Syed',
  'Qureshi', 'Hashmi', 'Javed', 'Akhtar', 'Mirza', 'Bhatti', 'Gill', 'Aslam', 'Raza', 'Hussain',
  'Shah', 'Mughal', 'Baig', 'Abbasi', 'Rizvi', 'Zaidi', 'Naqvi', 'Bukhari', 'Usmani', 'Farooqi',
];

// Agency logo images - different building/office logos from Unsplash
const agencyLogos = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570126618953-d437176e8c79?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop&q=80',
];

// Agency cover images
const agencyCovers = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
  'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80',
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generatePhone() {
  const prefixes = ['0300', '0301', '0302', '0303', '0304', '0305', '0306', '0307', '0308', '0309',
    '0310', '0311', '0312', '0313', '0314', '0315', '0316', '0317', '0318', '0319',
    '0320', '0321', '0322', '0323', '0324', '0325', '0330', '0331', '0332', '0333',
    '0334', '0335', '0340', '0341', '0342', '0343', '0344', '0345', '0346', '0347'];
  return `${rand(prefixes)}${randInt(1000000, 9999999)}`;
}

function generateAgencyDescription(name, city) {
  const descs = [
    `${name} is a leading real estate agency based in ${city}, Pakistan. We specialize in buying, selling, and renting residential and commercial properties. With years of experience and a dedicated team, we are committed to helping you find your dream property.`,
    `Welcome to ${name}! We are one of the most trusted property consultants in ${city}. Our team of professional agents provides expert guidance for all your real estate needs, whether you're looking to buy, sell, or rent property.`,
    `${name} has been serving clients in ${city} for over a decade. We offer a comprehensive range of real estate services including property valuation, investment consultation, and property management. Our commitment to excellence has earned us the trust of thousands of satisfied clients.`,
    `At ${name}, we believe finding the right property should be simple. Based in ${city}, our experienced team helps clients navigate the real estate market with confidence. We handle residential plots, houses, flats, and commercial properties.`,
    `${name} is your reliable partner in ${city}'s real estate market. We provide personalized services tailored to meet your unique needs. From luxury homes to affordable plots, we have a wide portfolio to match every budget.`,
  ];
  return rand(descs);
}

// ==================== Main ====================

async function main() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
    });
    console.log('✅ Connected to MongoDB\n');

    const existingAgencies = await Agency.countDocuments();
    console.log(`📊 Existing agencies: ${existingAgencies}`);

    const TARGET = 200;
    const needed = Math.max(0, TARGET - existingAgencies);

    if (needed === 0) {
      console.log(`✅ Already have ${existingAgencies} agencies. Done!`);
      await mongoose.connection.close();
      process.exit(0);
      return;
    }

    console.log(`📊 Will create ${needed} new agencies with seller accounts\n`);

    // Hash a single default password to reuse
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('agency123456', salt);

    const usedNames = new Set();
    let created = 0;

    // Weight cities
    const cityWeights = {
      'Karachi': 40, 'Lahore': 40, 'Islamabad': 30, 'Rawalpindi': 20,
      'Faisalabad': 15, 'Multan': 15, 'Peshawar': 12, 'Hyderabad': 10,
      'Quetta': 8, 'Sialkot': 5, 'Gujranwala': 5, 'Bahawalpur': 5,
    };

    function weightedCity() {
      const total = Object.values(cityWeights).reduce((s, w) => s + w, 0);
      let r = Math.random() * total;
      for (const [city, w] of Object.entries(cityWeights)) {
        r -= w;
        if (r <= 0) return city;
      }
      return 'Karachi';
    }

    for (let i = 0; i < needed; i++) {
      const city = weightedCity();
      const firstName = rand(firstNames);
      const lastName = rand(lastNames);
      const sellerName = `${firstName} ${lastName}`;

      // Generate a unique agency name
      let agencyName;
      let attempts = 0;
      do {
        agencyName = `${rand(agencyPrefixes)} ${rand(agencySuffixes)}`;
        attempts++;
      } while (usedNames.has(agencyName) && attempts < 50);
      usedNames.add(agencyName);

      const phone = generatePhone();
      const emailPrefix = agencyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
      const sellerEmail = `${emailPrefix}${randInt(100, 9999)}@agency.pk`;

      try {
        // Create seller (owner) - use pre-hashed password to skip bcrypt hook
        const seller = new Seller({
          name: sellerName,
          email: sellerEmail,
          phone: phone,
          role: 'seller',
          isVerified: true,
          isActive: true,
          quotaRemaining: randInt(5, 50),
          isUnlimited: Math.random() < 0.2,
        });
        // Directly set the hashed password to skip the pre-save hook
        seller.password = hashedPassword;
        await seller.save({ validateBeforeSave: false });

        // Create agency
        const agency = new Agency({
          ownerId: seller._id,
          name: agencyName,
          logo: rand(agencyLogos),
          image: rand(agencyCovers),
          city: city,
          phone: phone,
          email: sellerEmail,
          description: generateAgencyDescription(agencyName, city),
          status: 'active',
          isFeatured: Math.random() < 0.15,
          isTitanium: Math.random() < 0.08,
        });

        if (agency.isFeatured) {
          agency.featuredEndDate = new Date(Date.now() + randInt(30, 180) * 24 * 60 * 60 * 1000);
        }
        if (agency.isTitanium) {
          agency.titaniumEndDate = new Date(Date.now() + randInt(30, 180) * 24 * 60 * 60 * 1000);
        }

        await agency.save();
        created++;

        if (created % 25 === 0 || created === needed) {
          console.log(`   ✅ Created ${created}/${needed} agencies (${((created/needed)*100).toFixed(0)}%)`);
        }
      } catch (err) {
        // Skip duplicates
        if (err.code === 11000) {
          console.log(`   ⚠️  Skipped duplicate: ${sellerEmail}`);
        } else {
          console.log(`   ⚠️  Error: ${err.message.substring(0, 80)}`);
        }
      }
    }

    // Summary
    const finalAgencyCount = await Agency.countDocuments();
    const activeCount = await Agency.countDocuments({ status: 'active' });
    const featuredCount = await Agency.countDocuments({ isFeatured: true });
    const titaniumCount = await Agency.countDocuments({ isTitanium: true });

    console.log(`\n🎉 Done! Agency Summary:`);
    console.log(`   Total Agencies: ${finalAgencyCount}`);
    console.log(`   Active: ${activeCount}`);
    console.log(`   Featured: ${featuredCount}`);
    console.log(`   Titanium: ${titaniumCount}`);

    // City breakdown
    console.log(`\n📊 By City:`);
    for (const city of cities) {
      const count = await Agency.countDocuments({ city });
      if (count > 0) console.log(`   ${city}: ${count}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
