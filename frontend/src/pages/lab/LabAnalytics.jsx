import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { FiActivity, FiCheckCircle, FiClock, FiDollarSign } from 'react-icons/fi';

const LabAnalytics = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="lab" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Lab Analytics
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Tests" value="456" icon={FiActivity} color="blue" />
            <StatCard title="Completed Today" value="32" icon={FiCheckCircle} color="green" />
            <StatCard title="Pending" value="18" icon={FiClock} color="orange" />
            <StatCard title="Revenue" value="₹85,000" icon={FiDollarSign} color="purple" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Popular Tests</h2>
              <div className="space-y-3">
                {[
                  { test: 'Complete Blood Count (CBC)', count: 125 },
                  { test: 'Blood Sugar Test', count: 98 },
                  { test: 'Lipid Profile', count: 76 },
                  { test: 'Liver Function Test', count: 64 },
                  { test: 'Kidney Function Test', count: 52 }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="font-medium">{item.test}</span>
                    <span className="text-primary-600 font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Test Turnaround Time</h2>
              <div className="space-y-3">
                {[
                  { test: 'CBC', time: '2 hours', status: 'On Time' },
                  { test: 'Blood Sugar', time: '1 hour', status: 'On Time' },
                  { test: 'Culture Test', time: '48 hours', status: 'On Time' },
                  { test: 'Biopsy', time: '5 days', status: 'Delayed' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <p className="font-medium">{item.test}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status === 'On Time' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
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

export default LabAnalytics;
