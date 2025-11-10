import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Nurse from './models/Nurse.js';
import connectDB from './config/database.js';

dotenv.config();

const assignPatientsToNurse = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Find the nurse (Anjali Kumar - nurse1@hospital.com)
    const nurseUser = await User.findOne({ email: 'nurse1@hospital.com' });
    if (!nurseUser) {
      console.log('❌ Nurse user not found');
      return;
    }

    const nurse = await Nurse.findOne({ user: nurseUser._id });
    if (!nurse) {
      console.log('❌ Nurse profile not found');
      return;
    }

    console.log(`👩‍⚕️ Assigning patients to: ${nurseUser.firstName} ${nurseUser.lastName}\n`);

    // Get first 5 patients
    const patients = await Patient.find().limit(5).populate('user');
    
    if (patients.length === 0) {
      console.log('❌ No patients found in database');
      return;
    }

    console.log(`Found ${patients.length} patients to assign:\n`);

    // Assign patients to nurse
    const bedNumbers = ['101', '102', '103', '104', '105'];
    
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      
      // Check if already assigned
      const existingAssignment = nurse.assignedPatients.find(
        ap => ap.patient.toString() === patient._id.toString() && ap.status === 'active'
      );

      if (existingAssignment) {
        console.log(`⚠️  ${patient.user.firstName} ${patient.user.lastName} - Already assigned`);
        continue;
      }

      nurse.assignedPatients.push({
        patient: patient._id,
        assignedDate: new Date(),
        bedNumber: bedNumbers[i],
        status: 'active'
      });

      console.log(`✅ Assigned: ${patient.user.firstName} ${patient.user.lastName} - Bed ${bedNumbers[i]}`);
    }

    await nurse.save();

    console.log(`\n🎉 Successfully assigned ${patients.length} patients to nurse!`);
    console.log(`\n📊 Nurse now has ${nurse.assignedPatients.filter(ap => ap.status === 'active').length} active patients`);

    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

assignPatientsToNurse();
