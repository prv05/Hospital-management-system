import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/database.js';

dotenv.config();

const checkUsers = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).select('email role firstName lastName isActive');
    
    console.log(`📊 Total Users: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database!');
      console.log('💡 Run: npm run seed\n');
    } else {
      console.log('👥 Users in database:\n');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log('');
      });
      
      // Test login credentials
      console.log('\n🔑 Test credentials for quick login:');
      const testUsers = users.slice(0, 5);
      testUsers.forEach(user => {
        console.log(`   ${user.role}: ${user.email}`);
      });
    }

    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
