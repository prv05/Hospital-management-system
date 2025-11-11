import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('📋 ALL doctor users in database:\n');
    
    const doctors = await User.find({ role: 'doctor' }).sort({ createdAt: 1 });
    
    console.log(`Total: ${doctors.length}\n`);
    
    doctors.forEach((doc, index) => {
      const name = doc.firstName && doc.lastName ? `${doc.firstName} ${doc.lastName}` : doc.name || 'No Name';
      console.log(`${index + 1}. ${name}`);
      console.log(`   Email: ${doc.email}`);
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
