import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { FiDollarSign, FiTrendingUp, FiFileText, FiClock } from 'react-icons/fi';

const BillingAnalytics = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="billing" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Billing Analytics
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Revenue" value="₹2,50,000" icon={FiDollarSign} color="green" trend="+15%" />
            <StatCard title="Pending Amount" value="₹45,000" icon={FiClock} color="orange" />
            <StatCard title="Bills Generated" value="156" icon={FiFileText} color="blue" />
            <StatCard title="Collection Rate" value="94%" icon={FiTrendingUp} color="purple" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Revenue by Type</h2>
              <div className="space-y-3">
                {[
                  { type: 'OPD', amount: 80000, percentage: 32 },
                  { type: 'IPD', amount: 120000, percentage: 48 },
                  { type: 'Pharmacy', amount: 30000, percentage: 12 },
                  { type: 'Lab', amount: 20000, percentage: 8 }
                ].map((item) => (
                  <div key={item.type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.type}</span>
                      <span className="text-gray-500">₹{item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
              <div className="space-y-3">
                {[
                  { method: 'Cash', count: 45, amount: 67500 },
                  { method: 'Card', count: 62, amount: 112000 },
                  { method: 'UPI', count: 38, amount: 52000 },
                  { method: 'Insurance', count: 11, amount: 18500 }
                ].map((item) => (
                  <div key={item.method} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <p className="font-medium">{item.method}</p>
                      <p className="text-xs text-gray-500">{item.count} transactions</p>
                    </div>
                    <p className="font-semibold text-primary-600">₹{item.amount.toLocaleString()}</p>
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

export default BillingAnalytics;
