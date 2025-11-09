import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { FiPackage, FiAlertCircle, FiTrendingDown, FiDollarSign } from 'react-icons/fi';

const PharmacyDashboard = () => {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="pharmacy" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Pharmacy Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Medicines" value={0} icon={FiPackage} color="blue" />
            <StatCard title="Low Stock" value={0} icon={FiAlertCircle} color="red" />
            <StatCard title="Expiring Soon" value={0} icon={FiTrendingDown} color="orange" />
            <StatCard title="Today Revenue" value="₹0" icon={FiDollarSign} color="green" />
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default PharmacyDashboard;
