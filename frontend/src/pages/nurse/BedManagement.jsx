import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { nurseAPI } from '../../api/services';
import toast from 'react-hot-toast';

const BedManagement = () => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      const response = await nurseAPI.getBedOccupancy();
      setBeds(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch beds');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      vacant: 'bg-green-100 text-green-800',
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="nurse" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Bed Management
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : beds.length === 0 ? (
              <p className="text-gray-500">No beds found</p>
            ) : (
              beds.map((bed) => (
                <div key={bed._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-primary-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{bed.bedNumber}</p>
                      <p className="text-xs text-gray-500">{bed.ward} - {bed.room}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(bed.status)}`}>
                      {bed.status}
                    </span>
                  </div>
                  {bed.currentPatient && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium">{bed.currentPatient.firstName} {bed.currentPatient.lastName}</p>
                      <p className="text-xs">ID: {bed.currentPatient.patientId}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2 capitalize">{bed.bedType} Ward</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BedManagement;
