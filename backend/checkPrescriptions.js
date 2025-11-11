import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Prescription from './models/Prescription.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import User from './models/User.js';

dotenv.config();

const checkPrescriptions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get counts
    const totalPrescriptions = await Prescription.countDocuments();
    console.log(`\n📋 Total Prescriptions: ${totalPrescriptions}`);

    // Get sample prescription
    const sample = await Prescription.findOne()
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      });

    if (sample) {
      console.log('\n📄 Sample Prescription:');
      console.log('ID:', sample.prescriptionId);
      console.log('Patient:', sample.patient?.user?.name || 'N/A');
      console.log('Patient ID:', sample.patient?.patientId || 'N/A');
      console.log('Doctor:', sample.doctor?.user?.name || 'N/A');
      console.log('Diagnosis:', sample.diagnosis);
      console.log('Medicines:', sample.medicines?.length || 0);
      console.log('Is Dispensed:', sample.isDispensed);
    }

    // Get all prescriptions
    const allPrescriptions = await Prescription.find()
      .populate('patient doctor')
      .limit(5);

    console.log('\n📋 First 5 Prescriptions:');
    allPrescriptions.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.prescriptionId}`);
      console.log('   Patient ObjectId:', p.patient?._id || 'Missing');
      console.log('   Doctor ObjectId:', p.doctor?._id || 'Missing');
    });

    // Count patients and doctors
    const patientCount = await Patient.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    console.log(`\n👥 Total Patients: ${patientCount}`);
    console.log(`👨‍⚕️ Total Doctors: ${doctorCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkPrescriptions();
