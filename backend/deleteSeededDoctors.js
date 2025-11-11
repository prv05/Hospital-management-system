import mongoose from 'mongoose';
import User from './models/User.js';
import Doctor from './models/Doctor.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('🗑️  Deleting all seeded doctors...\n');
    
    // Delete all doctors from Doctor collection (all were created at 11:29:38)
    const doctorResult = await Doctor.deleteMany({
      createdAt: { 
        $gte: new Date('2025-11-11T11:29:00'),
        $lte: new Date('2025-11-11T11:30:00')
      }
    });
    
    console.log(`✅ Deleted ${doctorResult.deletedCount} doctors from Doctor collection`);
    
    // Delete all users with doctor role from the same time
    const userResult = await User.deleteMany({
      role: 'doctor',
      createdAt: { 
        $gte: new Date('2025-11-11T11:29:00'),
        $lte: new Date('2025-11-11T11:30:00')
      }
    });
    
    console.log(`✅ Deleted ${userResult.deletedCount} doctor users from User collection`);
    
    // Check what remains
    const remainingUsers = await User.find({ role: 'doctor' });
    const remainingDoctors = await Doctor.find();
    
    console.log(`\n📊 Remaining:`)
    console.log(`   Doctor Users: ${remainingUsers.length}`);
    console.log(`   Doctor Profiles: ${remainingDoctors.length}`);
    
    if (remainingUsers.length > 0) {
      console.log('\n📋 Remaining doctor users:');
      remainingUsers.forEach((u, i) => {
        console.log(`${i+1}. ${u.name} | ${u.email}`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
