import mongoose from 'mongoose';
import Doctor from './models/Doctor.js';

const MONGODB_URI = 'mongodb+srv://romevernekar_db_user:VlSdY0rYQOEYUSra@hms.x7ljtzw.mongodb.net/hospital_management?retryWrites=true&w=majority&appName=HMS';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Updating ALL doctors in Atlas database...\n');
    
    // Update all doctors to set isAvailable: true
    const result = await Doctor.updateMany(
      {},
      { 
        $set: { 
          isAvailable: true,
          isOnLeave: false
        } 
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} doctors`);
    console.log(`   Matched: ${result.matchedCount} doctors\n`);
    
    // Verify
    const doctors = await Doctor.find({
      isAvailable: true,
      isOnLeave: false
    }).populate('user', 'firstName lastName').populate('department', 'name');
    
    console.log(`📋 Doctors now available (${doctors.length}):\n`);
    
    // Group by department
    const byDept = {};
    doctors.forEach(d => {
      const deptName = d.department?.name || 'No Department';
      if (!byDept[deptName]) byDept[deptName] = [];
      byDept[deptName].push(`Dr. ${d.user?.firstName} ${d.user?.lastName}`);
    });
    
    Object.keys(byDept).sort().forEach(dept => {
      console.log(`${dept}:`);
      byDept[dept].forEach(name => console.log(`  - ${name}`));
      console.log();
    });
    
    console.log('✅ ALL DOCTORS NOW AVAILABLE FOR APPOINTMENTS!');
    console.log('🔄 RESTART YOUR BACKEND SERVER NOW!');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
