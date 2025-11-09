import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { FiDollarSign, FiFileText, FiTrendingUp, FiClock } from 'react-icons/fi';

const BillingDashboard = () => {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="billing" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Billing Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Today Revenue" value="₹0" icon={FiDollarSign} color="green" />
            <StatCard title="Pending Bills" value={0} icon={FiFileText} color="red" />
            <StatCard title="Bills Generated" value={0} icon={FiTrendingUp} color="blue" />
            <StatCard title="Pending Amount" value="₹0" icon={FiClock} color="orange" />
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default BillingDashboard;
