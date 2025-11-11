import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { nurseAPI } from '../../api/services';
import toast from 'react-hot-toast';

const AssignedPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitalsData, setVitalsData] = useState({
    bloodPressure: '',
    temperature: '',
    pulse: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    notes: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      console.log('Fetching assigned patients...');
      const response = await nurseAPI.getAssignedPatients();
      console.log('API Response:', response.data);
      const patientData = response.data.data || response.data;
      console.log('Patient data:', patientData);
      console.log('Number of patients:', patientData.length);
      setPatients(patientData);
    } catch (error) {
      console.error('Error fetching patients:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to fetch assigned patients');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordVitals = (patient) => {
    setSelectedPatient(patient);
    setShowVitalsModal(true);
  };

  const handleVitalsSubmit = async (e) => {
    e.preventDefault();
    try {
      await nurseAPI.recordVitals(selectedPatient.patient._id, vitalsData);
      toast.success('Vitals recorded successfully!');
      setShowVitalsModal(false);
      setVitalsData({
        bloodPressure: '',
        temperature: '',
        pulse: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        notes: ''
      });
      fetchPatients();
    } catch (error) {
      toast.error('Failed to record vitals');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Sidebar role="nurse" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Assigned Patients (Admitted Only)
          </h1>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : patients.length === 0 ? (
            <p className="text-gray-500">No patients assigned</p>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 mb-6">
                <p className="text-primary-700 dark:text-primary-300 text-sm">
                  ℹ These are admitted patients. Outpatients (consultation only) do not appear here.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((assignment) => {
                  const patient = assignment.patient;
                  const patientUser = patient?.user;
                  
                  return (
                    <div key={assignment._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-primary-100 dark:border-primary-900 overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all">
                      {/* Cyan blue accent bar */}
                      <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>
                      
                      <div className="p-6">
                        {/* Patient Name */}
                        <div className="mb-5">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {patientUser?.firstName} {patientUser?.lastName}
                          </h3>
                          <div className="h-0.5 w-12 bg-primary-500 rounded"></div>
                        </div>
                        
                        {/* Patient Info */}
                        <div className="space-y-3 mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
                          <div className="flex items-center text-sm">
                            <span className="w-24 text-gray-600 dark:text-gray-400 font-medium">🛏️ Bed:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{assignment.bedNumber}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="w-24 text-gray-600 dark:text-gray-400 font-medium">💉 Blood:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{patient?.bloodGroup}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="w-24 text-gray-600 dark:text-gray-400 font-medium">📅 Admitted:</span>
                            <span className="text-gray-900 dark:text-white">{new Date(assignment.assignedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleRecordVitals(assignment)}
                          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 font-medium transition-all shadow-sm hover:shadow-md"
                        >
                          📊 Record Vitals
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vitals Recording Modal */}
      {showVitalsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    📊 Record Vitals
                  </h2>
                  <p className="text-blue-100 mt-1 text-sm">
                    {selectedPatient?.patient?.user?.firstName} {selectedPatient?.patient?.user?.lastName}
                  </p>
                </div>
                <button
                  onClick={() => setShowVitalsModal(false)}
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleVitalsSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      value={vitalsData.bloodPressure}
                      onChange={(e) => setVitalsData({...vitalsData, bloodPressure: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="120/80"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Temperature (°F)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitalsData.temperature}
                      onChange={(e) => setVitalsData({...vitalsData, temperature: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="98.6"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Pulse (bpm)
                    </label>
                    <input
                      type="number"
                      value={vitalsData.pulse}
                      onChange={(e) => setVitalsData({...vitalsData, pulse: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="72"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Respiratory Rate
                    </label>
                    <input
                      type="number"
                      value={vitalsData.respiratoryRate}
                      onChange={(e) => setVitalsData({...vitalsData, respiratoryRate: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="16"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Oxygen Saturation (%)
                    </label>
                    <input
                      type="number"
                      value={vitalsData.oxygenSaturation}
                      onChange={(e) => setVitalsData({...vitalsData, oxygenSaturation: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="98"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitalsData.weight}
                      onChange={(e) => setVitalsData({...vitalsData, weight: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="70"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Notes / Observations
                  </label>
                  <textarea
                    value={vitalsData.notes}
                    onChange={(e) => setVitalsData({...vitalsData, notes: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                    rows="3"
                    placeholder="Any observations or notes..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    💾 Save Vitals
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVitalsModal(false)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedPatients;
