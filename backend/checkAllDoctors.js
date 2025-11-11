import mongoose from 'mongoose';
import User from './models/User.js';
import Department from './models/Department.js';
import Doctor from './models/Doctor.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Get all doctor users
    const allDoctorUsers = await User.find({ role: 'doctor' });
    console.log(`📊 Total doctor users: ${allDoctorUsers.length}\n`);
    
    // Get all doctor profiles
    const allDoctors = await Doctor.find({})
      .populate('user', 'firstName lastName email')
      .populate('department', 'name');
    
    console.log(`📊 Total doctor profiles: ${allDoctors.length}\n`);
    
    // Check availability status
    console.log('📋 Doctor Availability Status:\n');
    allDoctors.forEach(d => {
      console.log({
        name: `Dr. ${d.user?.firstName} ${d.user?.lastName}`,
        email: d.user?.email,
        department: d.department?.name || 'Not assigned',
        isAvailable: d.isAvailable,
        hasSpecialization: !!d.specialization,
        hasFee: !!d.consultationFee
      });
    });
    
    // Find doctors without profiles
    console.log('\n🔍 Checking for doctor users without profiles:\n');
    for (const user of allDoctorUsers) {
      const profile = await Doctor.findOne({ user: user._id });
      if (!profile) {
        console.log(`❌ Missing profile: ${user.firstName} ${user.lastName} (${user.email})`);
      }
    }
    
    // Count by availability
    const available = allDoctors.filter(d => d.isAvailable).length;
    const unavailable = allDoctors.filter(d => !d.isAvailable).length;
    
    console.log(`\n📈 Summary:`);
    console.log(`   Available: ${available}`);
    console.log(`   Unavailable: ${unavailable}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
