import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LabTest from './models/LabTest.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import User from './models/User.js';

dotenv.config();

const fixLabTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Get all tests
    const allTests = await LabTest.find().populate('patient').populate('doctor');
    console.log(`📊 Found ${allTests.length} total tests\n`);

    // Find tests with missing patient or doctor
    const invalidTests = allTests.filter(test => !test.patient || !test.doctor);
    console.log(`🔍 Found ${invalidTests.length} tests with missing patient/doctor\n`);

    if (invalidTests.length > 0) {
      // Get all patients and doctors
      const patients = await Patient.find().populate('user');
      const doctors = await Doctor.find().populate('user');

      console.log(`👥 Found ${patients.length} patients, ${doctors.length} doctors\n`);

      // Update invalid tests with random patient/doctor
      for (const test of invalidTests) {
        const randomPatient = patients[Math.floor(Math.random() * patients.length)];
        const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
        
        test.patient = randomPatient._id;
        test.doctor = randomDoctor._id;
        await test.save();
        
        console.log(`✅ Updated ${test.testId}`);
      }

      console.log(`\n✅ Fixed ${invalidTests.length} tests\n`);
    }

    // Verify all tests now have valid data
    const verifyTests = await LabTest.find()
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .limit(10);

    console.log('📋 Sample Tests After Fix:\n');
    verifyTests.forEach((test, i) => {
      const patientName = test.patient?.user ? `${test.patient.user.firstName} ${test.patient.user.lastName}` : 'N/A';
      const doctorName = test.doctor?.user ? `Dr. ${test.doctor.user.firstName} ${test.doctor.user.lastName}` : 'N/A';
      console.log(`${i + 1}. ${test.testId} - ${test.testName} - ${patientName} - ${doctorName} - ₹${test.cost}`);
    });

    const stats = await LabTest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$cost' }
        }
      }
    ]);

    console.log('\n📊 Stats by Status:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} tests, ₹${stat.revenue}`);
    });

    const totalRevenue = await LabTest.aggregate([
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);

    console.log(`\n💰 Total Revenue: ₹${totalRevenue[0]?.total || 0}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixLabTestData();
