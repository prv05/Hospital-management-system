import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
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
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  ℹ These are admitted patients. Outpatients (consultation only) do not appear here.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((assignment) => {
                  const patient = assignment.patient;
                  const patientUser = patient?.user;
                  
                  return (
                    <div key={assignment._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {patientUser?.firstName} {patientUser?.lastName}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>🛏️ Bed: {assignment.bedNumber}</p>
                        <p>💉 Blood: {patient?.bloodGroup}</p>
                        <p>📅 {new Date(assignment.assignedDate).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={() => handleRecordVitals(assignment)}
                        className="mt-4 w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition"
                      >
                        📊 Record Vitals
                      </button>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Record Vitals - {selectedPatient?.patient?.user?.firstName} {selectedPatient?.patient?.user?.lastName}
                </h2>
                <button
                  onClick={() => setShowVitalsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleVitalsSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Blood Pressure (e.g., 120/80)
                    </label>
                    <input
                      type="text"
                      value={vitalsData.bloodPressure}
                      onChange={(e) => setVitalsData({...vitalsData, bloodPressure: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="120/80"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Temperature (°F)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitalsData.temperature}
                      onChange={(e) => setVitalsData({...vitalsData, temperature: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="98.6"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pulse (bpm)
                    </label>
                    <input
                      type="number"
                      value={vitalsData.pulse}
                      onChange={(e) => setVitalsData({...vitalsData, pulse: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="72"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Respiratory Rate
                    </label>
                    <input
                      type="number"
                      value={vitalsData.respiratoryRate}
                      onChange={(e) => setVitalsData({...vitalsData, respiratoryRate: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="16"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Oxygen Saturation (%)
                    </label>
                    <input
                      type="number"
                      value={vitalsData.oxygenSaturation}
                      onChange={(e) => setVitalsData({...vitalsData, oxygenSaturation: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="98"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitalsData.weight}
                      onChange={(e) => setVitalsData({...vitalsData, weight: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="70"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes / Observations
                  </label>
                  <textarea
                    value={vitalsData.notes}
                    onChange={(e) => setVitalsData({...vitalsData, notes: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    rows="3"
                    placeholder="Any observations or notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
                  >
                    Save Vitals
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVitalsModal(false)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedPatients;
