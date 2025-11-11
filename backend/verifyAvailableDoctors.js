import mongoose from 'mongoose';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('✅ Checking available doctors for appointment booking:\n');
    
    const doctors = await Doctor.find({ 
      isAvailable: true, 
      isOnLeave: false 
    }).populate('department', 'name');
    
    console.log(`Total available doctors: ${doctors.length}\n`);
    
    if (doctors.length === 0) {
      console.log('❌ NO DOCTORS AVAILABLE FOR APPOINTMENTS!');
    } else {
      doctors.forEach((d, i) => {
        console.log(`${i+1}. ${d.name}`);
        console.log(`   Specialization: ${d.specialization}`);
        console.log(`   Department: ${d.department?.name || 'No Department'}`);
        console.log(`   Available: ${d.isAvailable}`);
        console.log(`   On Leave: ${d.isOnLeave}`);
        console.log('');
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
