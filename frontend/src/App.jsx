import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import BookAppointment from './pages/BookAppointment';

// Dashboards
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import PatientDashboard from './pages/dashboards/PatientDashboard';
import NurseDashboard from './pages/dashboards/NurseDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import BillingDashboard from './pages/dashboards/BillingDashboard';
import PharmacyDashboard from './pages/dashboards/PharmacyDashboard';
import LabDashboard from './pages/dashboards/LabDashboard';

// Admin Pages
import UsersManagement from './pages/admin/UsersManagement';
import DepartmentsManagement from './pages/admin/DepartmentsManagement';
import AppointmentsManagement from './pages/admin/AppointmentsManagement';
import BedsManagement from './pages/admin/AdminAnalytics';
import AnalyticsPage from './pages/admin/AnalyticsPage';

// Doctor Pages
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import PatientQueue from './pages/doctor/PatientQueue';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorAnalytics from './pages/doctor/DoctorAnalytics';
import PatientDetailsPage from './pages/doctor/PatientDetailsPage';

// Patient Pages
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import MyAppointments from './pages/patient/MyAppointments';
import MedicalHistory from './pages/patient/MedicalHistory';
import PatientBilling from './pages/patient/PatientBilling';
import MyBills from './pages/patient/MyBills';
import MyLabTests from './pages/patient/MyLabTests';
import MyPrescriptions from './pages/patient/MyPrescriptions';

// Nurse Pages
import AssignedPatients from './pages/nurse/AssignedPatients';
import BedManagement from './pages/nurse/BedManagement';
import NurseAttendance from './pages/nurse/NurseAttendance';

// Billing Pages
import GenerateBill from './pages/billing/GenerateBill';
import SearchBills from './pages/billing/SearchBills';
import BillingAnalytics from './pages/billing/BillingAnalytics';

// Pharmacy Pages
import MedicineInventory from './pages/pharmacy/MedicineInventory';
import DispenseMedicine from './pages/pharmacy/DispenseMedicine';
import PharmacyAlerts from './pages/pharmacy/PharmacyAlerts';

// Lab Pages
import LabTests from './pages/lab/LabTests';
import PendingTests from './pages/lab/PendingTests';
import LabAnalytics from './pages/lab/LabAnalytics';

// Settings Page (shared across all roles)
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Redirect to appropriate dashboard if logged in and on home page
  const getDefaultRedirect = () => {
    if (!isAuthenticated || !user) return '/';

    const dashboardMap = {
      doctor: '/doctor/dashboard',
      patient: '/patient/dashboard',
      nurse: '/nurse/dashboard',
      admin: '/admin/dashboard',
      billing: '/billing/dashboard',
      pharmacy: '/pharmacy/dashboard',
      lab: '/lab/dashboard',
    };

    return dashboardMap[user.role] || '/';
  };

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to={getDefaultRedirect()} replace /> : <Register />} />
        <Route path="/book-appointment" element={<BookAppointment />} />

        {/* Doctor Routes */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/queue"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <PatientQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorPatients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients/:id"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <PatientDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/analytics"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Patient Routes */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/book"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <BookAppointmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MyAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/history"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MedicalHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/billing"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientBilling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/bills"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MyBills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/lab-tests"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MyLabTests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/prescriptions"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MyPrescriptions />
            </ProtectedRoute>
          }
        />

        {/* Nurse Routes */}
        <Route
          path="/nurse/dashboard"
          element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DepartmentsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/beds"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BedsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppointmentsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Billing Routes */}
        <Route
          path="/billing/dashboard"
          element={
            <ProtectedRoute allowedRoles={['billing', 'admin']}>
              <BillingDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/generate"
          element={
            <ProtectedRoute allowedRoles={['billing', 'admin']}>
              <GenerateBill />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/search"
          element={
            <ProtectedRoute allowedRoles={['billing', 'admin']}>
              <SearchBills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/analytics"
          element={
            <ProtectedRoute allowedRoles={['billing', 'admin']}>
              <BillingAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Pharmacy Routes */}
        <Route
          path="/pharmacy/dashboard"
          element={
            <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
              <PharmacyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/medicines"
          element={
            <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
              <MedicineInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/dispense"
          element={
            <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
              <DispenseMedicine />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/alerts"
          element={
            <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
              <PharmacyAlerts />
            </ProtectedRoute>
          }
        />

        {/* Lab Routes */}
        <Route
          path="/lab/dashboard"
          element={
            <ProtectedRoute allowedRoles={['lab', 'admin']}>
              <LabDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/tests"
          element={
            <ProtectedRoute allowedRoles={['lab', 'admin']}>
              <LabTests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/pending"
          element={
            <ProtectedRoute allowedRoles={['lab', 'admin']}>
              <PendingTests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/analytics"
          element={
            <ProtectedRoute allowedRoles={['lab', 'admin']}>
              <LabAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Nurse Routes */}
        <Route
          path="/nurse/dashboard"
          element={
            <ProtectedRoute allowedRoles={['nurse', 'admin']}>
              <NurseDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/patients"
          element={
            <ProtectedRoute allowedRoles={['nurse', 'admin']}>
              <AssignedPatients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/beds"
          element={
            <ProtectedRoute allowedRoles={['nurse', 'admin']}>
              <BedManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/attendance"
          element={
            <ProtectedRoute allowedRoles={['nurse', 'admin']}>
              <NurseAttendance />
            </ProtectedRoute>
          }
        />

        {/* Settings Routes for All Roles */}
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/settings"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/settings"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/settings"
          element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/settings"
          element={
            <ProtectedRoute allowedRoles={['billing']}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/settings"
          element={
            <ProtectedRoute allowedRoles={['pharmacy']}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab/settings"
          element={
            <ProtectedRoute allowedRoles={['lab']}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
