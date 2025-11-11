import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiCalendar, FiUsers, FiActivity, FiFileText, 
  FiPackage, FiDollarSign, FiSettings, FiBell, FiLogOut, FiClipboard 
} from 'react-icons/fi';
import useAuthStore from '../store/authStore';

const Sidebar = ({ role }) => {
  const { logout } = useAuthStore();

  const navigationMap = {
    doctor: [
      { name: 'Dashboard', path: '/doctor/dashboard', icon: FiHome },
      { name: 'Appointments', path: '/doctor/appointments', icon: FiCalendar },
      { name: 'Patient Queue', path: '/doctor/queue', icon: FiUsers },
      { name: 'Patients', path: '/doctor/patients', icon: FiActivity },
      { name: 'Analytics', path: '/doctor/analytics', icon: FiFileText },
    ],
    patient: [
      { name: 'Dashboard', path: '/patient/dashboard', icon: FiHome },
      { name: 'Book Appointment', path: '/patient/book', icon: FiCalendar },
      { name: 'My Appointments', path: '/patient/appointments', icon: FiCalendar },
      { name: 'Medical History', path: '/patient/history', icon: FiFileText },
      { name: 'My Bills', path: '/patient/bills', icon: FiDollarSign },
      { name: 'Lab Tests', path: '/patient/lab-tests', icon: FiActivity },
      { name: 'Prescriptions', path: '/patient/prescriptions', icon: FiClipboard },
    ],
    nurse: [
      { name: 'Dashboard', path: '/nurse/dashboard', icon: FiHome },
      { name: 'Assigned Patients', path: '/nurse/patients', icon: FiUsers },
      { name: 'Bed Management', path: '/nurse/beds', icon: FiActivity },
      { name: 'Attendance', path: '/nurse/attendance', icon: FiFileText },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
      { name: 'Users', path: '/admin/users', icon: FiUsers },
      { name: 'Departments', path: '/admin/departments', icon: FiActivity },
      { name: 'Appointments', path: '/admin/appointments', icon: FiCalendar },
      { name: 'Beds', path: '/admin/beds', icon: FiPackage },
      { name: 'Analytics', path: '/admin/analytics', icon: FiFileText },
    ],
    billing: [
      { name: 'Dashboard', path: '/billing/dashboard', icon: FiHome },
      { name: 'Generate Bill', path: '/billing/generate', icon: FiDollarSign },
      { name: 'Search Bills', path: '/billing/search', icon: FiFileText },
      { name: 'Analytics', path: '/billing/analytics', icon: FiActivity },
    ],
    pharmacy: [
      { name: 'Dashboard', path: '/pharmacy/dashboard', icon: FiHome },
      { name: 'Medicines', path: '/pharmacy/medicines', icon: FiPackage },
      { name: 'Dispense', path: '/pharmacy/dispense', icon: FiActivity },
      { name: 'Alerts', path: '/pharmacy/alerts', icon: FiBell },
    ],
    lab: [
      { name: 'Dashboard', path: '/lab/dashboard', icon: FiHome },
      { name: 'Test Requests', path: '/lab/tests', icon: FiFileText },
      { name: 'Pending Tests', path: '/lab/pending', icon: FiBell },
      { name: 'Analytics', path: '/lab/analytics', icon: FiActivity },
    ],
  };

  const navigation = navigationMap[role] || [];

  const handleLogout = () => {
    logout();
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-16 overflow-y-auto">
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <NavLink
            to={`/${role}/settings`}
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <FiSettings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition w-full"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
