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

const seedData = async () => {
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

    console.log('✅ Existing data cleared');

    // Create Departments
    console.log('🏥 Creating departments...');
    const departments = await Department.create([
      {
        name: 'Cardiology',
        code: 'CARD',
        description: 'Heart and cardiovascular system care',
        location: { building: 'A', floor: '3', wing: 'East' },
        phone: '9876543210',
        email: 'cardiology@hospital.com',
        specialties: ['Interventional Cardiology', 'Cardiac Surgery', 'Heart Failure'],
        isActive: true
      },
      {
        name: 'Neurology',
        code: 'NEURO',
        description: 'Brain and nervous system disorders',
        location: { building: 'A', floor: '4', wing: 'West' },
        phone: '9876543211',
        email: 'neurology@hospital.com',
        specialties: ['Stroke Care', 'Epilepsy', 'Movement Disorders'],
        isActive: true
      },
      {
        name: 'Orthopedics',
        code: 'ORTHO',
        description: 'Bone, joint, and muscle care',
        location: { building: 'B', floor: '2', wing: 'North' },
        phone: '9876543212',
        email: 'orthopedics@hospital.com',
        specialties: ['Joint Replacement', 'Sports Medicine', 'Spine Surgery'],
        isActive: true
      },
      {
        name: 'Pediatrics',
        code: 'PEDIA',
        description: 'Child healthcare',
        location: { building: 'C', floor: '1', wing: 'South' },
        phone: '9876543213',
        email: 'pediatrics@hospital.com',
        specialties: ['Neonatology', 'Pediatric Surgery', 'Child Development'],
        isActive: true
      },
      {
        name: 'General Medicine',
        code: 'GENMED',
        description: 'General medical consultations',
        location: { building: 'B', floor: '1', wing: 'East' },
        phone: '9876543215',
        email: 'generalmed@hospital.com',
        specialties: ['General Practice', 'Internal Medicine', 'Preventive Care'],
        isActive: true
      },
      {
        name: 'Emergency',
        code: 'EMERG',
        description: '24/7 Emergency care',
        location: { building: 'Ground', floor: '0', wing: 'Main' },
        phone: '9876543214',
        email: 'emergency@hospital.com',
        specialties: ['Trauma Care', 'Critical Care', 'Emergency Medicine'],
        isEmergency: true,
        isActive: true
      }
    ]);

    console.log(`✅ Created ${departments.length} departments`);

    // Create Admin User
    console.log('👤 Creating users...');
    const adminUser = await User.create({
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '9999999999',
      dateOfBirth: new Date('1980-01-01'),
      gender: 'male',
      address: {
        street: 'Hospital Building',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India'
      },
      isActive: true,
      isVerified: true
    });

    // Create 10 Doctors (2 per department except emergency)
    const doctorUsers = await User.create([
      // Cardiology Doctors
      {
        email: 'dr.sharma@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        firstName: 'Rajesh',
        lastName: 'Sharma',
        phone: '9876541001',
        dateOfBirth: new Date('1975-05-15'),
        gender: 'male',
        address: { street: '123 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India' },
        isActive: true,
        isVerified: true
      },
      {
        email: 'dr.mehta@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        firstName: 'Priya',
        lastName: 'Mehta',
        phone: '9876541002',
        dateOfBirth: new Date('1980-08-22'),
        gender: 'female',
        address: { street: '456 Brigade Road', city: 'Bangalore', state: 'Karnataka', pincode: '560002', country: 'India' },
        isActive: true,
        isVerified: true
      },
      {
        email: 'dr.kumar@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        firstName: 'Amit',
        lastName: 'Kumar',
        phone: '9876541003',
        dateOfBirth: new Date('1978-03-10'),
        gender: 'male',
        address: { street: '789 Residency Road', city: 'Bangalore', state: 'Karnataka', pincode: '560003', country: 'India' },
        isActive: true,
        isVerified: true
      }
    ]);

    const doctors = await Doctor.create([
      {
        user: doctorUsers[0]._id,
        employeeId: 'DOC001',
        department: departments[0]._id, // Cardiology
        specialization: 'Cardiologist',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: 15,
        licenseNumber: 'MCI123456',
        licenseExpiry: new Date('2025-12-31'),
        consultationFee: 1000,
        designation: 'Senior Doctor',
        availability: [
          {
            day: 'Monday',
            shifts: [{ startTime: '09:00', endTime: '17:00', type: 'OPD' }]
          },
          {
            day: 'Tuesday',
            shifts: [{ startTime: '09:00', endTime: '17:00', type: 'OPD' }]
          },
          {
            day: 'Wednesday',
            shifts: [{ startTime: '09:00', endTime: '17:00', type: 'OPD' }]
          }
        ],
        maxPatientsPerDay: 30,
        languages: ['English', 'Hindi', 'Kannada'],
        isAvailableForEmergency: true,
        rating: { average: 4.5, count: 120 }
      },
      {
        user: doctorUsers[1]._id,
        employeeId: 'DOC002',
        department: departments[1]._id, // Neurology
        specialization: 'Neurologist',
        qualification: 'MBBS, MD, DM (Neurology)',
        experience: 12,
        licenseNumber: 'MCI123457',
        licenseExpiry: new Date('2025-12-31'),
        consultationFee: 1200,
        designation: 'Consultant',
        availability: [
          {
            day: 'Monday',
            shifts: [{ startTime: '10:00', endTime: '18:00', type: 'OPD' }]
          },
          {
            day: 'Thursday',
            shifts: [{ startTime: '10:00', endTime: '18:00', type: 'OPD' }]
          }
        ],
        maxPatientsPerDay: 25,
        languages: ['English', 'Hindi', 'Gujarati'],
        isAvailableForEmergency: false,
        rating: { average: 4.7, count: 95 }
      },
      {
        user: doctorUsers[2]._id,
        employeeId: 'DOC003',
        department: departments[2]._id, // Orthopedics
        specialization: 'Orthopedic Surgeon',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: 18,
        licenseNumber: 'MCI123458',
        licenseExpiry: new Date('2025-12-31'),
        consultationFee: 800,
        designation: 'Head of Department',
        availability: [
          {
            day: 'Tuesday',
            shifts: [{ startTime: '08:00', endTime: '16:00', type: 'OPD' }]
          },
          {
            day: 'Friday',
            shifts: [{ startTime: '08:00', endTime: '12:00', type: 'Surgery' }]
          }
        ],
        maxPatientsPerDay: 20,
        languages: ['English', 'Hindi'],
        isAvailableForEmergency: true,
        rating: { average: 4.8, count: 200 }
      }
    ]);

    // Create Nurses
    const nurseUsers = await User.create([
      {
        email: 'nurse.anjali@hospital.com',
        password: 'nurse123',
        role: 'nurse',
        firstName: 'Anjali',
        lastName: 'Reddy',
        phone: '9876542001',
        dateOfBirth: new Date('1990-07-20'),
        gender: 'female',
        address: { street: '321 Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034', country: 'India' },
        isActive: true,
        isVerified: true
      },
      {
        email: 'nurse.ramesh@hospital.com',
        password: 'nurse123',
        role: 'nurse',
        firstName: 'Ramesh',
        lastName: 'Patil',
        phone: '9876542002',
        dateOfBirth: new Date('1988-11-15'),
        gender: 'male',
        address: { street: '654 Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038', country: 'India' },
        isActive: true,
        isVerified: true
      }
    ]);

    const nurses = await Nurse.create([
      {
        user: nurseUsers[0]._id,
        employeeId: 'NUR001',
        department: departments[0]._id,
        qualification: 'B.Sc Nursing',
        specialization: 'Critical Care',
        licenseNumber: 'NUR123456',
        licenseExpiry: new Date('2025-12-31'),
        experience: 8,
        designation: 'Senior Nurse',
        shiftTiming: 'morning',
        currentShift: { start: '08:00', end: '16:00' },
        assignedWard: 'Cardiology Ward A',
        isOnDuty: false
      },
      {
        user: nurseUsers[1]._id,
        employeeId: 'NUR002',
        department: departments[4]._id, // Emergency
        qualification: 'B.Sc Nursing',
        specialization: 'Emergency Care',
        licenseNumber: 'NUR123457',
        licenseExpiry: new Date('2025-12-31'),
        experience: 10,
        designation: 'Head Nurse',
        shiftTiming: 'rotating',
        currentShift: { start: '20:00', end: '08:00' },
        assignedWard: 'Emergency Ward',
        isOnDuty: true
      }
    ]);

    // Create Patients
    const patientUsers = await User.create([
      {
        email: 'patient1@email.com',
        password: 'patient123',
        role: 'patient',
        firstName: 'Rahul',
        lastName: 'Verma',
        phone: '9876543001',
        dateOfBirth: new Date('1995-06-15'),
        gender: 'male',
        address: { street: '111 Whitefield', city: 'Bangalore', state: 'Karnataka', pincode: '560066', country: 'India' },
        isActive: true,
        isVerified: true
      },
      {
        email: 'patient2@email.com',
        password: 'patient123',
        role: 'patient',
        firstName: 'Sneha',
        lastName: 'Joshi',
        phone: '9876543002',
        dateOfBirth: new Date('1988-09-22'),
        gender: 'female',
        address: { street: '222 JP Nagar', city: 'Bangalore', state: 'Karnataka', pincode: '560078', country: 'India' },
        isActive: true,
        isVerified: true
      }
    ]);

    const patients = await Patient.create([
      {
        user: patientUsers[0]._id,
        patientId: 'PAT001',
        bloodGroup: 'O+',
        emergencyContact: {
          name: 'Rajesh Verma',
          relation: 'Father',
          phone: '9876543011'
        },
        height: 175,
        weight: 70,
        allergies: [{ allergen: 'Penicillin', severity: 'moderate', reaction: 'Skin rash' }]
      },
      {
        user: patientUsers[1]._id,
        patientId: 'PAT002',
        bloodGroup: 'A+',
        emergencyContact: {
          name: 'Suresh Joshi',
          relation: 'Spouse',
          phone: '9876543012'
        },
        height: 162,
        weight: 58,
        chronicDiseases: ['Diabetes Type 2'],
        allergies: []
      }
    ]);

    // Create Billing Staff
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

    // Create Pharmacy Staff
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

    // Create Lab Technician
    const labUser = await User.create({
      email: 'lab@hospital.com',
      password: 'lab123',
      role: 'lab',
      firstName: 'Sunita',
      lastName: 'Desai',
      phone: '9876546001',
      dateOfBirth: new Date('1987-02-18'),
      gender: 'female',
      address: { street: '555 BTM Layout', city: 'Bangalore', state: 'Karnataka', pincode: '560076', country: 'India' },
      isActive: true,
      isVerified: true
    });

    console.log(`✅ Created ${doctorUsers.length + nurseUsers.length + patientUsers.length + 4} users`);

    // Create Medicines
    console.log('💊 Creating medicines...');
    const medicines = await Medicine.create([
      {
        medicineId: 'MED001',
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        manufacturer: 'PharmaCo Ltd',
        category: 'Tablet',
        description: 'Pain relief and fever reducer',
        strength: '500',
        unit: 'mg',
        packSize: 10,
        batchNumber: 'BATCH001',
        expiryDate: new Date('2025-12-31'),
        manufacturingDate: new Date('2024-01-01'),
        stock: { quantity: 500, reorderLevel: 100, maxStockLevel: 1000 },
        price: { mrp: 50, sellingPrice: 45, purchasePrice: 30 },
        supplier: { name: 'MediSupply Inc', contact: '9876000001', email: 'medisupply@email.com' },
        prescriptionRequired: false,
        isActive: true
      },
      {
        medicineId: 'MED002',
        name: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin',
        manufacturer: 'BioMed Pharma',
        category: 'Capsule',
        description: 'Antibiotic',
        strength: '250',
        unit: 'mg',
        packSize: 10,
        batchNumber: 'BATCH002',
        expiryDate: new Date('2025-06-30'),
        manufacturingDate: new Date('2024-01-15'),
        stock: { quantity: 300, reorderLevel: 50, maxStockLevel: 500 },
        price: { mrp: 120, sellingPrice: 110, purchasePrice: 80 },
        supplier: { name: 'MediSupply Inc', contact: '9876000001', email: 'medisupply@email.com' },
        prescriptionRequired: true,
        sideEffects: ['Nausea', 'Diarrhea', 'Skin rash'],
        isActive: true
      },
      {
        medicineId: 'MED003',
        name: 'Aspirin 75mg',
        genericName: 'Acetylsalicylic Acid',
        manufacturer: 'CardioMed',
        category: 'Tablet',
        description: 'Blood thinner',
        strength: '75',
        unit: 'mg',
        packSize: 30,
        batchNumber: 'BATCH003',
        expiryDate: new Date('2025-09-30'),
        manufacturingDate: new Date('2024-02-01'),
        stock: { quantity: 200, reorderLevel: 50, maxStockLevel: 400 },
        price: { mrp: 80, sellingPrice: 75, purchasePrice: 50 },
        supplier: { name: 'MediSupply Inc', contact: '9876000001', email: 'medisupply@email.com' },
        prescriptionRequired: true,
        isActive: true
      }
    ]);

    console.log(`✅ Created ${medicines.length} medicines`);

    // Create Beds
    console.log('🛏️  Creating beds...');
    const beds = [];
    const bedTypes = ['General', 'Semi-Private', 'Private', 'ICU'];
    const wards = ['A', 'B', 'C'];
    
    let bedCounter = 1;
    for (const ward of wards) {
      for (let i = 1; i <= 10; i++) {
        beds.push({
          bedNumber: `${ward}${i.toString().padStart(3, '0')}`,
          department: departments[Math.floor(Math.random() * departments.length)]._id,
          ward: `Ward ${ward}`,
          floor: Math.floor(Math.random() * 3) + 1,
          roomNumber: `${bedCounter}`,
          bedType: bedTypes[Math.floor(Math.random() * bedTypes.length)],
          status: Math.random() > 0.7 ? 'occupied' : 'vacant',
          dailyCharge: Math.floor(Math.random() * 2000) + 1000,
          facilities: [
            { name: 'Oxygen Support', isWorking: true },
            { name: 'Monitor', isWorking: true }
          ],
          isActive: true
        });
        bedCounter++;
      }
    }

    await Bed.create(beds);
    console.log(`✅ Created ${beds.length} beds`);

    // Create Appointments
    console.log('Creating appointments...');
    const appointmentStatuses = ['scheduled', 'completed', 'cancelled'];
    const appointmentTypes = ['consultation', 'follow-up', 'emergency'];
    
    const appointments = [];
    for (let i = 0; i < 10; i++) {
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 30) - 15); // Random date within ±15 days
      
      appointments.push({
        appointmentId: `APT${String(i + 1).padStart(6, '0')}`,
        patient: patients[i % 2]._id,
        doctor: doctors[i % 3]._id,
        department: departments[i % 5]._id,
        appointmentDate: appointmentDate,
        appointmentTime: `${9 + Math.floor(Math.random() * 8)}:00`,
        type: appointmentTypes[i % 3],
        status: appointmentStatuses[i % 3],
        symptoms: ['General checkup', 'Consultation'],
        notes: 'Regular appointment',
        consultationFee: 500 + (Math.floor(Math.random() * 5) * 100),
        paymentStatus: i % 2 === 0 ? 'paid' : 'pending'
      });
    }
    
    const createdAppointments = await Appointment.create(appointments);
    console.log(`✅ Created ${createdAppointments.length} appointments`);

    // Create Billing Records
    console.log('\n📄 Creating billing records...');
    const billingRecords = [];
    
    for (let i = 0; i < Math.min(5, createdAppointments.length); i++) {
      const appointment = createdAppointments[i];
      const patient = patients[i % patients.length];
      
      const items = [
        { 
          itemType: 'consultation',
          description: 'Consultation Fee', 
          quantity: 1, 
          unitPrice: appointment.consultationFee, 
          totalPrice: appointment.consultationFee 
        },
        { 
          itemType: 'lab-test',
          description: 'Blood Test + X-Ray', 
          quantity: 2, 
          unitPrice: 500, 
          totalPrice: 1000 
        }
      ];
      
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const discountAmount = subtotal * 0.1; // 10% discount
      const taxAmount = (subtotal - discountAmount) * 0.18; // 18% GST
      const totalAmount = subtotal - discountAmount + taxAmount;
      
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
        tax: {
          cgst: taxAmount / 2,
          sgst: taxAmount / 2,
          igst: 0
        },
        totalAmount,
        amountPaid: i < 3 ? totalAmount : 0,
        balanceAmount: i < 3 ? 0 : totalAmount,
        paymentStatus: i < 3 ? 'paid' : 'pending',
        paymentMethods: i < 3 ? [{
          method: ['cash', 'card', 'upi'][i % 3],
          amount: totalAmount,
          transactionId: `TXN${String(i + 1).padStart(10, '0')}`
        }] : [],
        generatedBy: billingUser._id
      });
    }
    
    await Billing.create(billingRecords);
    console.log(`✅ Created ${billingRecords.length} billing records`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('──────────────────────────────────');
    console.log('Admin: admin@hospital.com / admin123');
    console.log('Doctor: dr.sharma@hospital.com / doctor123');
    console.log('Nurse: nurse.anjali@hospital.com / nurse123');
    console.log('Patient: patient1@email.com / patient123');
    console.log('Billing: billing@hospital.com / billing123');
    console.log('Pharmacy: pharmacy@hospital.com / pharmacy123');
    console.log('Lab: lab@hospital.com / lab123');
    console.log('──────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
