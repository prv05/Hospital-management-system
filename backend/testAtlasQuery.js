import mongoose from 'mongoose';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';
import User from './models/User.js';

const MONGODB_URI = 'mongodb+srv://romevernekar_db_user:VlSdY0rYQOEYUSra@hms.x7ljtzw.mongodb.net/hospital_management?retryWrites=true&w=majority&appName=HMS';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Testing exact query from backend\n');
    
    const generalMedId = '691248fed48303ac0b3fbe43';
    
    console.log(`🔍 Querying for department: ${generalMedId}\n`);
    
    // Exact query from backend
    const query = { 
      isAvailable: true,
      isOnLeave: false,
      department: generalMedId
    };
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
    const doctors = await Doctor.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('department', 'name');
    
    console.log(`\n✅ Found ${doctors.length} doctors\n`);
    
    doctors.forEach((d, i) => {
      console.log(`${i + 1}. Dr. ${d.user?.firstName} ${d.user?.lastName}`);
      console.log(`   Department: ${d.department?.name}`);
      console.log(`   Specialization: ${d.specialization}`);
      console.log(`   Available: ${d.isAvailable}, On Leave: ${d.isOnLeave}`);
    });
    
    if (doctors.length === 0) {
      console.log('\n❌ NO DOCTORS FOUND!');
      console.log('\nLet me check what doctors exist for this department...');
      
      const allDoctors = await Doctor.find({ department: generalMedId });
      console.log(`\nDoctors with this department (ignoring availability): ${allDoctors.length}`);
      
      if (allDoctors.length > 0) {
        allDoctors.forEach(d => {
          console.log(`  - isAvailable: ${d.isAvailable}, isOnLeave: ${d.isOnLeave}`);
        });
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
