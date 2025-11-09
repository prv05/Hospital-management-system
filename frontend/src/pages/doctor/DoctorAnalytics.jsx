import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { FiUsers, FiActivity, FiFileText, FiTrendingUp } from 'react-icons/fi';

const DoctorAnalytics = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="doctor" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Analytics & Reports
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Patients" value={145} icon={FiUsers} color="blue" />
            <StatCard title="Appointments" value={320} icon={FiActivity} color="green" />
            <StatCard title="Consultations" value={285} icon={FiFileText} color="purple" />
            <StatCard title="Success Rate" value="94%" icon={FiTrendingUp} color="orange" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Common Diagnoses</h2>
              <div className="space-y-3">
                {[
                  { diagnosis: 'Hypertension', count: 45 },
                  { diagnosis: 'Diabetes Type 2', count: 38 },
                  { diagnosis: 'Common Cold', count: 62 },
                  { diagnosis: 'Migraine', count: 28 }
                ].map((item) => (
                  <div key={item.diagnosis} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="font-medium">{item.diagnosis}</span>
                    <span className="text-primary-600 font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Monthly Performance</h2>
              <div className="space-y-3">
                {[
                  { month: 'January', patients: 48 },
                  { month: 'February', patients: 52 },
                  { month: 'March', patients: 45 }
                ].map((item) => (
                  <div key={item.month} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="font-medium">{item.month}</span>
                    <span className="text-green-600 font-semibold">{item.patients} patients</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAnalytics;
