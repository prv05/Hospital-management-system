import mongoose from 'mongoose';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';
import User from './models/User.js';

const MONGODB_URI = 'mongodb+srv://romevernekar_db_user:VlSdY0rYQOEYUSra@hms.x7ljtzw.mongodb.net/hospital_management?retryWrites=true&w=majority&appName=HMS';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ FINAL SYSTEM CHECK\n');
    console.log('='.repeat(70));
    
    // Check all departments
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    console.log(`\n📋 Active Departments: ${departments.length}`);
    
    // Check doctors by department
    console.log('\n👨‍⚕️ Doctors Available by Department:\n');
    
    for (const dept of departments) {
      const doctors = await Doctor.find({
        department: dept._id,
        isAvailable: true,
        isOnLeave: false
      }).populate('user', 'firstName lastName');
      
      console.log(`${dept.name} (${dept._id}):`);
      if (doctors.length === 0) {
        console.log('  ❌ NO DOCTORS AVAILABLE');
      } else {
        doctors.forEach(d => {
          console.log(`  ✅ Dr. ${d.user?.firstName} ${d.user?.lastName} (₹${d.consultationFee})`);
        });
      }
      console.log();
    }
    
    console.log('='.repeat(70));
    console.log('\n🎯 SYSTEM READY FOR TESTING!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Restart backend: node server.js');
    console.log('   2. Refresh browser (Ctrl+Shift+R)');
    console.log('   3. Go to Book Appointment');
    console.log('   4. Select any department');
    console.log('   5. Doctors should appear in dropdown!');
    console.log('\n' + '='.repeat(70));
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
