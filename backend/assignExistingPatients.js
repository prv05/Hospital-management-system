import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Admission from './models/Admission.js';
import Nurse from './models/Nurse.js';
import Bed from './models/Bed.js';
import Patient from './models/Patient.js';
import Department from './models/Department.js';
import Doctor from './models/Doctor.js';

dotenv.config();

const assignExistingPatients = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');

    // Get nurse
    const nurseUser = await User.findOne({ email: 'nurse1@hospital.com' });
    const nurse = await Nurse.findOne({ user: nurseUser._id });

    // Get admitted patients
    const admissions = await Admission.find({ status: 'admitted' })
      .populate('patient')
      .populate('bed')
      .limit(5);

    console.log(`📋 Found ${admissions.length} admitted patients\n`);

    if (admissions.length === 0) {
      console.log('❌ No admitted patients found');
      process.exit(1);
    }

    // Clear existing assignments
    nurse.assignedPatients = [];
    nurse.assignedWard = 'Ward A';

    // Assign patients to nurse
    for (const admission of admissions) {
      if (!admission.patient) {
        console.log('⏭️  Skipping admission with no patient');
        continue;
      }

      const bedInfo = admission.bed;
      
      nurse.assignedPatients.push({
        patient: admission.patient._id,
        assignedDate: new Date(),
        bedNumber: bedInfo?.bedNumber || 'A-101',
        status: 'active'
      });

      console.log(`✅ Assigned: Patient ${admission.patient._id} → Bed ${bedInfo?.bedNumber || 'Unknown'}`);
    }

    await nurse.save();

    console.log('\n✅ Nurse Assignment Summary:');
    console.log(`   Nurse: ${nurseUser.email}`);
    console.log(`   Employee ID: ${nurse.employeeId}`);
    console.log(`   Ward: ${nurse.assignedWard}`);
    console.log(`   Shift: ${nurse.shiftTiming} (${nurse.currentShift?.start || 'Not Set'} - ${nurse.currentShift?.end || 'Not Set'})`);
    console.log(`   Assigned Patients: ${nurse.assignedPatients.length}`);

    console.log('\n🎉 Assignment complete! Now refresh the nurse dashboard.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

assignExistingPatients();
