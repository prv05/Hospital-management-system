import mongoose from 'mongoose';
import Department from './models/Department.js';
import Doctor from './models/Doctor.js';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('🔍 Finding ALL departments (including duplicates)...\n');
    
    const allDepts = await Department.find().sort({ createdAt: -1 });
    console.log(`📋 Total Departments: ${allDepts.length}\n`);
    
    allDepts.forEach((d, i) => {
      console.log(`${i + 1}. ${d.name}`);
      console.log(`   ID: ${d._id}`);
      console.log(`   isActive: ${d.isActive}`);
      console.log(`   Created: ${d.createdAt}`);
      console.log();
    });
    
    // Check which departments are being returned by the API
    const activeDepts = await Department.find({ isActive: true })
      .select('name description')
      .sort({ name: 1 });
    
    console.log('📋 Departments returned by /api/patients/departments:');
    activeDepts.forEach(d => {
      console.log(`  ${d.name}: ${d._id}`);
    });
    
    // Check doctors
    const doctors = await Doctor.find()
      .populate('user', 'firstName lastName')
      .populate('department', 'name');
    
    console.log(`\n👨‍⚕️ Doctors (${doctors.length}):`);
    doctors.forEach(d => {
      console.log(`  Dr. ${d.user?.firstName} ${d.user?.lastName}`);
      console.log(`    Department: ${d.department?.name} (${d.department?._id})`);
      console.log(`    Available: ${d.isAvailable}, On Leave: ${d.isOnLeave}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
