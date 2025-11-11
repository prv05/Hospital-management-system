import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { FiUsers, FiHome, FiActivity, FiClock, FiSun, FiMoon, FiSunrise } from 'react-icons/fi';
import { nurseAPI } from '../../api/services';
import toast from 'react-hot-toast';

const NurseDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    activePatients: 0,
    totalAssigned: 0,
    nurse: null
  });
  const [bedStats, setBedStats] = useState({
    vacant: 0,
    occupied: 0,
    total: 0
  });
  const [vitalsCount, setVitalsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Refresh dashboard every 30 seconds to get updated shift info
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await nurseAPI.getDashboard();
      console.log('Dashboard data:', response.data);
      const data = response.data.data;
      
      setDashboardData(data);
      
      // Set bed stats from dashboard API
      if (data.bedStats) {
        setBedStats(data.bedStats);
      }
      
      // Set vitals count from dashboard API
      if (data.vitalsRecorded !== undefined) {
        setVitalsCount(data.vitalsRecorded);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getShiftIcon = (shift) => {
    switch(shift) {
      case 'morning': return FiSunrise;
      case 'evening': return FiSun;
      case 'night': return FiMoon;
      default: return FiClock;
    }
  };

  const getShiftColor = (shift) => {
    switch(shift) {
      case 'morning': return 'orange';
      case 'evening': return 'yellow';
      case 'night': return 'indigo';
      default: return 'gray';
    }
  };

  const getShiftLabel = (shift) => {
    switch(shift) {
      case 'morning': return 'Morning Shift';
      case 'evening': return 'Evening Shift';
      case 'night': return 'Night Shift';
      case 'rotating': return 'Rotating Shift';
      default: return 'Not Assigned';
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="nurse" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Nurse Dashboard
            </h1>
            {dashboardData.nurse && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Employee ID: <span className="font-semibold text-gray-900 dark:text-white">{dashboardData.nurse.employeeId}</span>
              </div>
            )}
          </div>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Assigned Patients" 
                value={dashboardData.totalAssigned || 0} 
                icon={FiUsers} 
                color="blue" 
              />
              <StatCard 
                title="Available Beds" 
                value={bedStats.vacant || 0} 
                icon={FiHome} 
                color="green" 
              />
              <StatCard 
                title="Vitals Recorded" 
                value={vitalsCount} 
                icon={FiActivity} 
                color="purple" 
              />
              <StatCard 
                title={getShiftLabel(dashboardData.nurse?.shiftTiming)} 
                value={dashboardData.nurse?.currentShift?.start && dashboardData.nurse?.currentShift?.end 
                  ? `${dashboardData.nurse.currentShift.start} - ${dashboardData.nurse.currentShift.end}` 
                  : 'Not Set'} 
                icon={getShiftIcon(dashboardData.nurse?.shiftTiming)} 
                color={getShiftColor(dashboardData.nurse?.shiftTiming)} 
              />
            </div>

            {/* Shift Information Card */}
            {dashboardData.nurse && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Current Shift Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shift Type</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {dashboardData.nurse.shiftTiming || 'Not Assigned'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shift Time</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {dashboardData.nurse.currentShift?.start && dashboardData.nurse.currentShift?.end
                        ? `${dashboardData.nurse.currentShift.start} - ${dashboardData.nurse.currentShift.end}`
                        : 'Not Set'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assigned Ward</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {dashboardData.nurse.assignedWard || 'Not Assigned'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default NurseDashboard;
