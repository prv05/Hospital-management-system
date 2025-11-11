import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Prescription from './models/Prescription.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import User from './models/User.js';

dotenv.config();

const fixPrescriptionData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check patient and doctor structure
    const samplePatient = await Patient.findOne().populate('user');
    const sampleDoctor = await Doctor.findOne().populate('user');

    console.log('\n👤 Sample Patient:');
    console.log('Patient ID:', samplePatient?.patientId);
    console.log('User ID:', samplePatient?.user?._id);
    console.log('User Name:', samplePatient?.user?.name);

    console.log('\n👨‍⚕️ Sample Doctor:');
    console.log('Doctor ID:', sampleDoctor?.doctorId);
    console.log('User ID:', sampleDoctor?.user?._id);
    console.log('User Name:', sampleDoctor?.user?.name);
    console.log('Specialization:', sampleDoctor?.specialization);

    // Now test the full prescription query
    const prescription = await Prescription.findOne()
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      });

    console.log('\n📋 Populated Prescription:');
    console.log('Prescription ID:', prescription?.prescriptionId);
    console.log('Patient Name:', prescription?.patient?.user?.name);
    console.log('Patient ID:', prescription?.patient?.patientId);
    console.log('Doctor Name:', prescription?.doctor?.user?.name);
    console.log('Doctor Specialization:', prescription?.doctor?.specialization);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixPrescriptionData();
