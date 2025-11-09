import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { doctorAPI } from '../../api/services';
import toast from 'react-hot-toast';
import { FiCheck, FiPlay } from 'react-icons/fi';

const PatientQueue = () => {
  const [queue, setQueue] = useState({ waiting: [], inConsultation: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await doctorAPI.getQueue();
      setQueue(response.data.data || response.data);
    } catch (error) {
      console.error('Queue fetch error:', error);
      toast.error('Failed to fetch patient queue');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    setUpdating(appointmentId);
    try {
      await doctorAPI.updateAppointmentStatus(appointmentId, newStatus);
      toast.success(`Appointment moved to ${newStatus === 'in-consultation' ? 'In Consultation' : 'Completed'}`);
      fetchQueue(); // Refresh the queue
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update appointment status');
    } finally {
      setUpdating(null);
    }
  };

  const QueueSection = ({ title, patients, status, showAction }) => (
    <Card>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="space-y-3">
        {patients.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No patients in {status}</p>
        ) : (
          patients.map((appointment) => (
            <div key={appointment._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {appointment.patient?.user?.firstName} {appointment.patient?.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {appointment.appointmentTime} - {appointment.type}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  status === 'waiting' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  status === 'in-consultation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {appointment.status}
                </span>
              </div>
              
              {showAction && (
                <button
                  onClick={() => handleStatusChange(
                    appointment._id, 
                    status === 'waiting' ? 'in-consultation' : 'completed'
                  )}
                  disabled={updating === appointment._id}
                  className={`w-full mt-2 px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
                    status === 'waiting' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                  {updating === appointment._id ? (
                    'Updating...'
                  ) : (
                    <>
                      {status === 'waiting' ? (
                        <>
                          <FiPlay className="w-4 h-4" />
                          Start Consultation
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-4 h-4" />
                          Mark as Completed
                        </>
                      )}
                    </>
                  )}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="doctor" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Patient Queue
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <QueueSection 
                title="Waiting" 
                patients={queue.waiting} 
                status="waiting"
                showAction={true}
              />
              <QueueSection 
                title="In Consultation" 
                patients={queue.inConsultation} 
                status="in-consultation"
                showAction={true}
              />
              <QueueSection 
                title="Completed" 
                patients={queue.completed} 
                status="completed"
                showAction={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientQueue;
