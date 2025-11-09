import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { FiUsers, FiActivity, FiFileText, FiTrendingUp } from 'react-icons/fi';
import { doctorAPI } from '../../api/services';
import toast from 'react-hot-toast';

const DoctorAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    successRate: 0,
    statusBreakdown: [],
    typeBreakdown: [],
    monthlyPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const response = await doctorAPI.getAnalytics(period);
      const data = response.data.data;
      
      // Calculate stats
      const totalStats = data.totalStats?.[0] || {};
      const totalAppointments = totalStats.totalAppointments || 0;
      const completedAppointments = totalStats.completedAppointments || 0;
      const successRate = totalAppointments > 0 
        ? Math.round((completedAppointments / totalAppointments) * 100) 
        : 0;

      // Get unique patients count
      const patientsResponse = await doctorAPI.getPatients();
      const totalPatients = patientsResponse.data.count || 0;

      // Get monthly performance (last 3 months)
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
      const currentMonth = new Date().getMonth();
      const monthlyPerformance = [];
      
      for (let i = 2; i >= 0; i--) {
        const monthIdx = (currentMonth - i + 12) % 12;
        const monthData = data.dailyCount?.filter(d => {
          const date = new Date(d._id);
          return date.getMonth() === monthIdx;
        }) || [];
        
        const count = monthData.reduce((sum, d) => sum + d.count, 0);
        monthlyPerformance.push({
          month: months[monthIdx],
          patients: count
        });
      }

      // Get top diagnoses from type breakdown
      const diagnoses = data.typeBreakdown?.map(t => ({
        diagnosis: t._id === 'consultation' ? 'General Consultation' :
                   t._id === 'follow-up' ? 'Follow-up Visit' :
                   t._id === 'emergency' ? 'Emergency' :
                   t._id === 'checkup' ? 'Routine Checkup' : t._id,
        count: t.count
      })) || [];

      setAnalytics({
        totalPatients,
        totalAppointments,
        completedAppointments,
        successRate,
        statusBreakdown: data.statusBreakdown || [],
        typeBreakdown: diagnoses,
        monthlyPerformance
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          <Sidebar role="doctor" />
          <div className="flex-1 ml-64 mt-16">
            <div className="p-8">
              <p className="text-gray-500">Loading analytics...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="doctor" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics & Reports
              </h1>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Patients" value={analytics.totalPatients} icon={FiUsers} color="blue" />
            <StatCard title="Appointments" value={analytics.totalAppointments} icon={FiActivity} color="green" />
            <StatCard title="Consultations" value={analytics.completedAppointments} icon={FiFileText} color="purple" />
            <StatCard title="Success Rate" value={`${analytics.successRate}%`} icon={FiTrendingUp} color="orange" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Appointment Types</h2>
              <div className="space-y-3">
                {analytics.typeBreakdown.length > 0 ? (
                  analytics.typeBreakdown.map((item) => (
                    <div key={item.diagnosis} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{item.diagnosis}</span>
                      <span className="text-primary-600 font-semibold">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No data available</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Monthly Performance</h2>
              <div className="space-y-3">
                {analytics.monthlyPerformance.length > 0 ? (
                  analytics.monthlyPerformance.map((item) => (
                    <div key={item.month} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="font-medium text-gray-900 dark:text-white">{item.month}</span>
                      <span className="text-green-600 font-semibold">{item.patients} patients</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default DoctorAnalytics;
