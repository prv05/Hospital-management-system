import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LabTest from './models/LabTest.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import User from './models/User.js';

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const tests = await LabTest.find()
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .limit(5);

    console.log(`📊 Found ${tests.length} tests (showing first 5):\n`);

    tests.forEach((test, index) => {
      console.log(`Test ${index + 1}:`);
      console.log(`  ID: ${test.testId}`);
      console.log(`  Name: ${test.testName}`);
      console.log(`  Category: ${test.testCategory}`);
      console.log(`  Patient: ${test.patient?.user ? `${test.patient.user.firstName} ${test.patient.user.lastName}` : 'N/A'}`);
      console.log(`  Doctor: ${test.doctor?.user ? `Dr. ${test.doctor.user.firstName} ${test.doctor.user.lastName}` : 'N/A'}`);
      console.log(`  Cost: ₹${test.cost}`);
      console.log(`  Status: ${test.status}`);
      console.log(`  Urgency: ${test.urgency}`);
      console.log(`  Date: ${test.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    const totalCost = await LabTest.aggregate([
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);

    console.log(`💰 Total Revenue: ₹${totalCost[0]?.total || 0}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkData();
