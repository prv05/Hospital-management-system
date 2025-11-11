import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bed from './models/Bed.js';

dotenv.config();

const fixBedStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');

    // Find all beds
    const beds = await Bed.find({ wardNumber: 'GW-1' });
    
    console.log('📋 Checking beds in ward GW-1:\n');

    for (const bed of beds) {
      console.log(`Bed ${bed.bedNumber}:`);
      console.log(`  Current Status: ${bed.status}`);
      console.log(`  Current Patient: ${bed.currentPatient || 'None'}`);
      
      // If bed has no patient but is marked as occupied, fix it
      if (!bed.currentPatient && bed.status === 'occupied') {
        bed.status = 'vacant';
        await bed.save();
        console.log(`  ✅ Fixed: Changed to vacant\n`);
      } else if (bed.currentPatient && bed.status === 'vacant') {
        bed.status = 'occupied';
        await bed.save();
        console.log(`  ✅ Fixed: Changed to occupied\n`);
      } else {
        console.log(`  ✓ Status correct\n`);
      }
    }

    console.log('🎉 Bed status check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

fixBedStatus();
