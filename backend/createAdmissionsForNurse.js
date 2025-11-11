import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Admission from './models/Admission.js';
import Nurse from './models/Nurse.js';
import Bed from './models/Bed.js';
import Patient from './models/Patient.js';
import Department from './models/Department.js';
import Doctor from './models/Doctor.js';
import { generateAdmissionId } from './utils/idGenerator.js';

dotenv.config();

const createAdmissionsAndAssign = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');

    // Get nurse
    const nurseUser = await User.findOne({ email: 'nurse1@hospital.com' });
    const nurse = await Nurse.findOne({ user: nurseUser._id });

    // Get some patients
    const patients = await Patient.find().limit(4);
    console.log(`📋 Found ${patients.length} patients\n`);

    // Get some beds
    const beds = await Bed.find({ status: 'vacant' }).limit(4);
    console.log(`🛏️  Found ${beds.length} vacant beds\n`);

    // Get a doctor
    const doctor = await Doctor.findOne();
    
    // Get a department
    const department = await Department.findOne();

    // Clear old admissions
    await Admission.deleteMany({ status: 'admitted' });

    // Create admissions
    console.log('🏥 Creating Admissions...\n');

    nurse.assignedPatients = [];
    nurse.assignedWard = 'Ward A';

    for (let i = 0; i < Math.min(4, patients.length, beds.length); i++) {
      const patient = patients[i];
      const bed = beds[i];

      const admission = await Admission.create({
        admissionId: generateAdmissionId(),
        patient: patient._id,
        doctor: doctor._id,
        department: department._id,
        bed: bed._id,
        admissionDate: new Date(),
        admissionType: 'Emergency',
        reasonForAdmission: 'Medical observation and treatment',
        status: 'admitted'
      });

      // Update bed
      bed.status = 'occupied';
      bed.currentPatient = patient._id;
      await bed.save();

      // Assign to nurse
      nurse.assignedPatients.push({
        patient: patient._id,
        assignedDate: new Date(),
        bedNumber: bed.bedNumber,
        status: 'active'
      });

      console.log(`✅ Created: Patient ${patient._id.toString().slice(-6)} → Bed ${bed.bedNumber}`);
    }

    await nurse.save();

    console.log('\n✅ Nurse Assignment Summary:');
    console.log(`   Nurse: ${nurseUser.email}`);
    console.log(`   Employee ID: ${nurse.employeeId}`);
    console.log(`   Ward: ${nurse.assignedWard}`);
    console.log(`   Shift: ${nurse.shiftTiming} (${nurse.currentShift?.start || 'Not Set'} - ${nurse.currentShift?.end || 'Not Set'})`);
    console.log(`   Assigned Patients: ${nurse.assignedPatients.length}`);

    console.log('\n🎉 Setup complete! Now login as nurse1@hospital.com (password: nurse123)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createAdmissionsAndAssign();
