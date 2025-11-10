import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import Nurse from './models/Nurse.js';
import Bed from './models/Bed.js';
import Admission from './models/Admission.js';
import Department from './models/Department.js';
import connectDB from './config/database.js';

dotenv.config();

const generateAdmissionId = () => {
  return `ADM${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const setupHospitalAdmissions = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Clear existing admissions and bed assignments
    console.log('🗑️  Clearing existing admissions...');
    await Admission.deleteMany({});
    await Bed.updateMany({}, { 
      status: 'vacant', 
      currentPatient: null, 
      admittedAt: null 
    });
    
    // Clear nurse assignments
    await Nurse.updateMany({}, { assignedPatients: [] });
    console.log('✅ Cleared existing data\n');

    // Get required data
    const departments = await Department.find();
    const doctors = await Doctor.find().populate('user');
    const patients = await Patient.find().populate('user');
    const nurses = await Nurse.find().populate('user');
    const beds = await Bed.find();

    if (departments.length === 0 || doctors.length === 0 || patients.length === 0) {
      console.log('❌ Missing required data. Please run seed first.');
      return;
    }

    console.log('🏥 Creating Hospital Admissions...\n');

    // Admit 5 patients with different reasons
    const admissionsData = [
      {
        patient: patients[0],
        reason: 'Appendectomy Surgery',
        type: 'Scheduled',
        diagnosis: 'Acute Appendicitis',
        bed: beds[0],
        wardType: 'general'
      },
      {
        patient: patients[1],
        reason: 'Heart Surgery - Bypass',
        type: 'Scheduled',
        diagnosis: 'Coronary Artery Disease',
        bed: beds[1],
        wardType: 'icu'
      },
      {
        patient: patients[2],
        reason: 'Fracture Treatment',
        type: 'Emergency',
        diagnosis: 'Multiple Fractures - Road Accident',
        bed: beds[2],
        wardType: 'general'
      },
      {
        patient: patients[3],
        reason: 'Pneumonia Treatment',
        type: 'Emergency',
        diagnosis: 'Severe Pneumonia',
        bed: beds[3],
        wardType: 'semi-private'
      },
      {
        patient: patients[4],
        reason: 'Maternity - Normal Delivery',
        type: 'Scheduled',
        diagnosis: 'Full Term Pregnancy',
        bed: beds[4],
        wardType: 'private'
      }
    ];

    const createdAdmissions = [];

    for (let i = 0; i < admissionsData.length; i++) {
      const data = admissionsData[i];
      const doctor = doctors[i % doctors.length];
      const department = departments[i % departments.length];

      // Create admission
      const admission = await Admission.create({
        admissionId: generateAdmissionId(),
        patient: data.patient._id,
        doctor: doctor._id,
        department: department._id,
        bed: data.bed._id,
        admissionType: data.type,
        admissionDate: new Date(),
        status: 'admitted',
        reasonForAdmission: data.reason,
        provisionalDiagnosis: data.diagnosis,
        treatmentPlan: `Treatment plan for ${data.diagnosis}`,
        vitalsHistory: [{
          bloodPressure: '120/80',
          temperature: 98.6,
          pulse: 72,
          respiratoryRate: 16,
          oxygenSaturation: 98
        }]
      });

      // Update bed status
      await Bed.findByIdAndUpdate(data.bed._id, {
        status: 'occupied',
        currentPatient: data.patient._id,
        assignedDoctor: doctor.user._id,
        admittedAt: new Date()
      });

      createdAdmissions.push(admission);

      console.log(`✅ Admitted: ${data.patient.user.firstName} ${data.patient.user.lastName}`);
      console.log(`   Reason: ${data.reason}`);
      console.log(`   Bed: ${data.bed.bedNumber} (${data.wardType})`);
      console.log(`   Doctor: Dr. ${doctor.user.lastName}`);
      console.log('');
    }

    console.log(`\n🏥 ${createdAdmissions.length} patients admitted successfully!\n`);

    // Assign admitted patients to nurses
    console.log('👩‍⚕️ Assigning admitted patients to nurses...\n');

    const nurseAssignments = [
      { nurse: nurses[0], patientIndexes: [0, 1] }, // Anjali Kumar - 2 patients
      { nurse: nurses[1], patientIndexes: [2] },     // Meera Singh - 1 patient
      { nurse: nurses[2], patientIndexes: [3, 4] }   // Pooja Reddy - 2 patients
    ];

    for (const assignment of nurseAssignments) {
      const nurse = assignment.nurse;
      
      for (const index of assignment.patientIndexes) {
        const data = admissionsData[index];
        const admission = createdAdmissions[index];
        
        nurse.assignedPatients.push({
          patient: data.patient._id,
          assignedDate: new Date(),
          bedNumber: data.bed.bedNumber,
          status: 'active'
        });

        // Update bed with assigned nurse
        await Bed.findByIdAndUpdate(data.bed._id, {
          assignedNurse: nurse.user._id
        });
      }

      await nurse.save();
      
      console.log(`✅ Nurse ${nurse.user.firstName} ${nurse.user.lastName}`);
      console.log(`   Assigned ${assignment.patientIndexes.length} patient(s)`);
      console.log('');
    }

    console.log('\n📊 Summary:');
    console.log(`   Admitted Patients: ${createdAdmissions.length}`);
    console.log(`   Outpatients (Consultation only): ${patients.length - createdAdmissions.length}`);
    console.log(`   Occupied Beds: ${createdAdmissions.length}`);
    console.log(`   Available Beds: ${beds.length - createdAdmissions.length}`);

    console.log('\n💡 Note: Remaining patients are outpatients (consultation/checkup only)');
    console.log('   They do not have beds assigned and are not admitted.\n');

    await mongoose.connection.close();
    console.log('👋 Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

setupHospitalAdmissions();
