import mongoose from 'mongoose';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';
import User from './models/User.js';

// Connect to Atlas (same as backend)
const MONGODB_URI = 'mongodb+srv://romevernekar_db_user:VlSdY0rYQOEYUSra@hms.x7ljtzw.mongodb.net/hospital_management?retryWrites=true&w=majority&appName=HMS';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas\n');
    console.log('='.repeat(60));
    
    // Get all departments
    const departments = await Department.find();
    console.log(`\n📋 Departments in Atlas (${departments.length}):`);
    departments.forEach(d => {
      console.log(`  ${d.name}: ${d._id} | isActive: ${d.isActive}`);
    });
    
    // Get all doctors
    const doctors = await Doctor.find()
      .populate('user', 'firstName lastName email')
      .populate('department', 'name');
    
    console.log(`\n👨‍⚕️ Doctors in Atlas (${doctors.length}):`);
    if (doctors.length === 0) {
      console.log('  ❌ NO DOCTORS IN ATLAS DATABASE!');
    } else {
      doctors.forEach(d => {
        console.log(`  Dr. ${d.user?.firstName || 'Unknown'} ${d.user?.lastName || ''}`);
        console.log(`    Department: ${d.department?.name || 'Unknown'} (${d.department?._id})`);
        console.log(`    Available: ${d.isAvailable}, On Leave: ${d.isOnLeave}`);
      });
    }
    
    // Get all users with doctor role
    const doctorUsers = await User.find({ role: 'doctor' });
    console.log(`\n👤 Doctor Users in Atlas (${doctorUsers.length}):`);
    doctorUsers.forEach(u => {
      console.log(`  ${u.firstName} ${u.lastName} | ${u.email}`);
    });
    
    console.log('\n' + '='.repeat(60));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
