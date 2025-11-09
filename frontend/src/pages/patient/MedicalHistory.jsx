import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { patientAPI } from '../../api/services';
import toast from 'react-hot-toast';

const MedicalHistory = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await patientAPI.getMedicalHistory();
      setHistory(response.data);
    } catch (error) {
      toast.error('Failed to fetch medical history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="patient" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Medical History
          </h1>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Blood Group</p>
                    <p className="font-semibold">{history?.bloodGroup || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Height</p>
                    <p className="font-semibold">{history?.height || 'N/A'} cm</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-semibold">{history?.weight || 'N/A'} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">BMI</p>
                    <p className="font-semibold">{history?.bmi || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Allergies */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Allergies</h2>
                {history?.allergies?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {history.allergies.map((allergy, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No known allergies</p>
                )}
              </div>

              {/* Chronic Conditions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Chronic Conditions</h2>
                {history?.chronicConditions?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2">
                    {history.chronicConditions.map((condition, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">{condition}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No chronic conditions</p>
                )}
              </div>

              {/* Past Surgeries */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Past Surgeries</h2>
                {history?.pastSurgeries?.length > 0 ? (
                  <ul className="space-y-2">
                    {history.pastSurgeries.map((surgery, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        {surgery.surgery} - {new Date(surgery.date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No past surgeries</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;
