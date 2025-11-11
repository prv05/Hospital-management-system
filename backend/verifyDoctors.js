import mongoose from 'mongoose';
import User from './models/User.js';
import Department from './models/Department.js';
import Doctor from './models/Doctor.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const doctors = await Doctor.find({ isAvailable: true })
      .populate('user', 'firstName lastName')
      .populate('department', 'name');
    
    console.log(`\n📊 Available doctors: ${doctors.length}\n`);
    
    doctors.forEach(d => {
      console.log({
        name: `Dr. ${d.user?.firstName} ${d.user?.lastName}`,
        department: d.department?.name,
        specialization: d.specialization,
        fee: `₹${d.consultationFee}`,
        available: d.isAvailable
      });
    });
    
    // Group by department
    console.log('\n📋 Doctors by Department:\n');
    const byDept = {};
    doctors.forEach(d => {
      const deptName = d.department?.name || 'Unknown';
      if (!byDept[deptName]) byDept[deptName] = [];
      byDept[deptName].push(`Dr. ${d.user?.firstName} ${d.user?.lastName}`);
    });
    
    Object.entries(byDept).forEach(([dept, docs]) => {
      console.log(`${dept}: ${docs.length} doctor(s)`);
      docs.forEach(doc => console.log(`  - ${doc}`));
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
