import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { patientAPI } from '../../api/services';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiUser, FiMapPin } from 'react-icons/fi';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await patientAPI.getAppointments();
      console.log('Appointments response:', response);
      setAppointments(response.data.data || response.data || []);
    } catch (error) {
      console.error('Appointments fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await patientAPI.cancelAppointment(id);
        toast.success('Appointment cancelled');
        fetchAppointments();
      } catch (error) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Sidebar role="patient" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-blue-900 dark:text-white mb-2">
                My Appointments
              </h1>
              <p className="text-blue-600 dark:text-blue-400">
                View and manage your scheduled appointments
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 p-12 text-center">
                <FiCalendar className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No appointments yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Book your first appointment to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {appointments.map((apt) => (
                  <div 
                    key={apt._id} 
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <FiUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Dr. {apt.doctor?.user?.firstName || 'N/A'} {apt.doctor?.user?.lastName || ''}
                            </h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <FiMapPin className="w-3 h-3" />
                              {apt.department?.name || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <FiCalendar className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">
                            {apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'Date not set'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <FiClock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{apt.appointmentTime || 'Time not set'}</span>
                        </div>
                      </div>

                      <div className="mb-4 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {apt.type || 'Consultation'}
                        </p>
                      </div>

                      {apt.symptoms && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Symptoms</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{apt.symptoms}</p>
                        </div>
                      )}

                      {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                        <button
                          onClick={() => handleCancel(apt._id)}
                          className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-semibold transition-colors duration-200 border border-red-200"
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyAppointments;
