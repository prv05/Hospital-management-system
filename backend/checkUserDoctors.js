import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('📋 Checking USERS with doctor role:\n');
    
    const doctors = await User.find({ role: 'doctor' }).sort({ createdAt: 1 });
    
    console.log(`Total Doctor Users: ${doctors.length}\n`);
    
    doctors.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.name}`);
      console.log(`   Email: ${doc.email}`);
      console.log(`   Phone: ${doc.phone}`);
      console.log(`   Department: ${doc.department}`);
      console.log(`   Created: ${doc.createdAt}`);
      console.log(`   ID: ${doc._id}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
