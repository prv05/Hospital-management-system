import { useEffect, useState } from 'react';
import { FiCalendar, FiFileText, FiDollarSign, FiActivity } from 'react-icons/fi';
import { patientAPI } from '../../api/services';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';

const PatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await patientAPI.getDashboard();
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

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="patient" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Patient Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Upcoming Appointments"
                value={dashboardData?.upcomingAppointments?.length || 0}
                icon={FiCalendar}
              color="blue"
            />
            <StatCard
              title="Prescriptions"
              value={dashboardData?.recentPrescriptions?.length || 0}
              icon={FiFileText}
              color="green"
            />
            <StatCard
              title="Pending Bills"
              value={dashboardData?.pendingBills?.length || 0}
              icon={FiDollarSign}
              color="red"
            />
            <StatCard
              title="Total Visits"
              value={dashboardData?.patient?.totalVisits || 0}
              icon={FiActivity}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Upcoming Appointments">
              {dashboardData?.upcomingAppointments?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.upcomingAppointments.map((apt) => (
                    <div key={apt._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="font-semibold">Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No upcoming appointments</p>
              )}
            </Card>

            <Card title="Recent Prescriptions">
              {dashboardData?.recentPrescriptions?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentPrescriptions.map((prescription) => (
                    <div key={prescription._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="font-semibold">{prescription.diagnosis}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {prescription.medicines?.length || 0} medicines
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent prescriptions</p>
              )}
            </Card>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default PatientDashboard;
