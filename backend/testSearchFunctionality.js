import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Billing from './models/Billing.js';
import Patient from './models/Patient.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const testSearch = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected\n');

    console.log('🔍 Testing Search Functionality:\n');

    // Test 1: Search by Bill ID
    console.log('1. Search by Bill ID (BILL739):');
    const billSearch = await Billing.find({ billId: /BILL739/i })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName' }
      });
    console.log(`   Found ${billSearch.length} bills`);
    billSearch.slice(0, 3).forEach(bill => {
      console.log(`   - ${bill.billId} (${bill.billType})`);
    });

    // Test 2: Search by Bill Type
    console.log('\n2. Search by Bill Type (Emergency):');
    const emergencyBills = await Billing.find({ billType: 'Emergency' })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName' }
      });
    console.log(`   Found ${emergencyBills.length} Emergency bills`);
    emergencyBills.forEach(bill => {
      const name = bill.patient?.user ? 
        `${bill.patient.user.firstName} ${bill.patient.user.lastName}` : 
        'Unknown';
      console.log(`   - ${bill.billId}: ${name} - ₹${bill.totalAmount.toFixed(2)} (${bill.paymentStatus})`);
    });

    // Test 3: Search by Bill Type
    console.log('\n3. Search by Bill Type (IPD):');
    const ipdBills = await Billing.find({ billType: 'IPD' })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName' }
      });
    console.log(`   Found ${ipdBills.length} IPD bills`);
    ipdBills.forEach(bill => {
      const name = bill.patient?.user ? 
        `${bill.patient.user.firstName} ${bill.patient.user.lastName}` : 
        'Unknown';
      console.log(`   - ${bill.billId}: ${name} - ₹${bill.totalAmount.toFixed(2)} (${bill.paymentStatus})`);
    });

    // Test 4: Get sample patient names for frontend search
    console.log('\n4. Sample Patient Names (for testing search):');
    const patients = await Patient.find()
      .populate('user', 'firstName lastName')
      .limit(10);
    patients.slice(0, 5).forEach(patient => {
      if (patient.user) {
        console.log(`   - ${patient.user.firstName} ${patient.user.lastName} (${patient.patientId})`);
      }
    });

    // Test 5: Verify bills have patient data
    console.log('\n5. Verify Bills Have Complete Patient Data:');
    const sampleBill = await Billing.findOne({ billType: 'Emergency' })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName phone email' }
      });
    
    if (sampleBill) {
      console.log(`   Bill ID: ${sampleBill.billId}`);
      console.log(`   Patient: ${sampleBill.patient?.user?.firstName} ${sampleBill.patient?.user?.lastName}`);
      console.log(`   Patient ID: ${sampleBill.patient?.patientId}`);
      console.log(`   Phone: ${sampleBill.patient?.user?.phone}`);
      console.log(`   Bill Type: ${sampleBill.billType}`);
      console.log(`   Amount: ₹${sampleBill.totalAmount.toFixed(2)}`);
      console.log(`   Status: ${sampleBill.paymentStatus}`);
    }

    console.log('\n✅ Search tests complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testSearch();
