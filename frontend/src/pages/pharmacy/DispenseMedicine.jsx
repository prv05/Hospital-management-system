import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FiPackage, FiUser, FiCalendar, FiFileText, FiCheckCircle, FiClock, FiSearch, FiX } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const DispenseMedicine = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDispenseModal, setShowDispenseModal] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await api.get('/pharmacy/prescriptions');
      setPrescriptions(data.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (prescriptionId) => {
    try {
      const response = await api.post('/pharmacy/dispense', {
        prescriptionId,
        medicines: selectedPrescription.medicines
      });
      
      const { billing } = response.data.data;
      
      toast.success(
        `Medicines dispensed successfully!\nBill Generated: ${billing.billId}\nTotal Amount: ₹${billing.totalAmount.toFixed(2)}`,
        { duration: 5000 }
      );
      
      setShowDispenseModal(false);
      setSelectedPrescription(null);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error dispensing medicines:', error);
      toast.error(error.response?.data?.message || 'Failed to dispense medicines');
    }
  };

  const openDispenseModal = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDispenseModal(true);
  };

  const filteredPrescriptions = prescriptions.filter(presc => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const patientName = presc.patient?.user?.fullName || 
                       `${presc.patient?.user?.firstName || ''} ${presc.patient?.user?.lastName || ''}`.trim();
    const doctorName = presc.doctor?.user?.fullName || 
                      `${presc.doctor?.user?.firstName || ''} ${presc.doctor?.user?.lastName || ''}`.trim();
    return (
      presc.prescriptionId?.toLowerCase().includes(query) ||
      patientName.toLowerCase().includes(query) ||
      doctorName.toLowerCase().includes(query) ||
      presc.diagnosis?.toLowerCase().includes(query)
    );
  });

  const pendingPrescriptions = filteredPrescriptions.filter(p => !p.isDispensed);
  const dispensedPrescriptions = filteredPrescriptions.filter(p => p.isDispensed);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar role="pharmacy" />
        <div className="flex-1 ml-64 mt-16 overflow-x-hidden">
          <div className="p-8 max-w-full">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Dispense Medicine
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and dispense prescriptions from doctors
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Prescriptions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {prescriptions.length}
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <FiFileText className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                      {pendingPrescriptions.length}
                    </p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                    <FiClock className="text-2xl text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dispensed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {dispensedPrescriptions.length}
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                    <FiCheckCircle className="text-2xl text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by prescription ID, patient name, doctor name, or diagnosis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* Results Count */}
            {searchQuery && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Found {filteredPrescriptions.length} result{filteredPrescriptions.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Loading prescriptions...</p>
              </div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <FiFileText className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No Results Found' : 'No Prescriptions Found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? `No prescriptions match "${searchQuery}"` : 'No prescriptions available'}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Prescription ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Diagnosis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Medicines
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPrescriptions.map((prescription) => (
                        <tr key={prescription._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-sky-100 dark:bg-sky-900 p-2 rounded-lg mr-3">
                                <FiFileText className="text-sky-600 dark:text-sky-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {prescription.prescriptionId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg mr-3">
                                <FiUser className="text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {prescription.patient?.user?.fullName || 
                                   `${prescription.patient?.user?.firstName || ''} ${prescription.patient?.user?.lastName || ''}`.trim() || 
                                   'N/A'}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {prescription.patient?.patientId || ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              Dr. {prescription.doctor?.user?.fullName || 
                                   `${prescription.doctor?.user?.firstName || ''} ${prescription.doctor?.user?.lastName || ''}`.trim() || 
                                   'N/A'}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {prescription.doctor?.specialization || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                              {prescription.diagnosis}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {prescription.medicines?.length || 0} medicines
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                              <FiCalendar className="mr-2 text-gray-400" />
                              {new Date(prescription.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {prescription.isDispensed ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <FiCheckCircle />
                                Dispensed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                <FiClock />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {!prescription.isDispensed && (
                              <button
                                onClick={() => openDispenseModal(prescription)}
                                className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors duration-200"
                              >
                                Dispense
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispense Modal */}
      {showDispenseModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full my-8">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-lg flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dispense Prescription
              </h2>
              <button
                onClick={() => {
                  setShowDispenseModal(false);
                  setSelectedPrescription(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="p-6">
              {/* Prescription Details */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Prescription ID</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedPrescription.prescriptionId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Patient</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedPrescription.patient?.user?.fullName || 
                       `${selectedPrescription.patient?.user?.firstName || ''} ${selectedPrescription.patient?.user?.lastName || ''}`.trim() || 
                       'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Doctor</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Dr. {selectedPrescription.doctor?.user?.fullName || 
                           `${selectedPrescription.doctor?.user?.firstName || ''} ${selectedPrescription.doctor?.user?.lastName || ''}`.trim() || 
                           'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Diagnosis</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedPrescription.diagnosis}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medicines List */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Medicines to Dispense
              </h3>
              <div className="space-y-3 mb-6">
                {selectedPrescription.medicines?.map((med, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FiPackage className="text-sky-600 dark:text-sky-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {med.medicineName}
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <p><span className="font-medium">Dosage:</span> {med.dosage}</p>
                          <p><span className="font-medium">Frequency:</span> {med.frequency}</p>
                          <p><span className="font-medium">Duration:</span> {med.duration}</p>
                          <p><span className="font-medium">Timing:</span> {med.timing?.replace('-', ' ')}</p>
                          {med.quantity && (
                            <p><span className="font-medium">Quantity:</span> {med.quantity}</p>
                          )}
                        </div>
                        {med.instructions && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <span className="font-medium">Instructions:</span> {med.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Information */}
              {selectedPrescription.advice && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Doctor's Advice
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedPrescription.advice}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowDispenseModal(false);
                    setSelectedPrescription(null);
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDispense(selectedPrescription._id)}
                  className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors duration-200 font-medium"
                >
                  Confirm Dispense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DispenseMedicine;
