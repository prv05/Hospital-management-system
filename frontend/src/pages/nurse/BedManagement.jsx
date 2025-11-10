import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { nurseAPI } from '../../api/services';
import toast from 'react-hot-toast';

const BedManagement = () => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [dischargeNotes, setDischargeNotes] = useState('');

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      const response = await nurseAPI.getBedOccupancy();
      console.log('Beds data:', response.data);
      setBeds(response.data.data);
    } catch (error) {
      console.error('Fetch beds error:', error);
      toast.error('Failed to fetch beds');
    } finally {
      setLoading(false);
    }
  };

  const handleDischargeClick = (bed) => {
    setSelectedBed(bed);
    setShowDischargeModal(true);
  };

  const handleDischarge = async () => {
    try {
      await nurseAPI.dischargeBed(selectedBed._id);
      toast.success('Patient discharged and bed marked as vacant');
      setShowDischargeModal(false);
      setDischargeNotes('');
      setSelectedBed(null);
      fetchBeds();
    } catch (error) {
      console.error('Discharge error:', error);
      toast.error(error.response?.data?.message || 'Failed to discharge patient');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      vacant: 'bg-emerald-500',
      available: 'bg-emerald-500',
      occupied: 'bg-blue-500',
      maintenance: 'bg-amber-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Sidebar role="nurse" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bed Management
            </h1>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Vacant</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : beds.length === 0 ? (
              <p className="text-gray-500">No beds found</p>
            ) : (
              beds.map((bed) => {
                const patient = bed.currentPatient;
                const patientUser = patient?.user;
                
                return (
                <div 
                  key={bed._id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Status Bar */}
                  <div className={`h-1 ${getStatusColor(bed.status)}`}></div>
                  
                  <div className="p-5">
                    {/* Bed Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {bed.bedNumber}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {bed.wardNumber} • {bed.wardType} • Floor {bed.floor}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(bed.status)}`}>
                        {bed.status}
                      </span>
                    </div>
                  
                  {patient ? (
                    <>
                      {/* Patient Info */}
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <p className="font-semibold text-gray-900 dark:text-white text-base mb-3">
                          {patientUser?.firstName || 'Unknown'} {patientUser?.lastName || ''}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <span className="w-20 font-medium">ID:</span>
                            <span className="text-gray-900 dark:text-white">{patient.patientId || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <span className="w-20 font-medium">Blood:</span>
                            <span className="text-gray-900 dark:text-white">{patient.bloodGroup || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <span className="w-20 font-medium">Phone:</span>
                            <span className="text-gray-900 dark:text-white">{patientUser?.phone || 'N/A'}</span>
                          </div>
                          {patient.allergies && patient.allergies.length > 0 && (
                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                              <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                                ⚠️ Allergies: {patient.allergies.map(a => a.allergen).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Discharge Button */}
                      <button
                        onClick={() => handleDischargeClick(bed)}
                        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                      >
                        Discharge Patient
                      </button>
                    </>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                        Available
                      </p>
                    </div>
                  )}
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Discharge Modal */}
      {showDischargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Discharge Patient
            </h2>
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Bed:</strong> {selectedBed?.bedNumber}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Patient:</strong> {selectedBed?.currentPatient?.firstName} {selectedBed?.currentPatient?.lastName}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discharge Notes
              </label>
              <textarea
                value={dischargeNotes}
                onChange={(e) => setDischargeNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                rows="3"
                placeholder="Enter discharge notes and instructions..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDischarge}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Confirm Discharge
              </button>
              <button
                onClick={() => {
                  setShowDischargeModal(false);
                  setDischargeNotes('');
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedManagement;
