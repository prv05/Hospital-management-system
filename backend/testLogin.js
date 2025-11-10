import axios from 'axios';

const testLogin = async () => {
  const testCredentials = [
    { email: 'admin@hospital.com', password: 'admin123', role: 'Admin' },
    { email: 'dr.sharma@hospital.com', password: 'doctor123', role: 'Doctor' },
    { email: 'patient1@email.com', password: 'patient123', role: 'Patient' },
    { email: 'nurse1@hospital.com', password: 'nurse123', role: 'Nurse' },
  ];

  console.log('🔐 Testing Login Endpoint...\n');
  
  for (const cred of testCredentials) {
    try {
      console.log(`Testing ${cred.role} (${cred.email})...`);
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: cred.email,
        password: cred.password
      });
      
      console.log(`✅ ${cred.role} login successful!`);
      console.log(`   User: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`);
      console.log(`   Token received: ${response.data.data.accessToken ? 'Yes' : 'No'}\n`);
    } catch (error) {
      console.log(`❌ ${cred.role} login failed!`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}\n`);
    }
  }
};

testLogin();
