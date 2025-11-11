import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import LabTest from './models/LabTest.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const addLabTestData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected\n');

    // Get patients and doctors
    const patients = await Patient.find().populate('user').limit(10);
    const doctors = await Doctor.find().limit(5);

    if (patients.length === 0 || doctors.length === 0) {
      console.log('❌ No patients or doctors found. Please run seed data first.');
      process.exit(1);
    }

    console.log(`📊 Found ${patients.length} patients, ${doctors.length} doctors\n`);

    // Test categories and names
    const testData = [
      { category: 'Blood', tests: ['Complete Blood Count (CBC)', 'Hemoglobin Test', 'Blood Sugar (Fasting)', 'Blood Sugar (Random)', 'HbA1c Test', 'Lipid Profile', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Thyroid Profile (T3, T4, TSH)'] },
      { category: 'Urine', tests: ['Urine Routine & Microscopy', 'Urine Culture & Sensitivity', 'Urine Pregnancy Test', '24-Hour Urine Protein'] },
      { category: 'Radiology', tests: ['Chest X-Ray', 'Abdomen X-Ray', 'Skeletal X-Ray'] },
      { category: 'CT Scan', tests: ['CT Brain', 'CT Chest', 'CT Abdomen', 'CT Whole Body'] },
      { category: 'MRI', tests: ['MRI Brain', 'MRI Spine', 'MRI Knee', 'MRI Full Body'] },
      { category: 'Ultrasound', tests: ['USG Abdomen', 'USG Pelvis', 'USG Pregnancy', 'USG Doppler'] },
      { category: 'ECG', tests: ['Resting ECG', '2D Echo', 'Stress Test ECG', 'Holter Monitoring'] },
      { category: 'Stool', tests: ['Stool Routine', 'Stool Culture', 'Occult Blood Test'] },
      { category: 'Biopsy', tests: ['Tissue Biopsy', 'Bone Marrow Biopsy', 'Fine Needle Aspiration'] },
      { category: 'Other', tests: ['COVID-19 RT-PCR', 'Dengue NS1', 'Malaria Test', 'Tuberculosis Test'] }
    ];

    const urgencyLevels = ['routine', 'urgent', 'stat'];
    const statuses = ['requested', 'sample-collected', 'in-process', 'completed'];

    const labTests = [];

    // Create 30 lab tests with different statuses
    for (let i = 0; i < 30; i++) {
      const category = testData[i % testData.length];
      const testName = category.tests[Math.floor(Math.random() * category.tests.length)];
      const patient = patients[i % patients.length];
      const doctor = doctors[i % doctors.length];
      const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Cost based on test type
      let cost = 200;
      if (category.category === 'CT Scan' || category.category === 'MRI') cost = Math.floor(Math.random() * 3000) + 2000;
      else if (category.category === 'Ultrasound' || category.category === 'Radiology') cost = Math.floor(Math.random() * 1000) + 500;
      else if (category.category === 'Blood') cost = Math.floor(Math.random() * 800) + 200;
      else if (category.category === 'ECG') cost = Math.floor(Math.random() * 1500) + 800;
      else if (category.category === 'Biopsy') cost = Math.floor(Math.random() * 2000) + 1000;
      else cost = Math.floor(Math.random() * 600) + 200;

      const test = new LabTest({
        testId: `LAB${String(Date.now() + i).slice(-6)}`,
        patient: patient._id,
        doctor: doctor._id,
        testName,
        testCategory: category.category,
        urgency,
        status,
        cost,
        paymentStatus: status === 'completed' ? 'paid' : Math.random() > 0.5 ? 'paid' : 'pending',
        normalRange: category.category === 'Blood' ? '12-16 g/dL' : 'Normal',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
      });

      // Add sample collection details if status is beyond requested
      if (status !== 'requested') {
        test.sampleCollectedAt = new Date(test.createdAt.getTime() + 30 * 60 * 1000);
        test.sampleCollectedBy = doctors[0]._id;
      }

      // Add completion details if completed
      if (status === 'completed') {
        test.completedAt = new Date(test.createdAt.getTime() + 2 * 60 * 60 * 1000);
        test.results = [
          {
            parameter: testName.includes('Blood') ? 'Hemoglobin' : 'Result',
            value: testName.includes('Blood') ? '14.5' : 'Normal',
            unit: testName.includes('Blood') ? 'g/dL' : '',
            normalRange: '12-16'
          }
        ];
        test.interpretation = 'Normal';
        test.reportedBy = doctors[0]._id;
      }

      labTests.push(test);
    }

    const savedTests = await LabTest.insertMany(labTests);
    console.log(`✅ Created ${savedTests.length} lab tests\n`);

    // Update patient lab reports
    for (const test of savedTests) {
      await Patient.findByIdAndUpdate(test.patient, {
        $addToSet: { labReports: test._id }
      });
    }

    // Statistics
    const byStatus = {};
    statuses.forEach(status => {
      byStatus[status] = savedTests.filter(t => t.status === status).length;
    });

    const byCategory = {};
    testData.forEach(cat => {
      byCategory[cat.category] = savedTests.filter(t => t.testCategory === cat.category).length;
    });

    console.log('📊 Tests by Status:');
    Object.keys(byStatus).forEach(status => {
      console.log(`   ${status}: ${byStatus[status]}`);
    });

    console.log('\n📊 Tests by Category:');
    Object.keys(byCategory).forEach(category => {
      console.log(`   ${category}: ${byCategory[category]}`);
    });

    const totalRevenue = savedTests.filter(t => t.paymentStatus === 'paid').reduce((sum, t) => sum + t.cost, 0);
    console.log(`\n💰 Total Revenue: ₹${totalRevenue.toLocaleString()}`);

    console.log('\n📄 Sample Tests:');
    savedTests.slice(0, 5).forEach(test => {
      const patientName = patients.find(p => p._id.equals(test.patient))?.user?.firstName || 'Unknown';
      console.log(`   ${test.testId}: ${test.testName} - ${test.status} - ${patientName}`);
    });

    console.log('\n✅ Lab test data added successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addLabTestData();
