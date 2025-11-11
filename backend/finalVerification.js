import mongoose from 'mongoose';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('✅ FINAL VERIFICATION\n');
    console.log('='.repeat(60));
    
    // Get General Medicine department
    const generalMed = await Department.findOne({ name: /general medicine/i });
    console.log(`\n📋 Department: ${generalMed.name} (ID: ${generalMed._id})`);
    
    // Query exactly as the backend does
    const doctors = await Doctor.find({
      department: generalMed._id,
      isAvailable: true,
      isOnLeave: false
    })
    .populate('user', 'firstName lastName email phone')
    .populate('department', 'name');
    
    console.log(`\n👨‍⚕️ Doctors available for appointments: ${doctors.length}\n`);
    
    if (doctors.length === 0) {
      console.log('❌ NO DOCTORS FOUND! Something is still wrong.');
    } else {
      doctors.forEach((d, i) => {
        console.log(`${i + 1}. Dr. ${d.user?.firstName} ${d.user?.lastName}`);
        console.log(`   Email: ${d.user?.email}`);
        console.log(`   Phone: ${d.user?.phone}`);
        console.log(`   Specialization: ${d.specialization}`);
        console.log(`   Department: ${d.department?.name}`);
        console.log(`   Consultation Fee: ₹${d.consultationFee}`);
        console.log(`   Available: ${d.isAvailable}, On Leave: ${d.isOnLeave}`);
        console.log();
      });
      
      console.log('✅ APPOINTMENT BOOKING SHOULD NOW WORK!');
      console.log('📝 What you should see in the UI:');
      console.log(`   - Select "General Medicine" department`);
      console.log(`   - See: "Dr. ${doctors[0].user?.firstName} ${doctors[0].user?.lastName} - ${doctors[0].specialization} (₹${doctors[0].consultationFee})"`);
    }
    
    console.log('\n' + '='.repeat(60));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
