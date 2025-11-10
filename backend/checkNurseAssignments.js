import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Nurse from './models/Nurse.js';
import connectDB from './config/database.js';

dotenv.config();

const checkNurseAssignments = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Find nurse1@hospital.com
    const nurseUser = await User.findOne({ email: 'nurse1@hospital.com' });
    if (!nurseUser) {
      console.log('❌ Nurse user not found');
      return;
    }

    const nurse = await Nurse.findOne({ user: nurseUser._id })
      .populate({
        path: 'assignedPatients.patient',
        populate: { path: 'user' }
      });

    if (!nurse) {
      console.log('❌ Nurse profile not found');
      return;
    }

    console.log(`👩‍⚕️ Nurse: ${nurseUser.firstName} ${nurseUser.lastName}`);
    console.log(`📧 Email: ${nurseUser.email}`);
    console.log(`\n📊 Assigned Patients: ${nurse.assignedPatients.length}\n`);

    const activePatients = nurse.assignedPatients.filter(ap => ap.status === 'active');
    console.log(`Active Assignments: ${activePatients.length}\n`);

    if (activePatients.length > 0) {
      activePatients.forEach((assignment, idx) => {
        const patient = assignment.patient;
        console.log(`${idx + 1}. ${patient.user.firstName} ${patient.user.lastName}`);
        console.log(`   Patient ID: ${patient._id}`);
        console.log(`   Bed: ${assignment.bedNumber}`);
        console.log(`   Status: ${assignment.status}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No active patient assignments found!\n');
    }

    await mongoose.connection.close();
    console.log('👋 Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

checkNurseAssignments();
