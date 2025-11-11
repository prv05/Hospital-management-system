import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FiCalendar, FiUser, FiFileText, FiX } from 'react-icons/fi';
import { FaPills, FaCheckCircle, FaClock } from 'react-icons/fa';

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await api.get('/patients/prescriptions');
      setPrescriptions(data.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (filter === 'all') return true;
    if (filter === 'active') return !prescription.isDispensed;
    if (filter === 'completed') return prescription.isDispensed;
    return true;
  });

  const activePrescriptions = prescriptions.filter(p => !p.isDispensed).length;
  const completedPrescriptions = prescriptions.filter(p => p.isDispensed).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Sidebar role="patient" />
      <div className="ml-64 mt-16 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Prescriptions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">View and track all your prescriptions</p>
          </div>

          {/* Filter Buttons */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'completed'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-primary-100 dark:border-gray-700 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <FiFileText className="text-2xl text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Prescriptions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{prescriptions.length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-emerald-100 dark:border-gray-700 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <FaPills className="text-2xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Active</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{activePrescriptions}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-primary-100 dark:border-gray-700 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <FiFileText className="text-2xl text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{completedPrescriptions}</p>
              </div>
            </div>
          </div>

          {/* Prescription History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-primary-100 dark:border-gray-700 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Prescription History</h2>
              
              {loading ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading prescriptions...</div>
              ) : filteredPrescriptions.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredPrescriptions.map((prescription) => (
                    <div 
                      key={prescription._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer bg-white dark:bg-gray-800"
                      onClick={() => {
                        setSelectedPrescription(prescription);
                        setShowDetails(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-primary-600 dark:text-primary-400 font-semibold">
                              {prescription.prescriptionId}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              prescription.isDispensed 
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}>
                              {prescription.isDispensed ? 'Dispensed' : 'Active'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <FiUser className="text-primary-600 dark:text-primary-400" />
                              <span>
                                Dr. {prescription.doctor?.user?.firstName} {prescription.doctor?.user?.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <FiCalendar className="text-primary-600 dark:text-primary-400" />
                              <span>{new Date(prescription.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <FaPills className="text-primary-600 dark:text-primary-400" />
                              <span>{prescription.medicines?.length || 0} Medicines</span>
                            </div>
                          </div>

                          {prescription.diagnosis && (
                            <div className="mt-3 text-sm">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Diagnosis: </span>
                              <span className="text-gray-600 dark:text-gray-400">{prescription.diagnosis}</span>
                            </div>
                          )}
                        </div>

                        <button className="ml-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg transition-colors text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No prescriptions found for the selected filter
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Prescription Details Modal */}
      {showDetails && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Prescription Details</h2>
                  <p className="text-primary-100 text-sm mt-1">{selectedPrescription.prescriptionId}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Prescription Info */}
              <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-primary-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Doctor</p>
                  <p className="font-semibold text-gray-900">
                    Dr. {selectedPrescription.doctor?.user?.firstName} {selectedPrescription.doctor?.user?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedPrescription.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Diagnosis</p>
                  <p className="font-semibold text-gray-900">{selectedPrescription.diagnosis}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedPrescription.isDispensed 
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {selectedPrescription.isDispensed ? 'Dispensed' : 'Active'}
                  </span>
                </div>
              </div>

              {/* Medicines */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prescribed Medicines</h3>
                <div className="space-y-3">
                  {selectedPrescription.medicines?.map((medicine, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-lg">{medicine.medicineName}</h4>
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          {medicine.dosage}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Frequency:</span> {medicine.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {medicine.duration}
                        </div>
                        {medicine.timing && (
                          <div className="col-span-2">
                            <span className="font-medium">Timing:</span> {medicine.timing.replace('-', ' ')}
                          </div>
                        )}
                        {medicine.instructions && (
                          <div className="col-span-2">
                            <span className="font-medium">Instructions:</span> {medicine.instructions}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedPrescription.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Doctor's Notes</h3>
                  <p className="text-gray-600 text-sm">{selectedPrescription.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPrescriptions;

