import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const detailedTest = async () => {
  console.log('🔍 Detailed MongoDB Connection Test\n');
  console.log('Cluster:', 'hms.x7ljtzw.mongodb.net');
  console.log('Database:', 'hospital_management');
  console.log('Username:', 'romevernekar_db_user');
  console.log('\n⏳ Attempting connection (timeout: 30s)...\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ SUCCESS! MongoDB Connected');
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    console.log('Database:', mongoose.connection.name);
    console.log('Ready State:', mongoose.connection.readyState);
    
    await mongoose.connection.close();
    console.log('\n✅ Connection test passed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ CONNECTION FAILED\n');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    
    if (error.reason) {
      console.error('\nDetailed Reason:', error.reason);
    }
    
    console.error('\n🔍 Possible Causes:');
    console.error('1. ❌ Your network/firewall is blocking MongoDB Atlas (Port 27017)');
    console.error('   - College/corporate networks often block MongoDB');
    console.error('   - Try using mobile hotspot or different network');
    console.error('2. ❌ MongoDB cluster is paused/stopped in Atlas');
    console.error('   - Check: https://cloud.mongodb.com/ → Database → Status');
    console.error('3. ❌ Wrong password (you updated it, so verify it\'s correct)');
    console.error('4. ❌ Database user doesn\'t have correct permissions');
    console.error('   - Check: Database Access → romevernekar_db_user → Built-in Role: readWrite');
    
    console.error('\n💡 Quick Fix Options:');
    console.error('A. Switch to mobile hotspot and try again');
    console.error('B. Ask your network admin to unblock MongoDB Atlas');
    console.error('C. Use MongoDB Compass to test connection first');
    console.error('D. Try from a different network\n');
    
    process.exit(1);
  }
};

detailedTest();
