import mongoose from 'mongoose';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('🔍 Debugging doctor-department mismatch:\n');
    
    // List all departments
    const departments = await Department.find();
    console.log('📋 All Departments:');
    departments.forEach(d => {
      console.log(`  ${d.name} (ID: ${d._id})`);
    });
    
    console.log('\n👨‍⚕️ All Doctors:');
    const doctors = await Doctor.find()
      .populate('department', 'name');
    
    doctors.forEach(d => {
      console.log(`  ${d.name || 'No Name'}`);
      console.log(`    Specialization: ${d.specialization}`);
      console.log(`    Department: ${d.department?.name} (ID: ${d.department?._id})`);
      console.log(`    Available: ${d.isAvailable}, On Leave: ${d.isOnLeave}`);
    });
    
    // Find General Medicine department
    const generalMed = await Department.findOne({ name: /general/i });
    console.log('\n🔍 Searching for doctors in General Medicine...');
    console.log(`General Medicine ID: ${generalMed?._id}`);
    
    const generalMedDoctors = await Doctor.find({
      department: generalMed?._id,
      isAvailable: true,
      isOnLeave: false
    });
    console.log(`Found ${generalMedDoctors.length} doctors`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
