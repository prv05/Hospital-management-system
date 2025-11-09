import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Nurse from '../models/Nurse.js';
import Department from '../models/Department.js';
import Medicine from '../models/Medicine.js';
import Bed from '../models/Bed.js';
import Appointment from '../models/Appointment.js';
import Billing from '../models/Billing.js';
import connectDB from '../config/database.js';

dotenv.config();

const generateAppointmentId = () => {
  return `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const comprehensiveSeed = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Nurse.deleteMany({});
    await Department.deleteMany({});
    await Medicine.deleteMany({});
    await Bed.deleteMany({});
    await Appointment.deleteMany({});
    await Billing.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create Departments
    console.log('🏥 Creating 6 departments...');
    const departments = await Department.create([
      {
        name: 'Cardiology',
        code: 'CARD',
        description: 'Heart and cardiovascular system care',
        location: { building: 'A', floor: '3', wing: 'East' },
        phone: '9876543210',
        email: 'cardiology@hospital.com',
        specialties: ['Interventional Cardiology', 'Cardiac Surgery'],
        isActive: true
      },
      {
        name: 'Neurology',
        code: 'NEURO',
        description: 'Brain and nervous system disorders',
        location: { building: 'A', floor: '4', wing: 'West' },
        phone: '9876543211',
        email: 'neurology@hospital.com',
        specialties: ['Stroke Care', 'Epilepsy'],
        isActive: true
      },
      {
        name: 'Orthopedics',
        code: 'ORTHO',
        description: 'Bone, joint, and muscle care',
        location: { building: 'B', floor: '2', wing: 'North' },
        phone: '9876543212',
        email: 'orthopedics@hospital.com',
        specialties: ['Joint Replacement', 'Sports Medicine'],
        isActive: true
      },
      {
        name: 'Pediatrics',
        code: 'PEDIA',
        description: 'Child healthcare',
        location: { building: 'C', floor: '1', wing: 'South' },
        phone: '9876543213',
        email: 'pediatrics@hospital.com',
        specialties: ['Neonatology', 'Child Development'],
        isActive: true
      },
      {
        name: 'General Medicine',
        code: 'GENMED',
        description: 'General medical consultations and internal medicine',
        location: { building: 'B', floor: '1', wing: 'East' },
        phone: '9876543215',
        email: 'generalmed@hospital.com',
        specialties: ['Internal Medicine', 'Preventive Care'],
        isActive: true
      },
      {
        name: 'Emergency',
        code: 'EMERG',
        description: '24/7 Emergency and trauma care',
        location: { building: 'Ground', floor: '0', wing: 'Main' },
        phone: '9876543214',
        email: 'emergency@hospital.com',
        specialties: ['Trauma Care', 'Critical Care'],
        isEmergency: true,
        isActive: true
      }
    ]);
    console.log(`✅ Created ${departments.length} departments`);

    // Create Admin
    console.log('\n👤 Creating Admin user...');
    const adminUser = await User.create({
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '9999999999',
      dateOfBirth: new Date('1980-01-01'),
      gender: 'male',
      address: { street: 'Hospital Building', city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India' },
      isActive: true,
      isVerified: true
    });
    console.log(`✅ Admin created: ${adminUser.email}`);

    // Create 12 Doctors (2 per department)
    console.log('\n👨‍⚕️ Creating 12 doctors (2 per department)...');
    const doctorUsersData = [
      // Cardiology
      { email: 'dr.sharma@hospital.com', firstName: 'Rajesh', lastName: 'Sharma', phone: '9876541001', gender: 'male', dob: '1975-05-15' },
      { email: 'dr.patel@hospital.com', firstName: 'Anjali', lastName: 'Patel', phone: '9876541002', gender: 'female', dob: '1980-08-22' },
      // Neurology
      { email: 'dr.mehta@hospital.com', firstName: 'Priya', lastName: 'Mehta', phone: '9876541003', gender: 'female', dob: '1978-03-10' },
      { email: 'dr.reddy@hospital.com', firstName: 'Vikram', lastName: 'Reddy', phone: '9876541004', gender: 'male', dob: '1982-11-05' },
      // Orthopedics
      { email: 'dr.kumar@hospital.com', firstName: 'Amit', lastName: 'Kumar', phone: '9876541005', gender: 'male', dob: '1976-07-18' },
      { email: 'dr.nair@hospital.com', firstName: 'Lakshmi', lastName: 'Nair', phone: '9876541006', gender: 'female', dob: '1983-02-25' },
      // Pediatrics
      { email: 'dr.gupta@hospital.com', firstName: 'Neha', lastName: 'Gupta', phone: '9876541007', gender: 'female', dob: '1985-09-14' },
      { email: 'dr.singh@hospital.com', firstName: 'Rahul', lastName: 'Singh', phone: '9876541008', gender: 'male', dob: '1979-06-30' },
      // General Medicine
      { email: 'dr.desai@hospital.com', firstName: 'Kiran', lastName: 'Desai', phone: '9876541009', gender: 'male', dob: '1981-04-12' },
      { email: 'dr.verma@hospital.com', firstName: 'Pooja', lastName: 'Verma', phone: '9876541010', gender: 'female', dob: '1984-10-20' },
      // Emergency
      { email: 'dr.khan@hospital.com', firstName: 'Arif', lastName: 'Khan', phone: '9876541011', gender: 'male', dob: '1977-12-08' },
      { email: 'dr.iyer@hospital.com', firstName: 'Divya', lastName: 'Iyer', phone: '9876541012', gender: 'female', dob: '1986-01-15' }
    ];

    const doctorUsers = await User.create(doctorUsersData.map(d => ({
      email: d.email,
      password: 'doctor123',
      role: 'doctor',
      firstName: d.firstName,
      lastName: d.lastName,
      phone: d.phone,
      dateOfBirth: new Date(d.dob),
      gender: d.gender,
      address: { street: '123 Hospital Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India' },
      isActive: true,
      isVerified: true
    })));

    const specializations = [
      'Cardiologist', 'Interventional Cardiologist',
      'Neurologist', 'Neurosurgeon',
      'Orthopedic Surgeon', 'Sports Medicine Specialist',
      'Pediatrician', 'Neonatologist',
      'General Physician', 'Internal Medicine Specialist',
      'Emergency Medicine Specialist', 'Trauma Surgeon'
    ];

    const doctors = await Doctor.create(doctorUsers.map((user, idx) => ({
      user: user._id,
      employeeId: `DOC${String(idx + 1).padStart(3, '0')}`,
      department: departments[Math.floor(idx / 2)]._id,
      specialization: specializations[idx],
      qualification: 'MBBS, MD',
      experience: 10 + Math.floor(Math.random() * 15),
      licenseNumber: `MCI${100000 + idx}`,
      licenseExpiry: new Date('2026-12-31'),
      consultationFee: 500 + (idx * 100),
      designation: idx % 2 === 0 ? 'Senior Doctor' : 'Consultant',
      availability: [
        { day: 'Monday', shifts: [{ startTime: '09:00', endTime: '17:00', type: 'OPD' }] },
        { day: 'Wednesday', shifts: [{ startTime: '09:00', endTime: '17:00', type: 'OPD' }] },
        { day: 'Friday', shifts: [{ startTime: '09:00', endTime: '17:00', type: 'OPD' }] }
      ],
      maxPatientsPerDay: 25,
      languages: ['English', 'Hindi', 'Kannada'],
      isAvailableForEmergency: Math.floor(idx / 2) === 5, // Only emergency dept
      rating: { average: 4.0 + Math.random(), count: 50 + Math.floor(Math.random() * 100) }
    })));
    console.log(`✅ Created ${doctors.length} doctors`);

    // Create 10 Patients
    console.log('\n🧑 Creating 10 patients...');
    const patientUsersData = [
      { email: 'patient1@email.com', firstName: 'Rahul', lastName: 'Verma', phone: '9876543011', gender: 'male', dob: '1990-01-15' },
      { email: 'patient2@email.com', firstName: 'Priya', lastName: 'Joshi', phone: '9876543012', gender: 'female', dob: '1985-05-20' },
      { email: 'patient3@email.com', firstName: 'Amit', lastName: 'Shah', phone: '9876543013', gender: 'male', dob: '1995-09-10' },
      { email: 'patient4@email.com', firstName: 'Sneha', lastName: 'Patil', phone: '9876543014', gender: 'female', dob: '1992-03-25' },
      { email: 'patient5@email.com', firstName: 'Karan', lastName: 'Malhotra', phone: '9876543015', gender: 'male', dob: '1988-07-18' },
      { email: 'patient6@email.com', firstName: 'Neha', lastName: 'Kapoor', phone: '9876543016', gender: 'female', dob: '1993-11-30' },
      { email: 'patient7@email.com', firstName: 'Rohan', lastName: 'Deshmukh', phone: '9876543017', gender: 'male', dob: '1991-02-14' },
      { email: 'patient8@email.com', firstName: 'Ananya', lastName: 'Rao', phone: '9876543018', gender: 'female', dob: '1987-06-22' },
      { email: 'patient9@email.com', firstName: 'Vikram', lastName: 'Chopra', phone: '9876543019', gender: 'male', dob: '1994-10-05' },
      { email: 'patient10@email.com', firstName: 'Kavya', lastName: 'Nair', phone: '9876543020', gender: 'female', dob: '1989-12-12' }
    ];

    const patientUsers = await User.create(patientUsersData.map(p => ({
      email: p.email,
      password: 'patient123',
      role: 'patient',
      firstName: p.firstName,
      lastName: p.lastName,
      phone: p.phone,
      dateOfBirth: new Date(p.dob),
      gender: p.gender,
      address: { street: '456 Patient Street', city: 'Bangalore', state: 'Karnataka', pincode: '560002', country: 'India' },
      isActive: true,
      isVerified: true
    })));

    const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];
    const patients = await Patient.create(patientUsers.map((user, idx) => ({
      user: user._id,
      patientId: `PAT${String(idx + 1).padStart(3, '0')}`,
      bloodGroup: bloodGroups[idx % bloodGroups.length],
      emergencyContact: {
        name: `Emergency Contact ${idx + 1}`,
        relation: idx % 2 === 0 ? 'Parent' : 'Spouse',
        phone: `98765430${20 + idx}`
      },
      height: 155 + Math.floor(Math.random() * 30),
      weight: 50 + Math.floor(Math.random() * 40),
      allergies: idx < 5 ? [{ allergen: idx % 2 === 0 ? 'Penicillin' : 'Pollen', severity: 'moderate', reaction: 'Rash' }] : [],
      chronicDiseases: idx < 3 ? ['Diabetes Type 2'] : [],
      currentMedications: []
    })));
    console.log(`✅ Created ${patients.length} patients`);

    // Create 6 Nurses (1 per department)
    console.log('\n👩‍⚕️ Creating 6 nurses (1 per department)...');
    const nurseUsersData = [
      { email: 'nurse1@hospital.com', firstName: 'Anjali', lastName: 'Kumar', phone: '9876542001', dob: '1990-04-12' },
      { email: 'nurse2@hospital.com', firstName: 'Meera', lastName: 'Singh', phone: '9876542002', dob: '1992-08-25' },
      { email: 'nurse3@hospital.com', firstName: 'Pooja', lastName: 'Reddy', phone: '9876542003', dob: '1988-11-18' },
      { email: 'nurse4@hospital.com', firstName: 'Swati', lastName: 'Nair', phone: '9876542004', dob: '1991-03-30' },
      { email: 'nurse5@hospital.com', firstName: 'Rekha', lastName: 'Desai', phone: '9876542005', dob: '1989-07-22' },
      { email: 'nurse6@hospital.com', firstName: 'Priyanka', lastName: 'Sharma', phone: '9876542006', dob: '1993-01-15' }
    ];

    const nurseUsers = await User.create(nurseUsersData.map(n => ({
      email: n.email,
      password: 'nurse123',
      role: 'nurse',
      firstName: n.firstName,
      lastName: n.lastName,
      phone: n.phone,
      dateOfBirth: new Date(n.dob),
      gender: 'female',
      address: { street: '789 Nurse Colony', city: 'Bangalore', state: 'Karnataka', pincode: '560003', country: 'India' },
      isActive: true,
      isVerified: true
    })));

    const nurses = await Nurse.create(nurseUsers.map((user, idx) => ({
      user: user._id,
      employeeId: `NUR${String(idx + 1).padStart(3, '0')}`,
      department: departments[idx]._id,
      qualification: 'B.Sc Nursing',
      experience: 5 + Math.floor(Math.random() * 10),
      licenseNumber: `NUR${100000 + idx}`,
      licenseExpiry: new Date('2026-12-31'),
      designation: idx < 3 ? 'Senior Nurse' : 'Staff Nurse',
      shift: idx % 3 === 0 ? 'morning' : idx % 3 === 1 ? 'evening' : 'night',
      isOnDuty: idx < 4,
      languages: ['English', 'Hindi', 'Kannada']
    })));
    console.log(`✅ Created ${nurses.length} nurses`);

    // Create Billing, Pharmacy, Lab staff
    console.log('\n👥 Creating support staff...');
    const billingUser = await User.create({
      email: 'billing@hospital.com',
      password: 'billing123',
      role: 'billing',
      firstName: 'Kavita',
      lastName: 'Menon',
      phone: '9876544001',
      dateOfBirth: new Date('1985-04-10'),
      gender: 'female',
      address: { street: '333 HSR Layout', city: 'Bangalore', state: 'Karnataka', pincode: '560102', country: 'India' },
      isActive: true,
      isVerified: true
    });

    const pharmacyUser = await User.create({
      email: 'pharmacy@hospital.com',
      password: 'pharmacy123',
      role: 'pharmacy',
      firstName: 'Deepak',
      lastName: 'Nair',
      phone: '9876545001',
      dateOfBirth: new Date('1982-12-05'),
      gender: 'male',
      address: { street: '444 Jayanagar', city: 'Bangalore', state: 'Karnataka', pincode: '560041', country: 'India' },
      isActive: true,
      isVerified: true
    });

    const labUser = await User.create({
      email: 'lab@hospital.com',
      password: 'lab123',
      role: 'lab',
      firstName: 'Sunita',
      lastName: 'Rao',
      phone: '9876546001',
      dateOfBirth: new Date('1987-09-22'),
      gender: 'female',
      address: { street: '555 Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034', country: 'India' },
      isActive: true,
      isVerified: true
    });
    console.log('✅ Support staff created');

    // Create Medicines
    console.log('\n💊 Creating 15 medicines...');
    const medicinesData = [
      { name: 'Paracetamol 500mg', generic: 'Paracetamol', category: 'Tablet', strength: '500', unit: 'mg', pack: 10, price: 10 },
      { name: 'Amoxicillin 250mg', generic: 'Amoxicillin', category: 'Capsule', strength: '250', unit: 'mg', pack: 10, price: 50 },
      { name: 'Aspirin 75mg', generic: 'Aspirin', category: 'Tablet', strength: '75', unit: 'mg', pack: 10, price: 15 },
      { name: 'Metformin 500mg', generic: 'Metformin', category: 'Tablet', strength: '500', unit: 'mg', pack: 10, price: 20 },
      { name: 'Atorvastatin 10mg', generic: 'Atorvastatin', category: 'Tablet', strength: '10', unit: 'mg', pack: 10, price: 80 },
      { name: 'Omeprazole 20mg', generic: 'Omeprazole', category: 'Capsule', strength: '20', unit: 'mg', pack: 10, price: 30 },
      { name: 'Salbutamol Inhaler', generic: 'Salbutamol', category: 'Inhaler', strength: '100', unit: 'mcg', pack: 1, price: 150 },
      { name: 'Insulin Injection', generic: 'Insulin', category: 'Injection', strength: '100', unit: 'IU', pack: 1, price: 500 },
      { name: 'Diclofenac 50mg', generic: 'Diclofenac', category: 'Tablet', strength: '50', unit: 'mg', pack: 10, price: 25 },
      { name: 'Ciprofloxacin 500mg', generic: 'Ciprofloxacin', category: 'Tablet', strength: '500', unit: 'mg', pack: 10, price: 60 },
      { name: 'Losartan 50mg', generic: 'Losartan', category: 'Tablet', strength: '50', unit: 'mg', pack: 10, price: 40 },
      { name: 'Cetirizine 10mg', generic: 'Cetirizine', category: 'Tablet', strength: '10', unit: 'mg', pack: 10, price: 12 },
      { name: 'Pantoprazole 40mg', generic: 'Pantoprazole', category: 'Tablet', strength: '40', unit: 'mg', pack: 10, price: 35 },
      { name: 'Azithromycin 500mg', generic: 'Azithromycin', category: 'Tablet', strength: '500', unit: 'mg', pack: 5, price: 100 },
      { name: 'Clopidogrel 75mg', generic: 'Clopidogrel', category: 'Tablet', strength: '75', unit: 'mg', pack: 10, price: 90 }
    ];

    const medicines = await Medicine.create(medicinesData.map((m, idx) => ({
      medicineId: `MED${String(idx + 1).padStart(3, '0')}`,
      name: m.name,
      genericName: m.generic,
      category: m.category,
      strength: m.strength,
      unit: m.unit,
      packSize: m.pack,
      manufacturer: ['Sun Pharma', 'Cipla', 'Dr. Reddy\'s', 'Lupin', 'Mankind'][idx % 5],
      batchNumber: `BATCH${idx + 1}2025`,
      expiryDate: new Date('2026-12-31'),
      manufacturingDate: new Date('2024-01-01'),
      stock: {
        quantity: 100 + (idx * 50),
        reorderLevel: 50,
        maxStockLevel: 1000
      },
      price: {
        mrp: m.price * 1.2,
        sellingPrice: m.price,
        purchasePrice: m.price * 0.7
      },
      storageConditions: 'Store in a cool, dry place',
      prescriptionRequired: idx < 10
    })));
    console.log(`✅ Created ${medicines.length} medicines`);

    // Create Beds
    console.log('\n🛏️  Creating 95 beds (spread across wards)...');
    const beds = [];
    
    // General Wards: 4 wards with 10 beds each = 40 beds
    for (let ward = 1; ward <= 4; ward++) {
      for (let bed = 1; bed <= 10; bed++) {
        const bedNum = (ward - 1) * 10 + bed;
        const deptIdx = Math.floor(bedNum / 16) % departments.length; // Spread across departments
        beds.push({
          bedNumber: `G${ward}-${bed}`,
          department: departments[deptIdx]._id,
          wardNumber: `GW-${ward}`,
          wardType: 'general',
          floor: ward + 1,
          bedType: 'general',
          status: bedNum % 3 === 0 ? 'occupied' : 'vacant',
          dailyCharge: 1000,
          facilities: [
            { name: 'AC', isWorking: true },
            { name: 'Fan', isWorking: true },
            { name: 'Call Bell', isWorking: true }
          ]
        });
      }
    }
    
    // Semi-Private Wards: 15 wards with 2 beds each = 30 beds
    for (let ward = 1; ward <= 15; ward++) {
      for (let bed = 1; bed <= 2; bed++) {
        const deptIdx = (ward - 1) % departments.length;
        beds.push({
          bedNumber: `SP${ward}-${bed}`,
          department: departments[deptIdx]._id,
          wardNumber: `SPW-${ward}`,
          wardType: 'semi-private',
          floor: Math.floor((ward - 1) / 5) + 2,
          bedType: 'semi-private',
          status: ward % 2 === 0 ? 'occupied' : 'vacant',
          dailyCharge: 2000,
          facilities: [
            { name: 'AC', isWorking: true },
            { name: 'TV', isWorking: true },
            { name: 'Private Bathroom', isWorking: true },
            { name: 'Call Bell', isWorking: true }
          ]
        });
      }
    }
    
    // Private Wards: 15 wards with 1 bed each = 15 beds
    for (let ward = 1; ward <= 15; ward++) {
      const deptIdx = (ward - 1) % departments.length;
      beds.push({
        bedNumber: `P${ward}`,
        department: departments[deptIdx]._id,
        wardNumber: `PW-${ward}`,
        wardType: 'private',
        floor: Math.floor((ward - 1) / 5) + 3,
        bedType: 'private',
        status: ward % 3 === 0 ? 'occupied' : 'vacant',
        dailyCharge: 3000,
        facilities: [
          { name: 'AC', isWorking: true },
          { name: 'TV', isWorking: true },
          { name: 'Private Bathroom', isWorking: true },
          { name: 'Refrigerator', isWorking: true },
          { name: 'Sofa', isWorking: true },
          { name: 'Call Bell', isWorking: true }
        ]
      });
    }
    
    // ICU Wards: 2 wards with 5 beds each = 10 beds
    for (let ward = 1; ward <= 2; ward++) {
      for (let bed = 1; bed <= 5; bed++) {
        const deptIdx = ward % 2; // Split between first two departments
        beds.push({
          bedNumber: `ICU${ward}-${bed}`,
          department: departments[deptIdx]._id,
          wardNumber: `ICU-${ward}`,
          wardType: 'icu',
          floor: 1,
          bedType: 'icu',
          status: bed % 2 === 0 ? 'occupied' : 'vacant',
          dailyCharge: 5000,
          facilities: [
            { name: 'Ventilator', isWorking: true },
            { name: 'ECG Monitor', isWorking: true },
            { name: 'Infusion Pump', isWorking: true },
            { name: 'Oxygen Supply', isWorking: true },
            { name: 'Emergency Call', isWorking: true }
          ]
        });
      }
    }
    
    await Bed.create(beds);
    console.log(`✅ Created ${beds.length} beds`);

    // Create Appointments (distributed across all doctors)
    console.log('\n📅 Creating appointments...');
    const appointments = [];
    const today = new Date();
    
    // Ensure each patient gets appointments with multiple doctors
    // Each patient will get 6 appointments distributed across different doctors
    for (let patientIdx = 0; patientIdx < patients.length; patientIdx++) {
      // Each patient gets 6 appointments with different doctors
      for (let apptNum = 0; apptNum < 6; apptNum++) {
        const doctorIdx = (patientIdx + apptNum) % doctors.length;
        
        // Better distribution of dates: -4, -3, -2, -1, 0, +1
        const daysOffset = apptNum - 4;
        const appointmentDate = new Date(today);
        appointmentDate.setDate(today.getDate() + daysOffset);
        
        const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
        let status;
        
        // Set statuses based on date and time
        if (daysOffset < 0) {
          // Past appointments are completed
          status = 'completed';
        } else if (daysOffset === 0) {
          // Today's appointments - waiting
          status = 'waiting';
        } else {
          // Future appointments
          status = 'scheduled';
        }
        
        appointments.push({
          appointmentId: `APT${String(patientIdx * 6 + apptNum + 1).padStart(6, '0')}`,
          patient: patients[patientIdx]._id,
          doctor: doctors[doctorIdx]._id,
          department: doctors[doctorIdx].department,
          appointmentDate,
          appointmentTime: times[apptNum % times.length],
          type: apptNum % 3 === 0 ? 'follow-up' : 'consultation',
          status: status,
          symptoms: `Patient complaint ${patientIdx * 6 + apptNum + 1}`,
          notes: `Medical notes for appointment ${patientIdx * 6 + apptNum + 1}`,
          consultationFee: doctors[doctorIdx].consultationFee
        });
      }
    }
    
    const createdAppointments = await Appointment.create(appointments);
    console.log(`✅ Created ${createdAppointments.length} appointments`);

    // Create 15 Billing Records
    console.log('\n💰 Creating 15 billing records...');
    const billingRecords = [];
    
    for (let i = 0; i < 15; i++) {
      const appointment = createdAppointments[i];
      const patient = patients[i % patients.length];
      
      const items = [
        { 
          itemType: 'consultation',
          description: 'Doctor Consultation Fee', 
          quantity: 1, 
          unitPrice: appointment.consultationFee, 
          totalPrice: appointment.consultationFee 
        },
        { 
          itemType: 'lab-test',
          description: 'Blood Test & X-Ray', 
          quantity: 1, 
          unitPrice: 800, 
          totalPrice: 800 
        }
      ];
      
      if (i % 3 === 0) {
        items.push({
          itemType: 'medicine',
          description: 'Prescribed Medicines',
          quantity: 1,
          unitPrice: 500,
          totalPrice: 500
        });
      }
      
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const discountAmount = subtotal * 0.1;
      const cgst = (subtotal - discountAmount) * 0.09;
      const sgst = (subtotal - discountAmount) * 0.09;
      const totalAmount = subtotal - discountAmount + cgst + sgst;
      
      billingRecords.push({
        billId: `BILL${String(i + 1).padStart(6, '0')}`,
        patient: patient._id,
        appointment: appointment._id,
        billType: 'OPD',
        items,
        subtotal,
        discount: {
          amount: discountAmount,
          percentage: 10,
          reason: 'Regular patient discount'
        },
        tax: { cgst, sgst, igst: 0 },
        totalAmount,
        amountPaid: i < 10 ? totalAmount : 0,
        balanceAmount: i < 10 ? 0 : totalAmount,
        paymentStatus: i < 10 ? 'paid' : 'pending',
        paymentMethods: i < 10 ? [{
          method: ['cash', 'card', 'upi'][i % 3],
          amount: totalAmount,
          transactionId: `TXN${String(i + 1).padStart(10, '0')}`
        }] : [],
        generatedBy: billingUser._id
      });
    }
    
    await Billing.create(billingRecords);
    console.log(`✅ Created ${billingRecords.length} billing records`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 SUMMARY:');
    console.log(`   📁 Departments: ${departments.length}`);
    console.log(`   👨‍⚕️ Doctors: ${doctors.length} (2 per department)`);
    console.log(`   🧑 Patients: ${patients.length}`);
    console.log(`   👩‍⚕️ Nurses: ${nurses.length} (1 per department)`);
    console.log(`   💊 Medicines: ${medicines.length}`);
    console.log(`   🛏️  Beds: ${beds.length}`);
    console.log(`   📅 Appointments: ${createdAppointments.length}`);
    console.log(`   💰 Billing Records: ${billingRecords.length}`);
    
    console.log('\n🔐 TEST CREDENTIALS:');
    console.log('─'.repeat(60));
    console.log('Admin:       admin@hospital.com / admin123');
    console.log('\nDoctors (all: doctor123):');
    console.log('  Cardiology:    dr.sharma@hospital.com, dr.patel@hospital.com');
    console.log('  Neurology:     dr.mehta@hospital.com, dr.reddy@hospital.com');
    console.log('  Orthopedics:   dr.kumar@hospital.com, dr.nair@hospital.com');
    console.log('  Pediatrics:    dr.gupta@hospital.com, dr.singh@hospital.com');
    console.log('  General Med:   dr.desai@hospital.com, dr.verma@hospital.com');
    console.log('  Emergency:     dr.khan@hospital.com, dr.iyer@hospital.com');
    console.log('\nPatients (all: patient123):');
    console.log('  patient1@email.com to patient10@email.com');
    console.log('\nNurses (all: nurse123):');
    console.log('  nurse1@hospital.com to nurse6@hospital.com');
    console.log('\nOther Staff:');
    console.log('  Billing:   billing@hospital.com / billing123');
    console.log('  Pharmacy:  pharmacy@hospital.com / pharmacy123');
    console.log('  Lab:       lab@hospital.com / lab123');
    console.log('─'.repeat(60));
    console.log('\n🎉 You can now login with any of the above credentials!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

comprehensiveSeed();
