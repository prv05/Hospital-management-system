import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { patientAPI } from '../../api/services';
import toast from 'react-hot-toast';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await patientAPI.getAppointments();
      setAppointments(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to fetch appointments');
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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="patient" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            My Appointments
          </h1>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-500">No appointments found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appointments.map((apt) => (
                <div key={apt._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Dr. {apt.doctorId?.firstName} {apt.doctorId?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{apt.departmentId?.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>📅 {new Date(apt.appointmentDate).toLocaleDateString()}</p>
                    <p>🕐 {apt.timeSlot}</p>
                    <p>📋 Type: {apt.appointmentType}</p>
                  </div>
                  {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                    <button
                      onClick={() => handleCancel(apt._id)}
                      className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
