import mongoose from 'mongoose';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';
import { generateDoctorId } from './utils/idGenerator.js';

mongoose.connect('mongodb://localhost:27017/hms')
  .then(async () => {
    console.log('👨‍⚕️ Recreating the original 12 doctors...\n');
    
    // Get departments
    const cardiology = await Department.findOne({ name: /cardiology/i });
    const neurology = await Department.findOne({ name: /neurology/i });
    const orthopedics = await Department.findOne({ name: /orthopedics/i });
    const pediatrics = await Department.findOne({ name: /pediatrics/i });
    const generalMed = await Department.findOne({ name: /general/i });
    
    const doctors = [
      {
        firstName: 'Kiran', lastName: 'Desai',
        email: 'dr.desai@hospital.com',
        phone: '9876541009',
        gender: 'male',
        dateOfBirth: '1985-05-15',
        specialization: 'Cardiologist',
        qualification: 'MD, DM (Cardiology)',
        department: cardiology?._id,
        password: 'doctor123'
      },
      {
        firstName: 'Rahul', lastName: 'Singh',
        email: 'dr.singh@hospital.com',
        phone: '9876541008',
        gender: 'male',
        dateOfBirth: '1987-03-22',
        specialization: 'Cardiologist',
        qualification: 'MBBS, MD (Cardiology)',
        department: cardiology?._id,
        password: 'doctor123'
      },
      {
        firstName: 'Divya', lastName: 'Iyer',
        email: 'dr.iyer@hospital.com',
        phone: '9876541012',
        gender: 'female',
        dateOfBirth: '1986-08-10',
        specialization: 'Neurologist',
        qualification: 'MBBS, MD, DM (Neurology)',
        department: neurology?._id,
        password: 'doctor123'
      },
      {
        firstName: 'Arif', lastName: 'Khan',
        email: 'dr.khan@hospital.com',
        phone: '9876541011',
        gender: 'male',
        dateOfBirth: '1988-11-05',
        specialization: 'Neurologist',
        qualification: 'MBBS, MD (Neurology)',
        department: neurology?._id,
        password: 'doctor123'
      },
      {
        firstName: 'Pooja', lastName: 'Verma',
        email: 'dr.verma@hospital.com',
        phone: '9876541010',
        gender: 'female',
        dateOfBirth: '1984-02-28',
        specialization: 'Orthopedic Surgeon',
        qualification: 'MBBS, MS (Orthopedics)',
        department: orthopedics?._id,
        password: 'doctor123'
      },
      {
        firstName: 'Lakshmi', lastName: 'Nair',
        email: 'dr.nair@hospital.com',
        phone: '9876541006',
        gender: 'female',
        dateOfBirth: '1989-06-18',
        specialization: 'Orthopedic Surgeon',
        qualification: 'MBBS, MS (Orthopedics)',
        department: orthopedics?._id,
        password: 'doctor123'
      },
      {
        firstName: 'Vikram', lastName: 'Reddy',
        email: 'dr.reddy@hospital.com',
        phone: '9876541004',
        gender: 'male',
        dateOfBirth: '1990-01-30',
        specialization: 'Pediatrician',
        qualification: 'MBBS, MD (Pediatrics)',
        department: pediatrics?._id,
        password: 'doctor123'
      },
      {
        firstName: 'Neha', lastName: 'Gupta',
        email: 'dr.gupta@hospital.com',
        phone: '9876541007',
        gender: 'female',
        dateOfBirth: '1987-09-12',
        specialization: 'Pediatrician',
        qualification: 'MBBS, MD (Pediatrics)',
        department: pediatrics?._id,
        password: 'doctor123'
      },
      {
        firstName: 'Amit', lastName: 'Kumar',
        email: 'dr.kumar@hospital.com',
        phone: '9876541005',
        gender: 'male',
        dateOfBirth: '1983-12-25',
        specialization: 'General Physician',
        qualification: 'MBBS, MD (General Medicine)',
        department: generalMed?._id,
        password: 'doctor123'
      },
      {
        firstName: 'Anjali', lastName: 'Patel',
        email: 'dr.patel@hospital.com',
        phone: '9876541002',
        gender: 'female',
        dateOfBirth: '1991-04-08',
        specialization: 'General Physician',
        qualification: 'MBBS, MD (General Medicine)',
        department: generalMed?._id,
        password: 'doctor123'
      },
      {
        firstName: 'Priya', lastName: 'Mehta',
        email: 'dr.mehta@hospital.com',
        phone: '9876541003',
        gender: 'female',
        dateOfBirth: '1985-07-20',
        specialization: 'Cardiologist',
        qualification: 'MBBS, MD, DM (Cardiology)',
        department: cardiology?._id,
        password: 'doctor123'
      },
      {
        firstName: 'Sanjay', lastName: 'Sharma',
        email: 'dr.sharma@hospital.com',
        phone: '9876541001',
        gender: 'male',
        dateOfBirth: '1986-10-14',
        specialization: 'Neurologist',
        qualification: 'MBBS, MD, DM (Neurology)',
        department: neurology?._id,
        password: 'doctor123'
      }
    ];
    
    for (const doctorData of doctors) {
      const fullName = `${doctorData.firstName} ${doctorData.lastName}`;
      
      // Create User
      const user = await User.create({
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        email: doctorData.email,
        password: doctorData.password,
        phone: doctorData.phone,
        gender: doctorData.gender,
        dateOfBirth: doctorData.dateOfBirth,
        role: 'doctor',
        isActive: true
      });
      
      // Create Doctor Profile
      const doctor = await Doctor.create({
        user: user._id,
        employeeId: generateDoctorId(),
        name: fullName,
        email: doctorData.email,
        phone: doctorData.phone,
        specialization: doctorData.specialization,
        qualification: doctorData.qualification,
        department: doctorData.department,
        experience: 10, // Default experience
        licenseNumber: `MED${Math.floor(Math.random() * 100000)}`,
        licenseExpiry: new Date('2026-12-31'),
        consultationFee: 500, // Default consultation fee
        isAvailable: true,
        isOnLeave: false,
        schedule: {
          monday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          tuesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          wednesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          thursday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          friday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          saturday: { isAvailable: true, startTime: '09:00', endTime: '13:00' },
          sunday: { isAvailable: false, startTime: null, endTime: null }
        }
      });
      
      console.log(`✅ Created: ${fullName} | ${doctorData.specialization} | Dept: ${doctorData.department ? 'Assigned' : 'No dept'}`);
    }
    
    console.log('\n✅ All 12 doctors created successfully!');
    console.log('\n📊 Summary by Department:');
    
    const byDept = await Doctor.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'dept'
        }
      },
      {
        $group: {
          _id: '$dept.name',
          count: { $sum: 1 }
        }
      }
    ]);
    
    byDept.forEach(d => {
      console.log(`   ${d._id}: ${d.count} doctors`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
