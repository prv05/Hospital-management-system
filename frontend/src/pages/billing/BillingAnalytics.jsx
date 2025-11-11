import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';
import { FiDollarSign, FiTrendingUp, FiFileText, FiClock } from 'react-icons/fi';

const BillingAnalytics = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    billsGenerated: 0,
    collectionRate: 0
  });
  const [revenueByType, setRevenueByType] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/billing/search');
      const bills = data.data || [];

      const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      const pendingAmount = bills.filter(b => b.paymentStatus !== 'paid')
        .reduce((sum, bill) => sum + bill.balanceAmount, 0);
      const amountCollected = bills.reduce((sum, bill) => sum + bill.amountPaid, 0);
      const collectionRate = totalRevenue > 0 ? ((amountCollected / totalRevenue) * 100).toFixed(0) : 0;

      setStats({
        totalRevenue,
        pendingAmount,
        billsGenerated: bills.length,
        collectionRate
      });

      // Calculate revenue by type
      const typeRevenue = ['OPD', 'IPD', 'Emergency', 'Lab', 'Pharmacy'].map(type => {
        const typeBills = bills.filter(b => b.billType === type);
        const amount = typeBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
        const percentage = totalRevenue > 0 ? ((amount / totalRevenue) * 100) : 0;
        return { type, amount, percentage };
      }).filter(item => item.amount > 0);

      setRevenueByType(typeRevenue);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          <Sidebar role="billing" />
          <div className="flex-1 ml-64 mt-16 flex items-center justify-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="billing" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Billing Analytics
            </h1>
            <p className="text-sky-600 dark:text-sky-400 mb-8">View revenue and performance metrics</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Total Revenue" 
                value={`₹${stats.totalRevenue.toLocaleString()}`} 
                icon={FiDollarSign} 
                color="green" 
              />
              <StatCard 
                title="Pending Amount" 
                value={`₹${stats.pendingAmount.toLocaleString()}`} 
                icon={FiClock} 
                color="orange" 
              />
              <StatCard 
                title="Bills Generated" 
                value={stats.billsGenerated} 
                icon={FiFileText} 
                color="blue" 
              />
              <StatCard 
                title="Collection Rate" 
                value={`${stats.collectionRate}%`} 
                icon={FiTrendingUp} 
                color="purple" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-sky-600 dark:text-sky-400">Revenue by Type</h2>
                {revenueByType.length > 0 ? (
                  <div className="space-y-4">
                    {revenueByType.map((item) => (
                      <div key={item.type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-900 dark:text-white">{item.type}</span>
                          <span className="text-gray-700 dark:text-gray-300">₹{item.amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No revenue data available</p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-sky-600 dark:text-sky-400">Payment Methods</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Payment method tracking coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BillingAnalytics;
