import mongoose from 'mongoose';
import Department from './models/Department.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('🔍 Checking department isActive status...\n');
    
    const departments = await Department.find();
    console.log('📋 All Departments:');
    departments.forEach(d => {
      console.log(`  ${d.name}`);
      console.log(`    ID: ${d._id}`);
      console.log(`    isActive: ${d.isActive}`);
      console.log();
    });
    
    // Update all to be active
    const result = await Department.updateMany(
      {},
      { $set: { isActive: true } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} departments to be active`);
    
    // Verify
    const active = await Department.find({ isActive: true });
    console.log(`\n📋 Active departments: ${active.length}`);
    active.forEach(d => {
      console.log(`  - ${d.name} (${d._id})`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
