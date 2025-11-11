import mongoose from 'mongoose';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('🔍 Checking department ID mismatch...\n');
    
    // Get all departments
    const departments = await Department.find();
    console.log('📋 Current Departments in Database:');
    departments.forEach(d => {
      console.log(`  ${d.name}: ${d._id}`);
    });
    
    // Get all doctors
    const doctors = await Doctor.find().populate('user', 'firstName lastName');
    console.log('\n👨‍⚕️ Current Doctors:');
    doctors.forEach(d => {
      console.log(`  ${d.user?.firstName} ${d.user?.lastName}`);
      console.log(`    Department ID: ${d.department}`);
      console.log(`    Specialization: ${d.specialization}`);
    });
    
    // Find General Medicine department (current one)
    const generalMed = departments.find(d => d.name.toLowerCase().includes('general'));
    
    if (generalMed && doctors.length > 0) {
      console.log(`\n🔧 Updating doctor's department to match current General Medicine ID...`);
      console.log(`   Old ID: ${doctors[0].department}`);
      console.log(`   New ID: ${generalMed._id}`);
      
      doctors[0].department = generalMed._id;
      await doctors[0].save();
      
      console.log('✅ Doctor updated!');
    }
    
    // Verify
    const updated = await Doctor.find({
      department: generalMed._id,
      isAvailable: true,
      isOnLeave: false
    }).populate('user', 'firstName lastName');
    
    console.log(`\n✅ Doctors now in General Medicine: ${updated.length}`);
    updated.forEach(d => {
      console.log(`  - Dr. ${d.user?.firstName} ${d.user?.lastName}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
