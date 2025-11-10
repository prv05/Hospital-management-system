import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { FiUsers, FiHome, FiActivity, FiClock } from 'react-icons/fi';
import { nurseAPI } from '../../api/services';
import toast from 'react-hot-toast';

const NurseDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    activePatients: 0,
    totalAssigned: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await nurseAPI.getDashboard();
      console.log('Dashboard data:', response.data);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="nurse" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Nurse Dashboard
          </h1>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Assigned Patients" value={dashboardData.totalAssigned || 0} icon={FiUsers} color="blue" />
              <StatCard title="Available Beds" value={0} icon={FiHome} color="green" />
              <StatCard title="Vitals Recorded" value={0} icon={FiActivity} color="purple" />
              <StatCard title="On Duty Time" value="8h" icon={FiClock} color="orange" />
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default NurseDashboard;
