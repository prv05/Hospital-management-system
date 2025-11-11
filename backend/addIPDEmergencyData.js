import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Billing from './models/Billing.js';
import Patient from './models/Patient.js';
import Admission from './models/Admission.js';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';
import Bed from './models/Bed.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const addIPDEmergencyData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('❌ MONGO_URI not found in .env file');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');

    // Get existing data
    const patients = await Patient.find().limit(10);
    const doctors = await Doctor.find().limit(5);
    const departments = await Department.find();
    const beds = await Bed.find({ status: 'available' }).limit(5);
    const billingStaff = await User.findOne({ role: 'billing' });

    if (patients.length === 0 || doctors.length === 0) {
      console.log('❌ No patients or doctors found. Please run seed data first.');
      process.exit(1);
    }

    console.log(`\n📊 Found ${patients.length} patients, ${doctors.length} doctors`);

    // Emergency Department
    let emergencyDept = departments.find(d => d.name === 'Emergency');
    if (!emergencyDept && departments.length > 0) {
      emergencyDept = departments[0];
    }

    // Create Admissions
    const admissions = [];
    
    // IPD Admissions
    for (let i = 0; i < 5; i++) {
      const patient = patients[i % patients.length];
      const doctor = doctors[i % doctors.length];
      const bed = beds[i % beds.length];
      
      const admission = new Admission({
        admissionId: `ADM${String(Date.now() + i).slice(-6)}`,
        patient: patient._id,
        doctor: doctor._id,
        department: emergencyDept?._id || departments[0]._id,
        bed: bed?._id || new mongoose.Types.ObjectId(),
        admissionType: 'Scheduled',
        admissionDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
        status: i < 3 ? 'admitted' : 'discharged',
        reasonForAdmission: [
          'Post-surgery observation',
          'Pneumonia treatment',
          'Diabetes management',
          'Cardiac monitoring',
          'Recovery after accident'
        ][i],
        provisionalDiagnosis: [
          'Post-operative care',
          'Respiratory infection',
          'Type 2 Diabetes',
          'Arrhythmia',
          'Multiple fractures'
        ][i],
        dischargeDate: i >= 3 ? new Date(Date.now() - i * 12 * 60 * 60 * 1000) : undefined
      });

      admissions.push(admission);
    }

    // Emergency Admissions
    for (let i = 0; i < 3; i++) {
      const patient = patients[(i + 5) % patients.length];
      const doctor = doctors[i % doctors.length];
      
      const admission = new Admission({
        admissionId: `ADM${String(Date.now() + 100 + i).slice(-6)}`,
        patient: patient._id,
        doctor: doctor._id,
        department: emergencyDept?._id || departments[0]._id,
        bed: beds[0]?._id || new mongoose.Types.ObjectId(),
        admissionType: 'Emergency',
        admissionDate: new Date(Date.now() - i * 6 * 60 * 60 * 1000),
        status: 'admitted',
        reasonForAdmission: [
          'Acute chest pain',
          'Road traffic accident',
          'Severe abdominal pain'
        ][i],
        provisionalDiagnosis: [
          'Possible MI',
          'Multiple trauma',
          'Acute appendicitis'
        ][i]
      });

      admissions.push(admission);
    }

    const savedAdmissions = await Admission.insertMany(admissions);
    console.log(`\n✅ Created ${savedAdmissions.length} admissions (${savedAdmissions.filter(a => a.admissionType === 'Emergency').length} Emergency, ${savedAdmissions.filter(a => a.admissionType === 'Scheduled').length} IPD)`);

    // Create IPD Bills
    const ipdBills = [];
    for (let i = 0; i < 5; i++) {
      const admission = savedAdmissions[i];
      const days = Math.floor((Date.now() - admission.admissionDate) / (24 * 60 * 60 * 1000)) + 1;
      
      const roomCharges = days * 2000;
      const nursingCharges = days * 500;
      const medicineCharges = Math.floor(Math.random() * 5000) + 3000;
      const labCharges = Math.floor(Math.random() * 3000) + 2000;
      const consultationCharges = days * 1000;
      
      const items = [
        {
          itemType: 'room-charge',
          description: `Room charges (${days} days)`,
          quantity: days,
          unitPrice: 2000,
          totalPrice: roomCharges
        },
        {
          itemType: 'nursing',
          description: `Nursing care (${days} days)`,
          quantity: days,
          unitPrice: 500,
          totalPrice: nursingCharges
        },
        {
          itemType: 'medicine',
          description: 'Medications and drugs',
          quantity: 1,
          unitPrice: medicineCharges,
          totalPrice: medicineCharges
        },
        {
          itemType: 'lab-test',
          description: 'Laboratory tests',
          quantity: 1,
          unitPrice: labCharges,
          totalPrice: labCharges
        },
        {
          itemType: 'consultation',
          description: `Doctor consultations (${days} visits)`,
          quantity: days,
          unitPrice: 1000,
          totalPrice: consultationCharges
        }
      ];

      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const discount = Math.floor(subtotal * 0.05); // 5% discount
      const totalAmount = subtotal - discount;
      const amountPaid = admission.status === 'discharged' ? totalAmount : Math.floor(totalAmount * 0.5);

      const bill = new Billing({
        billId: `BILL${String(Date.now() + 1000 + i).slice(-6)}`,
        patient: admission.patient,
        billType: 'IPD',
        billDate: admission.admissionDate,
        admission: admission._id,
        items,
        subtotal,
        discount: {
          amount: discount,
          percentage: 5,
          reason: 'Standard IPD discount'
        },
        totalAmount,
        amountPaid,
        balanceAmount: totalAmount - amountPaid,
        paymentStatus: amountPaid === totalAmount ? 'paid' : amountPaid > 0 ? 'partial' : 'pending',
        paymentHistory: amountPaid > 0 ? [{
          amount: amountPaid,
          date: new Date(),
          method: 'card',
          transactionId: `TXN${Date.now()}`,
          receivedBy: doctors[0]?._id
        }] : [],
        generatedBy: billingStaff?._id || doctors[0]?._id,
        insuranceCovered: 0
      });

      ipdBills.push(bill);
    }

    // Create Emergency Bills
    const emergencyBills = [];
    for (let i = 5; i < 8; i++) {
      const admission = savedAdmissions[i];
      
      const emergencyCharges = 5000;
      const consultationCharges = 2000;
      const medicineCharges = Math.floor(Math.random() * 3000) + 2000;
      const labCharges = Math.floor(Math.random() * 2000) + 1500;
      const procedureCharges = Math.floor(Math.random() * 10000) + 5000;
      
      const items = [
        {
          itemType: 'other',
          description: 'Emergency admission charges',
          quantity: 1,
          unitPrice: emergencyCharges,
          totalPrice: emergencyCharges
        },
        {
          itemType: 'consultation',
          description: 'Emergency doctor consultation',
          quantity: 1,
          unitPrice: consultationCharges,
          totalPrice: consultationCharges
        },
        {
          itemType: 'procedure',
          description: 'Emergency procedures',
          quantity: 1,
          unitPrice: procedureCharges,
          totalPrice: procedureCharges
        },
        {
          itemType: 'medicine',
          description: 'Emergency medications',
          quantity: 1,
          unitPrice: medicineCharges,
          totalPrice: medicineCharges
        },
        {
          itemType: 'lab-test',
          description: 'Emergency lab tests',
          quantity: 1,
          unitPrice: labCharges,
          totalPrice: labCharges
        }
      ];

      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalAmount = subtotal;
      const amountPaid = Math.floor(totalAmount * 0.3); // 30% paid initially

      const bill = new Billing({
        billId: `BILL${String(Date.now() + 2000 + i).slice(-6)}`,
        patient: admission.patient,
        billType: 'Emergency',
        billDate: admission.admissionDate,
        admission: admission._id,
        items,
        subtotal,
        totalAmount,
        amountPaid,
        balanceAmount: totalAmount - amountPaid,
        paymentStatus: 'partial',
        paymentHistory: [{
          amount: amountPaid,
          date: new Date(),
          method: 'cash',
          transactionId: `TXN${Date.now() + i}`,
          receivedBy: doctors[0]?._id
        }],
        generatedBy: billingStaff?._id || doctors[0]?._id,
        insuranceCovered: 0
      });

      emergencyBills.push(bill);
    }

    const savedIPDBills = await Billing.insertMany(ipdBills);
    const savedEmergencyBills = await Billing.insertMany(emergencyBills);

    console.log(`\n✅ Created ${savedIPDBills.length} IPD bills`);
    console.log(`✅ Created ${savedEmergencyBills.length} Emergency bills`);

    // Calculate totals
    const ipdRevenue = savedIPDBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const emergencyRevenue = savedEmergencyBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const ipdPending = savedIPDBills.reduce((sum, b) => sum + b.balanceAmount, 0);
    const emergencyPending = savedEmergencyBills.reduce((sum, b) => sum + b.balanceAmount, 0);

    console.log(`\n📊 IPD Revenue: ₹${ipdRevenue.toLocaleString()} (Pending: ₹${ipdPending.toLocaleString()})`);
    console.log(`📊 Emergency Revenue: ₹${emergencyRevenue.toLocaleString()} (Pending: ₹${emergencyPending.toLocaleString()})`);

    // Sample bill details
    console.log('\n📄 Sample IPD Bill:');
    const sampleIPD = savedIPDBills[0];
    console.log(`   Bill ID: ${sampleIPD.billId}`);
    console.log(`   Type: ${sampleIPD.billType}`);
    console.log(`   Total: ₹${sampleIPD.totalAmount}`);
    console.log(`   Status: ${sampleIPD.paymentStatus}`);

    console.log('\n📄 Sample Emergency Bill:');
    const sampleEmergency = savedEmergencyBills[0];
    console.log(`   Bill ID: ${sampleEmergency.billId}`);
    console.log(`   Type: ${sampleEmergency.billType}`);
    console.log(`   Total: ₹${sampleEmergency.totalAmount}`);
    console.log(`   Status: ${sampleEmergency.paymentStatus}`);

    console.log('\n✅ IPD and Emergency data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addIPDEmergencyData();
