import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { FiFileText, FiClock, FiCheckCircle, FiDollarSign } from 'react-icons/fi';

const LabDashboard = () => {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="lab" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Lab Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Pending Tests" value={0} icon={FiClock} color="orange" />
            <StatCard title="Completed Tests" value={0} icon={FiCheckCircle} color="green" />
            <StatCard title="Total Requests" value={0} icon={FiFileText} color="blue" />
            <StatCard title="Revenue" value="₹0" icon={FiDollarSign} color="purple" />
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default LabDashboard;
