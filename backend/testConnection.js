import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Create a simple test collection
    const TestSchema = new mongoose.Schema({
      name: String,
      message: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('Test', TestSchema);
    
    // Clear any existing test data
    await Test.deleteMany({});
    console.log('\n🗑️  Cleared existing test data');
    
    // Insert test documents
    console.log('📝 Inserting test data...');
    
    const testData = [
      { name: 'Test User 1', message: 'Hello from MongoDB!' },
      { name: 'Test User 2', message: 'Connection is working!' },
      { name: 'Test User 3', message: 'Hospital Management System is ready!' }
    ];
    
    const result = await Test.insertMany(testData);
    console.log(`✅ Successfully inserted ${result.length} test documents`);
    
    // Retrieve and display the data
    console.log('\n📖 Reading test data from database...');
    const documents = await Test.find({});
    
    console.log('\n📋 Retrieved Documents:');
    documents.forEach((doc, index) => {
      console.log(`\n${index + 1}. ${doc.name}`);
      console.log(`   Message: ${doc.message}`);
      console.log(`   Created: ${doc.createdAt.toLocaleString()}`);
      console.log(`   ID: ${doc._id}`);
    });
    
    console.log('\n✨ Test completed successfully!');
    console.log('🎉 Your MongoDB Atlas connection is working perfectly!\n');
    
    // Close connection
    await mongoose.connection.close();
    console.log('👋 Connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Error:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Check if your IP address is whitelisted in MongoDB Atlas');
    console.error('   - Go to: https://cloud.mongodb.com/');
    console.error('   - Navigate to: Network Access');
    console.error('   - Add IP: 103.213.211.203 or 0.0.0.0/0 (allow all)');
    console.error('2. Verify your MongoDB URI in .env file');
    console.error('3. Check your MongoDB Atlas cluster is running');
    console.error('4. Verify username and password are correct\n');
    process.exit(1);
  }
};

testConnection();
