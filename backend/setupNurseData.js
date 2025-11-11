import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Admission from './models/Admission.js';
import Bed from './models/Bed.js';
import Nurse from './models/Nurse.js';

dotenv.config();

const setupData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');

    // Get patients
    const patients = await Patient.find().limit(5).populate('user');
    console.log(`📋 Total Patients: ${patients.length}\n`);

    if (patients.length === 0) {
      console.log('❌ No patients found');
      process.exit(1);
    }

    // Get beds
    let beds = await Bed.find({ wardNumber: 'Ward A' }).limit(5);
    console.log(`🛏️  Total Beds in Ward A: ${beds.length}\n`);

    // Get nurse
    const nurseUser = await User.findOne({ email: 'nurse1@hospital.com' });
    const nurse = await Nurse.findOne({ user: nurseUser._id });

    // Create admissions for 4 patients
    console.log('🏥 Creating Admissions...\n');
    
    for (let i = 0; i < 4 && i < patients.length && i < beds.length; i++) {
      const patient = patients[i];
      const bed = beds[i];

      // Check if already admitted
      const existing = await Admission.findOne({
        patient: patient._id,
        status: 'admitted'
      });

      if (existing) {
        console.log(`⏭️  Patient ${patient.user?.name || patient._id} already admitted`);
        continue;
      }

      const admission = await Admission.create({
        patient: patient._id,
        admissionDate: new Date(),
        reason: 'Routine medical observation and treatment',
        admittedBy: nurseUser._id,
        status: 'admitted',
        vitalsHistory: [{
          recordedBy: nurse._id,
          recordedAt: new Date(),
          temperature: 98.6 + (Math.random() * 2 - 1),
          bloodPressure: { 
            systolic: 120 + Math.floor(Math.random() * 20 - 10), 
            diastolic: 80 + Math.floor(Math.random() * 10 - 5)
          },
          heartRate: 75 + Math.floor(Math.random() * 10 - 5),
          respiratoryRate: 16 + Math.floor(Math.random() * 4 - 2),
          oxygenSaturation: 98 + Math.floor(Math.random() * 2)
        }]
      });

      // Update bed
      bed.status = 'occupied';
      bed.currentPatient = patient._id;
      await bed.save();

      // Assign to nurse
      if (!nurse.assignedPatients.some(ap => ap.patient.toString() === patient._id.toString())) {
        nurse.assignedPatients.push({
          patient: patient._id,
          assignedDate: new Date(),
          bedNumber: bed.bedNumber,
          status: 'active'
        });
      }

      console.log(`✅ Admitted: ${patient.user?.name || patient._id} → Bed ${bed.bedNumber}`);
    }

    // Update nurse
    nurse.assignedWard = 'Ward A';
    await nurse.save();

    console.log('\n✅ Nurse Assignment Summary:');
    console.log(`   Ward: ${nurse.assignedWard}`);
    console.log(`   Total Assigned Patients: ${nurse.assignedPatients.filter(ap => ap.status === 'active').length}`);
    console.log(`   Employee ID: ${nurse.employeeId}`);
    console.log(`   Shift: ${nurse.shiftTiming}`);

    console.log('\n🎉 Setup complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

setupData();
