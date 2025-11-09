import { useEffect, useState } from 'react';
import { FiCalendar, FiUsers, FiCheckCircle, FiClock } from 'react-icons/fi';
import { doctorAPI } from '../../api/services';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Table from '../../components/Table';

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await doctorAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const columns = [
    { header: 'Patient', accessor: 'patient', render: (row) => row.patient?.user?.firstName + ' ' + row.patient?.user?.lastName },
    { header: 'Time', accessor: 'appointmentTime' },
    { header: 'Type', accessor: 'type' },
    { header: 'Status', accessor: 'status' },
  ];

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="doctor" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Doctor Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
              title="Today's Appointments"
              value={dashboardData?.todaysAppointments?.length || 0}
              icon={FiCalendar}
              color="blue"
            />
            <StatCard
              title="Patients This Week"
              value={dashboardData?.stats?.weekly?.totalPatients || 0}
              icon={FiUsers}
              color="green"
            />
            <StatCard
              title="Completed Today"
              value={dashboardData?.stats?.today?.find(s => s._id === 'completed')?.count || 0}
              icon={FiCheckCircle}
              color="purple"
            />
            <StatCard
              title="Waiting"
              value={dashboardData?.stats?.today?.find(s => s._id === 'waiting')?.count || 0}
              icon={FiClock}
              color="orange"
            />
          </div>

          <Card title="Today's Appointments">
            <Table
              columns={columns}
              data={dashboardData?.todaysAppointments || []}
            />
          </Card>
        </div>
      </div>
      </div>
    </>
  );
};

export default DoctorDashboard;
