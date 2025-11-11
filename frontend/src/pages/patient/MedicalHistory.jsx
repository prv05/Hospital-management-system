import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
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
      console.log('Medical history response:', response);
      setHistory(response.data.data);
    } catch (error) {
      console.error('Medical history fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch medical history');
    } finally {
      setLoading(false);
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
                Medical History
              </h1>
              <p className="text-blue-600 dark:text-blue-400">
                Your complete medical records and health information
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 p-6 mb-6">
                <h2 className="text-2xl font-bold text-blue-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {history?.personalInfo?.firstName} {history?.personalInfo?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {history?.personalInfo?.patientId || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {history?.personalInfo?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {history?.personalInfo?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {history?.personalInfo?.dateOfBirth 
                        ? new Date(history.personalInfo.dateOfBirth).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {history?.personalInfo?.age ? `${history.personalInfo.age} years` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {history?.personalInfo?.gender 
                        ? history.personalInfo.gender.charAt(0).toUpperCase() + history.personalInfo.gender.slice(1)
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Blood Group</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {history?.personalInfo?.bloodGroup || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Registration Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {history?.personalInfo?.registrationDate 
                        ? new Date(history.personalInfo.registrationDate).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                {history?.personalInfo?.address && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {typeof history.personalInfo.address === 'string' 
                        ? history.personalInfo.address
                        : `${history.personalInfo.address.street || ''}, ${history.personalInfo.address.city || ''}, ${history.personalInfo.address.state || ''} ${history.personalInfo.address.pincode || ''}, ${history.personalInfo.address.country || ''}`.replace(/,\s*,/g, ',').trim()}
                    </p>
                  </div>
                )}
              </div>

              {/* Physical Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Physical Information</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Height</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {history?.physicalInfo?.height ? `${history.physicalInfo.height} cm` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {history?.physicalInfo?.weight ? `${history.physicalInfo.weight} kg` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">BMI</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {history?.physicalInfo?.bmi || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {history?.emergencyContact && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Emergency Contact</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {history.emergencyContact.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Relation</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {history.emergencyContact.relation || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {history.emergencyContact.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Allergies */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Allergies</h2>
                {history?.allergies?.length > 0 ? (
                  <div className="space-y-3">
                    {history.allergies.map((allergy, index) => (
                      <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-red-800 dark:text-red-300">
                            {allergy.allergen || allergy}
                          </span>
                          {allergy.severity && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              allergy.severity === 'severe' 
                                ? 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100'
                                : allergy.severity === 'moderate'
                                ? 'bg-orange-200 text-orange-900 dark:bg-orange-800 dark:text-orange-100'
                                : 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100'
                            }`}>
                              {allergy.severity.toUpperCase()}
                            </span>
                          )}
                        </div>
                        {allergy.reaction && (
                          <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                            Reaction: {allergy.reaction}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No known allergies</p>
                )}
              </div>

              {/* Chronic Conditions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Chronic Conditions</h2>
                {history?.chronicDiseases?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2">
                    {history.chronicDiseases.map((condition, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">{condition}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No chronic conditions</p>
                )}
              </div>

              {/* Medical History */}
              {history?.medicalHistory?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Medical History</h2>
                  <div className="space-y-3">
                    {history.medicalHistory.map((record, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {record.condition}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            record.status === 'resolved' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : record.status === 'chronic'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                          }`}>
                            {record.status?.toUpperCase() || 'ACTIVE'}
                          </span>
                        </div>
                        {record.diagnosedDate && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Diagnosed: {new Date(record.diagnosedDate).toLocaleDateString()}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Surgeries */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Past Surgeries</h2>
                {history?.surgeries?.length > 0 ? (
                  <div className="space-y-3">
                    {history.surgeries.map((surgery, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {surgery.surgeryName || surgery.surgery}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Date: {new Date(surgery.date).toLocaleDateString()}
                        </p>
                        {surgery.hospital && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Hospital: {surgery.hospital}
                          </p>
                        )}
                        {surgery.surgeon && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Surgeon: {surgery.surgeon}
                          </p>
                        )}
                        {surgery.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {surgery.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No past surgeries</p>
                )}
              </div>

              {/* Vaccinations */}
              {history?.vaccinations?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Vaccinations</h2>
                  <div className="space-y-3">
                    {history.vaccinations.map((vaccination, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {vaccination.vaccineName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Date: {new Date(vaccination.date).toLocaleDateString()}
                        </p>
                        {vaccination.nextDueDate && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Next Due: {new Date(vaccination.nextDueDate).toLocaleDateString()}
                          </p>
                        )}
                        {vaccination.administeredBy && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Administered by: {vaccination.administeredBy}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default MedicalHistory;
