import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('📋 Looking for original doctors:\n');
    
    // Find doctors with dr. prefix in email
    const originalDoctors = await User.find({ 
      role: 'doctor', 
      email: { $regex: '^dr\\.' } 
    }).sort({ createdAt: 1 });
    
    console.log(`Doctors with "dr." email prefix: ${originalDoctors.length}\n`);
    
    originalDoctors.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.name}`);
      console.log(`   Email: ${doc.email}`);
      console.log(`   Phone: ${doc.phone}`);
      console.log(`   Created: ${doc.createdAt}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
