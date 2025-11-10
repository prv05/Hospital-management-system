import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Nurse from './models/Nurse.js';
import Bed from './models/Bed.js';
import connectDB from './config/database.js';

dotenv.config();

const assignToNurse1 = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Find nurse1@hospital.com
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

    // Get occupied beds (admitted patients)
    const occupiedBeds = await Bed.find({ status: 'occupied' })
      .populate('currentPatient');

    if (occupiedBeds.length === 0) {
      console.log('❌ No admitted patients found. Run setupAdmissions.js first.');
      return;
    }

    console.log(`Found ${occupiedBeds.length} admitted patients\n`);

    // Clear existing assignments for this nurse
    nurse.assignedPatients = [];

    // Assign all admitted patients to this nurse
    for (const bed of occupiedBeds) {
      if (bed.currentPatient) {
        nurse.assignedPatients.push({
          patient: bed.currentPatient._id,
          assignedDate: new Date(),
          bedNumber: bed.bedNumber,
          status: 'active'
        });

        // Update bed with assigned nurse
        await Bed.findByIdAndUpdate(bed._id, {
          assignedNurse: nurseUser._id
        });

        console.log(`✅ Assigned: Bed ${bed.bedNumber}`);
      }
    }

    await nurse.save();

    console.log(`\n🎉 Successfully assigned ${nurse.assignedPatients.length} patients to ${nurseUser.firstName}!`);

    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

assignToNurse1();
