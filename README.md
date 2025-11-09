# 🏥 Hospital Management System (HMS)

A comprehensive, production-level Hospital Management System built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring role-based dashboards for doctors, patients, nurses, admin, billing staff, pharmacy, and lab technicians.

## ✨ Features

### 🎯 **Multi-Role Dashboard System**

#### 👨‍⚕️ **Doctor Dashboard**
- Daily/Weekly/Monthly appointment calendar
- Patient queue management (Waiting, In Consultation, Completed)
- Quick patient search with full medical history
- Consultation notes and prescription management
- Analytics: patients seen, common diagnoses, surgery count
- Real-time emergency patient alerts

#### 🧑 **Patient Dashboard**
- Book, reschedule, and cancel appointments
- View medical history, lab results, and prescriptions
- Access billing invoices with PDF download
- Insurance details and claim tracking
- Online payment gateway integration (UPI/Card/NetBanking)
- Family member and emergency contact management

#### 💉 **Nurse Dashboard**
- View assigned patients with bed/room numbers
- Record patient vitals (BP, Temp, Pulse, SpO2)
- Medication schedule tracking
- IV/Injection/Drip management
- Real-time bed occupancy status
- Shift timing and attendance management

#### 💵 **Billing Dashboard**
- Search patients by name/ID/phone/admission
- Generate OPD, IPD, and Emergency bills
- Auto-calculate room charges based on stay duration
- Apply discounts, GST, and insurance
- Split payments (UPI + Cash + Card)
- Revenue analytics with charts
- Download invoices as PDF

#### 🧪 **Lab Technician Dashboard**
- View doctor test requests with urgency levels
- Sample collection with barcode/QR generation
- Update test status (Pending → In Process → Completed)
- Upload test results (text or PDF)
- Auto-send reports to doctor and patient
- Lab inventory and reagent expiry alerts
- Lab revenue analytics

#### 💊 **Pharmacy Dashboard**
- Medicine inventory management
- Add/Update/Delete medicines
- Dispense medicines linked to prescriptions
- Stock alerts (low stock, expiring soon)
- Supplier management and purchase records
- Pharmacy billing with printable receipts

#### 🛠 **Admin Dashboard**
- Create/Edit/Delete users (all roles)
- Role and permission management
- Manage departments, wards, rooms, and ICU beds
- Doctor shift scheduling and leave approval
- System-wide analytics (OPD/IPD/Pharmacy/Lab revenue)
- License renewal alerts
- System logs and unauthorized access alerts

## 🗂️ Project Structure

```
HMS/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   ├── nurseController.js
│   │   ├── adminController.js
│   │   ├── billingController.js
│   │   ├── pharmacyController.js
│   │   └── labController.js
│   ├── middlewares/
│   │   ├── auth.js               # JWT authentication & RBAC
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Patient.js
│   │   ├── Nurse.js
│   │   ├── Appointment.js
│   │   ├── Prescription.js
│   │   ├── LabTest.js
│   │   ├── Medicine.js
│   │   ├── Billing.js
│   │   ├── Bed.js
│   │   ├── Admission.js
│   │   └── Department.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── nurseRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── billingRoutes.js
│   │   ├── pharmacyRoutes.js
│   │   ├── labRoutes.js
│   │   ├── appointmentRoutes.js
│   │   └── departmentRoutes.js
│   ├── seeds/
│   │   └── seedData.js           # Dummy data for testing
│   ├── utils/
│   │   ├── tokenHelper.js
│   │   ├── idGenerator.js
│   │   └── asyncHandler.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js          # Axios instance with interceptors
    │   │   └── services.js       # API service layer
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Card.jsx
    │   │   ├── StatCard.jsx
    │   │   └── Table.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── BookAppointment.jsx
    │   │   └── dashboards/
    │   │       ├── DoctorDashboard.jsx
    │   │       ├── PatientDashboard.jsx
    │   │       ├── NurseDashboard.jsx
    │   │       ├── AdminDashboard.jsx
    │   │       ├── BillingDashboard.jsx
    │   │       ├── PharmacyDashboard.jsx
    │   │       └── LabDashboard.jsx
    │   ├── store/
    │   │   ├── authStore.js      # Zustand auth state
    │   │   └── themeStore.js     # Dark/Light mode
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Update .env with your MongoDB URI:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/hospital_management
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   JWT_EXPIRE=24h
   JWT_REFRESH_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

5. **Seed the database (optional, for testing):**
   ```bash
   npm run seed
   ```

6. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Update .env:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 🔑 Test Credentials

After running the seed script, use these credentials to login:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | admin123 |
| Doctor | dr.sharma@hospital.com | doctor123 |
| Patient | patient1@email.com | patient123 |
| Nurse | nurse.anjali@hospital.com | nurse123 |
| Billing | billing@hospital.com | billing123 |
| Pharmacy | pharmacy@hospital.com | pharmacy123 |
| Lab | lab@hospital.com | lab123 |

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **cookie-parser** - Cookie handling

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Zustand** - State management
- **Chart.js / Recharts** - Data visualization
- **React Hot Toast** - Notifications
- **React Icons** - Icon library
- **date-fns** - Date manipulation

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Doctor
- `GET /api/doctors/dashboard` - Get doctor dashboard data
- `GET /api/doctors/appointments` - Get all appointments
- `GET /api/doctors/queue` - Get patient queue
- `GET /api/doctors/patients/search` - Search patients
- `GET /api/doctors/patients/:id` - Get patient details
- `PUT /api/doctors/appointments/:id/consultation` - Update consultation notes
- `PATCH /api/doctors/appointments/:id/status` - Update appointment status
- `GET /api/doctors/analytics` - Get doctor analytics

### Patient
- `GET /api/patients/dashboard` - Get patient dashboard
- `POST /api/patients/appointments` - Book appointment
- `GET /api/patients/appointments` - Get my appointments
- `DELETE /api/patients/appointments/:id` - Cancel appointment
- `GET /api/patients/medical-history` - Get medical history
- `GET /api/patients/billing` - Get billing history
- `PUT /api/patients/profile` - Update profile

### Billing
- `POST /api/billing/generate` - Generate new bill
- `GET /api/billing/search` - Search bills
- `GET /api/billing/:id` - Get bill by ID
- `POST /api/billing/:id/payment` - Add payment
- `GET /api/billing/analytics` - Get revenue analytics
- `PATCH /api/billing/:id/discount` - Apply discount

### Pharmacy
- `GET /api/pharmacy/medicines` - Get all medicines
- `POST /api/pharmacy/medicines` - Add medicine
- `PUT /api/pharmacy/medicines/:id` - Update medicine
- `DELETE /api/pharmacy/medicines/:id` - Delete medicine
- `POST /api/pharmacy/dispense` - Dispense medicine
- `PATCH /api/pharmacy/medicines/:id/stock` - Update stock
- `GET /api/pharmacy/analytics` - Get pharmacy analytics
- `GET /api/pharmacy/alerts` - Get stock alerts

### Lab
- `GET /api/lab/tests` - Get all lab tests
- `POST /api/lab/tests` - Create lab test
- `PATCH /api/lab/tests/:id/status` - Update test status
- `PUT /api/lab/tests/:id/results` - Add test results
- `GET /api/lab/tests/:id` - Get test by ID
- `GET /api/lab/analytics` - Get lab analytics
- `GET /api/lab/pending` - Get pending tests

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/departments` - Get all departments
- `POST /api/admin/departments` - Create department
- `GET /api/admin/beds` - Get all beds
- `POST /api/admin/beds` - Create bed
- `GET /api/admin/analytics` - Get system analytics

## 🔐 Security Features

- JWT-based authentication with access and refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Request validation
- CORS configuration
- Secure HTTP headers
- Token expiration and refresh mechanism
- Protected API routes

## 🎨 UI Features

- Beautiful hospital-grade modern UI
- Responsive design (Mobile, Tablet, Desktop)
- Dark/Light mode toggle
- Real-time notifications
- Interactive charts and analytics
- Smooth animations and transitions
- Accessibility features

## 📝 Database Models

- **User** - Base user model with authentication
- **Doctor** - Doctor profile with specialization, availability, ratings
- **Patient** - Patient records with medical history, allergies, insurance
- **Nurse** - Nurse profile with shifts, assigned patients
- **Appointment** - Appointment scheduling with vitals, consultation notes
- **Prescription** - Medicine prescriptions with dosage, duration
- **LabTest** - Lab test requests with results, status tracking
- **Medicine** - Pharmacy inventory with stock levels, expiry tracking
- **Billing** - Invoice generation with payment tracking
- **Bed** - Bed management with occupancy status
- **Admission** - Patient admission records with procedures, surgeries
- **Department** - Hospital departments with specialties

## 🚧 Future Enhancements

- Video consultation feature
- Mobile app (React Native)
- SMS and email notifications
- Advanced reporting and analytics
- Inventory management for medical supplies
- Staff payroll management
- Patient portal mobile app
- Integration with medical devices (IoT)
- AI-powered diagnosis assistance
- Telemedicine features
- Electronic Health Records (EHR) integration

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Developer

Built with ❤️ by the development team

## 🙏 Acknowledgments

- Hospital staff for requirements gathering
- Medical professionals for domain expertise
- Open-source community for amazing tools and libraries

---

## 📞 Support

For support, email support@healthcare.com or create an issue in the repository.

## 🌟 Star this repository if you find it helpful!
