import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://romevernekar_db_user:VlSdY0rYQOEYUSra@hms.x7ljtzw.mongodb.net/hospital_management?retryWrites=true&w=majority&appName=HMS';

const staffUsers = [
  // Billing Staff
  {
    email: 'billing@hospital.com',
    password: 'billing123',
    role: 'billing',
    firstName: 'Ramesh',
    lastName: 'Kumar',
    phone: '9876543210',
    dateOfBirth: new Date('1988-05-15'),
    gender: 'male',
    address: {
      street: '123 Hospital Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    isActive: true
  },
  {
    email: 'billing2@hospital.com',
    password: 'billing123',
    role: 'billing',
    firstName: 'Priya',
    lastName: 'Sharma',
    phone: '9876543211',
    dateOfBirth: new Date('1990-08-20'),
    gender: 'female',
    address: {
      street: '124 Hospital Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    isActive: true
  },
  // Lab Staff
  {
    email: 'lab@hospital.com',
    password: 'lab123',
    role: 'lab',
    firstName: 'Suresh',
    lastName: 'Reddy',
    phone: '9876543212',
    dateOfBirth: new Date('1985-03-10'),
    gender: 'male',
    address: {
      street: '125 Hospital Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    isActive: true
  },
  {
    email: 'lab2@hospital.com',
    password: 'lab123',
    role: 'lab',
    firstName: 'Lakshmi',
    lastName: 'Menon',
    phone: '9876543213',
    dateOfBirth: new Date('1992-11-25'),
    gender: 'female',
    address: {
      street: '126 Hospital Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    isActive: true
  },
  // Pharmacy Staff
  {
    email: 'pharmacy@hospital.com',
    password: 'pharmacy123',
    role: 'pharmacy',
    firstName: 'Anil',
    lastName: 'Joshi',
    phone: '9876543214',
    dateOfBirth: new Date('1987-07-12'),
    gender: 'male',
    address: {
      street: '127 Hospital Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    isActive: true
  },
  {
    email: 'pharmacy2@hospital.com',
    password: 'pharmacy123',
    role: 'pharmacy',
    firstName: 'Kavita',
    lastName: 'Desai',
    phone: '9876543215',
    dateOfBirth: new Date('1991-09-18'),
    gender: 'female',
    address: {
      street: '128 Hospital Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    isActive: true
  }
];

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas\n');
    console.log('🔄 Creating staff users...\n');
    
    let created = 0;
    let skipped = 0;

    for (const userData of staffUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⏭️  Skipped: ${userData.email} (already exists)`);
          skipped++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Create user
        await User.create({
          ...userData,
          password: hashedPassword
        });

        console.log(`✅ Created: ${userData.role.toUpperCase()} - ${userData.firstName} ${userData.lastName} (${userData.email})`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${userData.email}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created} users`);
    console.log(`   ⏭️  Skipped: ${skipped} users\n`);

    console.log('📝 Login Credentials:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏥 BILLING STAFF:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Email: billing@hospital.com');
    console.log('   Password: billing123');
    console.log('   Name: Ramesh Kumar\n');
    console.log('2. Email: billing2@hospital.com');
    console.log('   Password: billing123');
    console.log('   Name: Priya Sharma\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔬 LAB STAFF:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Email: lab@hospital.com');
    console.log('   Password: lab123');
    console.log('   Name: Suresh Reddy\n');
    console.log('2. Email: lab2@hospital.com');
    console.log('   Password: lab123');
    console.log('   Name: Lakshmi Menon\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💊 PHARMACY STAFF:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Email: pharmacy@hospital.com');
    console.log('   Password: pharmacy123');
    console.log('   Name: Anil Joshi\n');
    console.log('2. Email: pharmacy2@hospital.com');
    console.log('   Password: pharmacy123');
    console.log('   Name: Kavita Desai\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 Done! Staff users created successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
