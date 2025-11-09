import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bed from '../models/Bed.js';

dotenv.config();

const createBeds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing beds
    await Bed.deleteMany({});
    console.log('Cleared existing beds');

    const beds = [];
    let bedCounter = 1;

    // 4 General Wards with 10 beds each (Total: 40 beds)
    for (let ward = 1; ward <= 4; ward++) {
      const wardNumber = `GW-${ward.toString().padStart(2, '0')}`;
      for (let bed = 1; bed <= 10; bed++) {
        beds.push({
          bedNumber: `B${bedCounter.toString().padStart(3, '0')}`,
          wardNumber: wardNumber,
          wardType: 'general',
          floor: Math.ceil(ward / 2),
          bedType: 'general',
          status: 'vacant',
          dailyCharge: 1000,
          facilities: [
            { name: 'Bed', isWorking: true },
            { name: 'Side Table', isWorking: true },
            { name: 'Call Button', isWorking: true }
          ]
        });
        bedCounter++;
      }
    }

    // 15 Semi-Private Wards with 2 beds each (Total: 30 beds)
    for (let ward = 1; ward <= 15; ward++) {
      const wardNumber = `SPW-${ward.toString().padStart(2, '0')}`;
      for (let bed = 1; bed <= 2; bed++) {
        beds.push({
          bedNumber: `B${bedCounter.toString().padStart(3, '0')}`,
          wardNumber: wardNumber,
          wardType: 'semi-private',
          floor: Math.ceil(ward / 5) + 2, // Floors 3, 4, 5
          bedType: 'semi-private',
          status: 'vacant',
          dailyCharge: 2000,
          facilities: [
            { name: 'Bed', isWorking: true },
            { name: 'Side Table', isWorking: true },
            { name: 'Call Button', isWorking: true },
            { name: 'TV', isWorking: true },
            { name: 'Private Bathroom', isWorking: true }
          ]
        });
        bedCounter++;
      }
    }

    // 15 Private Wards with 1 bed each (Total: 15 beds)
    for (let ward = 1; ward <= 15; ward++) {
      const wardNumber = `PW-${ward.toString().padStart(2, '0')}`;
      beds.push({
        bedNumber: `B${bedCounter.toString().padStart(3, '0')}`,
        wardNumber: wardNumber,
        wardType: 'private',
        floor: Math.ceil(ward / 5) + 5, // Floors 6, 7, 8
        bedType: 'private',
        status: 'vacant',
        dailyCharge: 3000,
        facilities: [
          { name: 'Bed', isWorking: true },
          { name: 'Side Table', isWorking: true },
          { name: 'Call Button', isWorking: true },
          { name: 'TV', isWorking: true },
          { name: 'Private Bathroom', isWorking: true },
          { name: 'Refrigerator', isWorking: true },
          { name: 'Sofa', isWorking: true },
          { name: 'AC', isWorking: true }
        ]
      });
      bedCounter++;
    }

    // 2 ICU Wards with 5 beds each (Total: 10 beds)
    for (let ward = 1; ward <= 2; ward++) {
      const wardNumber = `ICU-${ward.toString().padStart(2, '0')}`;
      for (let bed = 1; bed <= 5; bed++) {
        beds.push({
          bedNumber: `B${bedCounter.toString().padStart(3, '0')}`,
          wardNumber: wardNumber,
          wardType: 'icu',
          floor: 1,
          bedType: 'icu',
          status: 'vacant',
          dailyCharge: 5000,
          facilities: [
            { name: 'ICU Bed', isWorking: true },
            { name: 'Ventilator', isWorking: true },
            { name: 'Cardiac Monitor', isWorking: true },
            { name: 'IV Stand', isWorking: true },
            { name: 'Suction Machine', isWorking: true }
          ]
        });
        bedCounter++;
      }
    }

    await Bed.insertMany(beds);
    console.log(`✅ Created ${beds.length} beds successfully!`);
    console.log(`   - General Wards: 4 wards × 10 beds = 40 beds`);
    console.log(`   - Semi-Private Wards: 15 wards × 2 beds = 30 beds`);
    console.log(`   - Private Wards: 15 wards × 1 bed = 15 beds`);
    console.log(`   - ICU Wards: 2 wards × 5 beds = 10 beds`);
    console.log(`   - Total: ${beds.length} beds`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating beds:', error);
    process.exit(1);
  }
};

createBeds();
