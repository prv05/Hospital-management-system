import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { doctorAPI } from '../../api/services';
import toast from 'react-hot-toast';

const PatientQueue = () => {
  const [queue, setQueue] = useState({ waiting: [], inConsultation: [], completed: [] });
  const [loading, setLoading] = useState(true);

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

  const QueueSection = ({ title, patients, status }) => (
    <Card>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {patients.length === 0 ? (
          <p className="text-gray-500">No patients in {status}</p>
        ) : (
          patients.map((appointment) => (
            <div key={appointment._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {appointment.patient?.user?.name || 'Unknown Patient'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {appointment.appointmentTime} - {appointment.type}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                  status === 'in-consultation' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="doctor" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Patient Queue
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QueueSection title="Waiting" patients={queue.waiting} status="waiting" />
            <QueueSection title="In Consultation" patients={queue.inConsultation} status="in-consultation" />
            <QueueSection title="Completed" patients={queue.completed} status="completed" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientQueue;
