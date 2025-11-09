import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { FiUsers, FiActivity, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { adminAPI } from '../../api/services';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      const data = response.data.data || response.data;
      setAnalytics({
        totalRevenue: data.totalRevenue || 0,
        totalPatients: data.totalPatients || 0,
        totalDoctors: data.totalDoctors || 0,
        totalAppointments: data.totalAppointments || 0,
        revenueGrowth: data.revenueGrowth || 0,
        patientGrowth: data.patientGrowth || 0
      });
    } catch (error) {
      toast.error('Failed to fetch analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="admin" />
        <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            System Analytics
          </h1>

          {loading ? (
            <p className="text-gray-500">Loading analytics...</p>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Revenue"
                  value={`₹${analytics?.totalRevenue?.toLocaleString() || 0}`}
                  icon={FiDollarSign}
                  color="green"
                  trend={`+${analytics?.revenueGrowth || 0}%`}
                />
                <StatCard
                  title="Total Patients"
                  value={analytics?.totalPatients || 0}
                  icon={FiUsers}
                  color="blue"
                  trend={`+${analytics?.patientGrowth || 0}%`}
                />
                <StatCard
                  title="Total Doctors"
                  value={analytics?.totalDoctors || 0}
                  icon={FiActivity}
                  color="purple"
                />
                <StatCard
                  title="Appointments"
                  value={analytics?.totalAppointments || 0}
                  icon={FiTrendingUp}
                  color="orange"
                />
              </div>

              {/* Revenue Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Revenue by Department
                  </h2>
                  <div className="space-y-3">
                    {[
                      { name: 'OPD', amount: 80000, percentage: 32 },
                      { name: 'IPD', amount: 120000, percentage: 48 },
                      { name: 'Pharmacy', amount: 30000, percentage: 12 },
                      { name: 'Lab', amount: 20000, percentage: 8 },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {item.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              ₹{item.amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Monthly Performance
                  </h2>
                  <div className="space-y-4">
                    {[
                      { month: 'January', revenue: 220000, patients: 145 },
                      { month: 'February', revenue: 235000, patients: 152 },
                      { month: 'March', revenue: 250000, patients: 168 },
                    ].map((item) => (
                      <div
                        key={item.month}
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.month}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            ₹{item.revenue.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{item.patients} patients</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Department Statistics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Department Statistics
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Doctors
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Patients
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Appointments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {[
                        { name: 'Cardiology', doctors: 5, patients: 45, appointments: 120, revenue: 85000 },
                        { name: 'Neurology', doctors: 4, patients: 32, appointments: 95, revenue: 72000 },
                        { name: 'Orthopedics', doctors: 6, patients: 38, appointments: 110, revenue: 68000 },
                        { name: 'Pediatrics', doctors: 5, patients: 55, appointments: 150, revenue: 45000 },
                      ].map((dept) => (
                        <tr key={dept.name}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {dept.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {dept.doctors}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {dept.patients}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {dept.appointments}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            ₹{dept.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default AdminAnalytics;
