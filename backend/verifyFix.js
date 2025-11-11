import mongoose from 'mongoose';
import Doctor from './models/Doctor.js';
import User from './models/User.js';
import Department from './models/Department.js';

const MONGODB_URI = 'mongodb+srv://romevernekar_db_user:VlSdY0rYQOEYUSra@hms.x7ljtzw.mongodb.net/hospital_management?retryWrites=true&w=majority&appName=HMS';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Testing FIXED query\n');
    
    const departmentId = '691248fed48303ac0b3fbe43'; // General Medicine
    
    // OLD WAY (BROKEN)
    console.log('❌ OLD Query (string):');
    const oldQuery = { 
      isAvailable: true,
      isOnLeave: false,
      department: departmentId  // String
    };
    const oldResults = await Doctor.find(oldQuery);
    console.log(`   Found: ${oldResults.length} doctors\n`);
    
    // NEW WAY (FIXED)
    console.log('✅ NEW Query (ObjectId):');
    const newQuery = { 
      isAvailable: true,
      isOnLeave: false,
      department: new mongoose.Types.ObjectId(departmentId)  // ObjectId
    };
    const newResults = await Doctor.find(newQuery)
      .populate('user', 'firstName lastName email phone')
      .populate('department', 'name');
    console.log(`   Found: ${newResults.length} doctors\n`);
    
    if (newResults.length > 0) {
      console.log('📋 Doctors in General Medicine:');
      newResults.forEach((d, i) => {
        console.log(`  ${i + 1}. Dr. ${d.user?.firstName} ${d.user?.lastName}`);
        console.log(`     Specialization: ${d.specialization}`);
        console.log(`     Fee: ₹${d.consultationFee}`);
      });
    }
    
    console.log('\n✅ FIX CONFIRMED! Restart backend server now.');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
