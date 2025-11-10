import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Admission from './models/Admission.js';
import Patient from './models/Patient.js';
import Nurse from './models/Nurse.js';
import connectDB from './config/database.js';

dotenv.config();

const checkData = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Check admissions
    const admissions = await Admission.find({ status: 'admitted' })
      .populate('patient')
      .populate('doctor')
      .populate('bed');
    
    console.log(`📊 Active Admissions: ${admissions.length}\n`);
    
    if (admissions.length > 0) {
      console.log('Active Admissions:');
      admissions.forEach((adm, idx) => {
        console.log(`${idx + 1}. Patient ID: ${adm.patient?._id}`);
        console.log(`   Bed: ${adm.bed?.bedNumber || 'Not assigned'}`);
        console.log(`   Ward: ${adm.ward || 'N/A'}`);
        console.log('');
      });
    }

    // Check nurses
    const nurses = await Nurse.find()
      .populate('user')
      .populate('assignedPatients.patient');
    
    console.log(`👩‍⚕️ Total Nurses: ${nurses.length}\n`);
    
    nurses.forEach((nurse, idx) => {
      console.log(`${idx + 1}. ${nurse.user?.firstName} ${nurse.user?.lastName}`);
      console.log(`   ID: ${nurse._id}`);
      console.log(`   Assigned Patients: ${nurse.assignedPatients.filter(ap => ap.status === 'active').length}`);
      console.log('');
    });

    // Check patients
    const patients = await Patient.find().populate('user');
    console.log(`🤒 Total Patients: ${patients.length}\n`);
    
    await mongoose.connection.close();
    console.log('👋 Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkData();
