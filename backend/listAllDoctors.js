import mongoose from 'mongoose';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('📋 Listing all doctors in database:\n');
    
    const doctors = await Doctor.find()
      .populate('department', 'name')
      .sort({ createdAt: 1 });
    
    console.log(`Total Doctors: ${doctors.length}\n`);
    
    doctors.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.name}`);
      console.log(`   Specialization: ${doc.specialization}`);
      console.log(`   Department: ${doc.department?.name || 'N/A'}`);
      console.log(`   Email: ${doc.email}`);
      console.log(`   Created: ${doc.createdAt}`);
      console.log(`   isAvailable: ${doc.isAvailable}`);
      console.log(`   ID: ${doc._id}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
