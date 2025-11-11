import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Nurse from './models/Nurse.js';
import Department from './models/Department.js';

dotenv.config();

const checkNurses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');

    const nurses = await User.find({ role: 'nurse' });
    console.log('📋 Total Nurses:', nurses.length, '\n');

    for (const user of nurses) {
      const nurseProfile = await Nurse.findOne({ user: user._id });
      
      console.log('👤 Nurse:', user.name);
      console.log('   Email:', user.email);
      console.log('   ID:', user._id);
      if (nurseProfile) {
        console.log('   Employee ID:', nurseProfile.employeeId);
        console.log('   Shift:', nurseProfile.shiftTiming);
        console.log('   Ward:', nurseProfile.assignedWard || 'Not assigned');
        console.log('   Assigned Patients:', nurseProfile.assignedPatients.length);
      } else {
        console.log('   ⚠️  No nurse profile found!');
      }
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

checkNurses();
