import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { nurseAPI } from '../../api/services';
import toast from 'react-hot-toast';

const AssignedPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await nurseAPI.getAssignedPatients();
      setPatients(response.data.data || response.data);
    } catch (error) {
      toast.error('Failed to fetch assigned patients');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="nurse" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Assigned Patients
          </h1>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : patients.length === 0 ? (
            <p className="text-gray-500">No patients assigned</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map((patient) => (
                <div key={patient._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>🛏️ Bed: {patient.bed?.bedNumber || 'N/A'}</p>
                    <p>🏥 Ward: {patient.bed?.ward || 'N/A'}</p>
                    <p>🩺 Condition: {patient.condition || 'Stable'}</p>
                    <p>💉 Blood Group: {patient.bloodGroup}</p>
                  </div>
                  <button className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">
                    Record Vitals
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignedPatients;
