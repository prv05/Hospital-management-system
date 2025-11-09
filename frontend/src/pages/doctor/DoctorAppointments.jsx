import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import { doctorAPI } from '../../api/services';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await doctorAPI.getAppointments();
      setAppointments(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'patient', label: 'Patient Name', render: (row) => row.patient?.user?.name || 'Unknown' },
    { key: 'appointmentDate', label: 'Date', render: (row) => new Date(row.appointmentDate).toLocaleDateString() },
    { key: 'appointmentTime', label: 'Time' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="doctor" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            All Appointments
          </h1>
          <Table columns={columns} data={appointments} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
