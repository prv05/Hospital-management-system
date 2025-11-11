import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bed from './models/Bed.js';
import Nurse from './models/Nurse.js';
import User from './models/User.js';

dotenv.config();

const fixWardAssignment = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');

    // Get nurse
    const nurseUser = await User.findOne({ email: 'nurse1@hospital.com' });
    const nurse = await Nurse.findOne({ user: nurseUser._id });

    // Get beds that nurse's patients are in
    const beds = await Bed.find({ currentPatient: { $ne: null } }).limit(5);
    
    console.log('📋 Current beds:');
    beds.forEach(bed => {
      console.log(`   ${bed.bedNumber} - Ward: ${bed.wardNumber}`);
    });

    // Check what ward the occupied beds are in
    const wardNumbers = [...new Set(beds.map(b => b.wardNumber))];
    console.log('\n🏥 Wards with occupied beds:', wardNumbers.join(', '));

    // Update nurse's ward to match
    if (wardNumbers.length > 0) {
      nurse.assignedWard = wardNumbers[0];
      await nurse.save();
      console.log(`\n✅ Updated nurse ward to: ${nurse.assignedWard}`);
    }

    console.log('\n🎉 Fixed! Now refresh the Bed Management page.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

fixWardAssignment();
