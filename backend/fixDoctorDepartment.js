import mongoose from 'mongoose';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('🔧 Fixing doctor department assignment...\n');
    
    // Get the General Medicine department
    const generalMed = await Department.findOne({ name: /general medicine/i });
    
    if (!generalMed) {
      console.log('❌ General Medicine department not found!');
      process.exit(1);
    }
    
    console.log(`✅ Found General Medicine department: ${generalMed._id}`);
    
    // Update the doctor to be in General Medicine department
    const result = await Doctor.updateMany(
      { specialization: 'General Medicine' },
      { $set: { department: generalMed._id } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} doctor(s) to General Medicine department`);
    
    // Verify
    const doctors = await Doctor.find({
      department: generalMed._id,
      isAvailable: true,
      isOnLeave: false
    }).populate('department', 'name');
    
    console.log(`\n✅ Doctors now in General Medicine: ${doctors.length}`);
    doctors.forEach(d => {
      console.log(`  - ${d.name || 'No Name'} | ${d.specialization} | ${d.department.name}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
