import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Nurse from './models/Nurse.js';
import Patient from './models/Patient.js';
import Admission from './models/Admission.js';
import Bed from './models/Bed.js';
import User from './models/User.js';
import Department from './models/Department.js';

dotenv.config();

const assignPatientsAndBeds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');

    // Find Anjali Kumar (nurse)
    const nurseUser = await User.findOne({ email: 'nurse1@hospital.com' });
    if (!nurseUser) {
      console.log('❌ Nurse user not found');
      process.exit(1);
    }

    const nurse = await Nurse.findOne({ user: nurseUser._id });
    if (!nurse) {
      console.log('❌ Nurse profile not found');
      process.exit(1);
    }

    console.log('✅ Found Nurse:', nurseUser.email);
    console.log('   Employee ID:', nurse.employeeId);
    console.log('   Current Shift:', nurse.shiftTiming);
    console.log('   Assigned Ward:', nurse.assignedWard || 'Not assigned');

    // Get or create beds for the ward
    let beds = await Bed.find({ wardNumber: 'Ward A' }).limit(5);
    
    if (beds.length === 0) {
      console.log('\n📦 Creating beds...');
      const department = await Department.findOne();
      
      const bedData = [
        { bedNumber: 'A-101', wardNumber: 'Ward A', wardType: 'general', floor: 1, bedType: 'general', status: 'occupied', dailyCharge: 500 },
        { bedNumber: 'A-102', wardNumber: 'Ward A', wardType: 'general', floor: 1, bedType: 'general', status: 'occupied', dailyCharge: 500 },
        { bedNumber: 'A-103', wardNumber: 'Ward A', wardType: 'general', floor: 1, bedType: 'general', status: 'occupied', dailyCharge: 500 },
        { bedNumber: 'A-104', wardNumber: 'Ward A', wardType: 'general', floor: 1, bedType: 'general', status: 'vacant', dailyCharge: 500 },
        { bedNumber: 'A-105', wardNumber: 'Ward A', wardType: 'icu', floor: 1, bedType: 'icu', status: 'occupied', dailyCharge: 2000 }
      ];

      for (const bed of bedData) {
        await Bed.create({
          ...bed,
          department: department._id
        });
      }
      
      beds = await Bed.find({ wardNumber: 'Ward A' });
      console.log('✅ Created', beds.length, 'beds');
    }

    // Find admitted patients
    let admissions = await Admission.find({ status: 'admitted' })
      .populate('patient')
      .limit(4);

    if (admissions.length === 0) {
      console.log('\n❌ No admitted patients found. Creating sample admissions...');
      
      // Get some patients
      const patients = await Patient.find().limit(4).populate('user');
      
      if (patients.length === 0) {
        console.log('❌ No patients found in database');
        process.exit(1);
      }

      console.log(`✅ Found ${patients.length} patients`);

      // Create admissions for patients
      for (let i = 0; i < patients.length && i < 4; i++) {
        const bed = beds[i];
        const patient = patients[i];
        
        const admission = await Admission.create({
          patient: patient._id,
          admissionDate: new Date(),
          reason: 'Routine checkup and observation',
          admittedBy: nurseUser._id,
          status: 'admitted',
          vitalsHistory: [{
            recordedBy: nurse._id,
            temperature: 98.6,
            bloodPressure: { systolic: 120, diastolic: 80 },
            heartRate: 75,
            respiratoryRate: 16,
            oxygenSaturation: 98
          }]
        });

        // Update bed status
        bed.status = 'occupied';
        bed.currentPatient = patient._id;
        await bed.save();

        console.log(`✅ Created admission for ${patient.user?.name || patient._id} in bed ${bed.bedNumber}`);
      }

      // Get fresh admission data
      admissions = await Admission.find({ status: 'admitted' })
        .populate('patient')
        .limit(4);
    }

    // Assign patients to nurse
    nurse.assignedWard = 'Ward A';
    nurse.assignedPatients = admissions.filter(a => a.patient).map((admission, index) => ({
      patient: admission.patient._id,
      assignedDate: new Date(),
      bedNumber: beds[index]?.bedNumber || `A-10${index + 1}`,
      status: 'active'
    }));

    await nurse.save();

    console.log('\n✅ Successfully assigned to nurse:');
    console.log('   Ward:', nurse.assignedWard);
    console.log('   Total Patients:', nurse.assignedPatients.length);
    
    nurse.assignedPatients.forEach((ap, index) => {
      console.log(`   ${index + 1}. Bed ${ap.bedNumber} - Patient ID: ${ap.patient}`);
    });

    console.log('\n🎉 Assignment complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

assignPatientsAndBeds();
