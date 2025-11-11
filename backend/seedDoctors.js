import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Direct MongoDB connection
mongoose.connect('mongodb://localhost:27017/hms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Define schemas inline
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: String,
  dateOfBirth: Date,
  gender: String,
  address: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const departmentSchema = new mongoose.Schema({
  name: String,
  description: String,
  isActive: { type: Boolean, default: true },
});

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorId: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  specialization: String,
  qualification: String,
  experience: Number,
  consultationFee: Number,
  availability: [{
    day: String,
    slots: [{ startTime: String, endTime: String }]
  }],
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Department = mongoose.model('Department', departmentSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);

const seedDoctors = async () => {
  try {
    console.log('🌱 Starting to seed doctors...');

    // Create departments
    const departments = [
      { name: 'Cardiology', description: 'Heart and cardiovascular care' },
      { name: 'Neurology', description: 'Brain and nervous system care' },
      { name: 'Orthopedics', description: 'Bone and joint care' },
      { name: 'Pediatrics', description: 'Child healthcare' },
      { name: 'General Medicine', description: 'General healthcare' },
    ];

    const createdDepts = [];
    for (const dept of departments) {
      let department = await Department.findOne({ name: dept.name });
      if (!department) {
        department = await Department.create(dept);
        console.log(`✅ Created department: ${dept.name}`);
      } else {
        console.log(`ℹ️  Department already exists: ${dept.name}`);
      }
      createdDepts.push(department);
    }

    // Create doctors
    const doctorsData = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@hospital.com',
        specialization: 'Cardiologist',
        qualification: 'MD, DM (Cardiology)',
        experience: 15,
        consultationFee: 1500,
        department: 0,
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@hospital.com',
        specialization: 'Cardiologist',
        qualification: 'MBBS, MD (Cardiology)',
        experience: 10,
        consultationFee: 1200,
        department: 0,
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@hospital.com',
        specialization: 'Neurologist',
        qualification: 'MD, DM (Neurology)',
        experience: 12,
        consultationFee: 1400,
        department: 1,
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@hospital.com',
        specialization: 'Neurologist',
        qualification: 'MBBS, MD (Neurology)',
        experience: 8,
        consultationFee: 1100,
        department: 1,
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@hospital.com',
        specialization: 'Orthopedic Surgeon',
        qualification: 'MS (Orthopedics)',
        experience: 18,
        consultationFee: 1600,
        department: 2,
      },
      {
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@hospital.com',
        specialization: 'Orthopedic Surgeon',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: 7,
        consultationFee: 1000,
        department: 2,
      },
      {
        firstName: 'Robert',
        lastName: 'Taylor',
        email: 'robert.taylor@hospital.com',
        specialization: 'Pediatrician',
        qualification: 'MD (Pediatrics)',
        experience: 14,
        consultationFee: 900,
        department: 3,
      },
      {
        firstName: 'Jennifer',
        lastName: 'Martinez',
        email: 'jennifer.martinez@hospital.com',
        specialization: 'Pediatrician',
        qualification: 'MBBS, MD (Pediatrics)',
        experience: 9,
        consultationFee: 800,
        department: 3,
      },
      {
        firstName: 'James',
        lastName: 'Garcia',
        email: 'james.garcia@hospital.com',
        specialization: 'General Physician',
        qualification: 'MBBS, MD (Medicine)',
        experience: 11,
        consultationFee: 700,
        department: 4,
      },
      {
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.rodriguez@hospital.com',
        specialization: 'General Physician',
        qualification: 'MBBS, MD',
        experience: 6,
        consultationFee: 600,
        department: 4,
      },
      {
        firstName: 'William',
        lastName: 'Lee',
        email: 'william.lee@hospital.com',
        specialization: 'Cardiologist',
        qualification: 'MD, FACC',
        experience: 20,
        consultationFee: 2000,
        department: 0,
      },
      {
        firstName: 'Patricia',
        lastName: 'White',
        email: 'patricia.white@hospital.com',
        specialization: 'Neurologist',
        qualification: 'MD, PhD (Neurology)',
        experience: 16,
        consultationFee: 1800,
        department: 1,
      },
    ];

    const hashedPassword = await bcrypt.hash('password123', 10);

    let doctorCount = 0;
    for (const docData of doctorsData) {
      // Check if user already exists
      let user = await User.findOne({ email: docData.email });
      
      if (!user) {
        user = await User.create({
          firstName: docData.firstName,
          lastName: docData.lastName,
          email: docData.email,
          password: hashedPassword,
          phone: `+91${9000000000 + doctorCount}`,
          role: 'doctor',
          dateOfBirth: new Date('1980-01-01'),
          gender: ['John', 'Michael', 'David', 'Robert', 'James', 'William'].includes(docData.firstName) ? 'male' : 'female',
          address: 'Hospital Campus',
          isActive: true,
        });
        console.log(`✅ Created user: Dr. ${docData.firstName} ${docData.lastName}`);
      } else {
        console.log(`ℹ️  User already exists: ${docData.email}`);
      }

      // Check if doctor profile exists
      let doctor = await Doctor.findOne({ user: user._id });
      
      if (!doctor) {
        doctor = await Doctor.create({
          user: user._id,
          doctorId: `DOC${String(doctorCount + 1).padStart(4, '0')}`,
          department: createdDepts[docData.department]._id,
          specialization: docData.specialization,
          qualification: docData.qualification,
          experience: docData.experience,
          consultationFee: docData.consultationFee,
          availability: [
            {
              day: 'Monday',
              slots: [{ startTime: '09:00', endTime: '17:00' }]
            },
            {
              day: 'Tuesday',
              slots: [{ startTime: '09:00', endTime: '17:00' }]
            },
            {
              day: 'Wednesday',
              slots: [{ startTime: '09:00', endTime: '17:00' }]
            },
            {
              day: 'Thursday',
              slots: [{ startTime: '09:00', endTime: '17:00' }]
            },
            {
              day: 'Friday',
              slots: [{ startTime: '09:00', endTime: '17:00' }]
            },
          ],
          isAvailable: true,
        });
        console.log(`✅ Created doctor profile: Dr. ${docData.firstName} ${docData.lastName} - ${docData.specialization}`);
      } else {
        console.log(`ℹ️  Doctor profile already exists for: ${docData.email}`);
      }

      doctorCount++;
    }

    console.log(`\n🎉 Successfully seeded ${doctorCount} doctors!`);
    
    // Verify
    const totalDoctors = await Doctor.find().countDocuments();
    console.log(`📊 Total doctors in database: ${totalDoctors}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
};

// Run the seed
seedDoctors();
