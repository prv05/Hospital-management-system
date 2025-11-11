import mongoose from 'mongoose';
import User from './models/User.js';
import Department from './models/Department.js';
import Doctor from './models/Doctor.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Update all doctors to be available
    const result = await Doctor.updateMany(
      {},
      { $set: { isAvailable: true } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} doctors to be available`);
    
    // Verify
    const availableDoctors = await Doctor.find({ isAvailable: true })
      .populate('user', 'firstName lastName')
      .populate('department', 'name');
    
    console.log(`\n📊 Available doctors: ${availableDoctors.length}\n`);
    
    availableDoctors.forEach(d => {
      console.log(`✓ Dr. ${d.user?.firstName} ${d.user?.lastName} - ${d.department?.name}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
