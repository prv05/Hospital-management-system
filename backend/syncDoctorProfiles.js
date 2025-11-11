import mongoose from 'mongoose';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';
import { generateDoctorId } from './utils/idGenerator.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('🔄 Syncing existing doctor users to Doctor profiles...\n');
    
    // Find all users with doctor role
    const doctorUsers = await User.find({ role: 'doctor' });
    console.log(`Found ${doctorUsers.length} doctor users\n`);
    
    let created = 0;
    let skipped = 0;
    
    for (const user of doctorUsers) {
      // Check if Doctor profile already exists
      const existingProfile = await Doctor.findOne({ user: user._id });
      
      if (existingProfile) {
        console.log(`⏭️  Skipped: ${user.name || user.email} (profile exists)`);
        skipped++;
        continue;
      }
      
      // Get first available department as default
      const defaultDept = await Department.findOne();
      
      // Create Doctor profile
      const doctorProfile = await Doctor.create({
        user: user._id,
        employeeId: generateDoctorId(),
        name: user.name || `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        specialization: 'General Medicine', // Default
        qualification: 'MBBS', // Default
        department: user.department || defaultDept?._id, // Use user dept or default
        experience: 5, // Default
        licenseNumber: `MED${Math.floor(Math.random() * 100000)}`,
        licenseExpiry: new Date('2026-12-31'),
        consultationFee: 500, // Default
        isAvailable: true,
        isOnLeave: false,
        schedule: {
          monday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          tuesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          wednesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          thursday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          friday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          saturday: { isAvailable: true, startTime: '09:00', endTime: '13:00' },
          sunday: { isAvailable: false, startTime: null, endTime: null }
        }
      });
      
      console.log(`✅ Created: ${user.name || user.email}`);
      created++;
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${created} doctor profiles`);
    console.log(`   Skipped: ${skipped} (already had profiles)`);
    
    // List all doctors with their departments
    console.log('\n📋 All doctors:');
    const allDoctors = await Doctor.find()
      .populate('user', 'name email')
      .populate('department', 'name');
    
    allDoctors.forEach((d, i) => {
      console.log(`${i+1}. ${d.name || d.user?.name || 'N/A'} | ${d.specialization} | Dept: ${d.department?.name || 'Not assigned'}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
