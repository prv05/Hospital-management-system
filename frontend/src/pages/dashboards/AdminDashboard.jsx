import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { FiUsers, FiActivity, FiHome, FiDollarSign } from 'react-icons/fi';
import { adminAPI } from '../../api/services';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalBeds: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      const data = response.data.data || response.data;
      // Handle nested stats object
      const statsData = data.stats || data;
      setStats({
        totalPatients: statsData.totalPatients || 0,
        totalDoctors: statsData.totalDoctors || 0,
        totalBeds: statsData.bedStats?.total || 0,
        todayRevenue: statsData.todayRevenue || 0,
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
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
              Admin Dashboard
            </h1>
            {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Patients" value={stats.totalPatients || 0} icon={FiUsers} color="blue" />
              <StatCard title="Total Doctors" value={stats.totalDoctors || 0} icon={FiActivity} color="green" />
              <StatCard title="Total Beds" value={stats.totalBeds || 0} icon={FiHome} color="purple" />
              <StatCard title="Today Revenue" value={`₹${stats.todayRevenue || 0}`} icon={FiDollarSign} color="orange" />
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default AdminDashboard;
