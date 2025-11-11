import mongoose from 'mongoose';
import Doctor from './models/Doctor.js';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('🔧 Fixing doctor names...\n');
    
    // Get all doctors
    const doctors = await Doctor.find().populate('user');
    
    for (const doctor of doctors) {
      if (doctor.user) {
        const fullName = `${doctor.user.firstName} ${doctor.user.lastName}`;
        doctor.name = fullName;
        await doctor.save();
        console.log(`✅ Updated: ${fullName}`);
      } else {
        console.log(`⚠️  Skipped: No user linked`);
      }
    }
    
    console.log('\n✅ All doctor names updated!');
    
    // Verify
    const updated = await Doctor.find().populate('user').populate('department', 'name');
    console.log('\n📋 Current doctors:');
    updated.forEach(d => {
      console.log(`  ${d.name} | ${d.specialization} | ${d.department?.name}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
