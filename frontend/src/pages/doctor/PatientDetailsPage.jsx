import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { doctorAPI } from '../../api/services';
import toast from 'react-hot-toast';
import { FiEdit, FiPlus, FiSave, FiX, FiClipboard } from 'react-icons/fi';

const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [medicalData, setMedicalData] = useState({
    bloodGroup: '',
    height: '',
    weight: '',
    allergies: [],
    chronicDiseases: [],
    currentMedications: []
  });

  const [newAllergy, setNewAllergy] = useState({ allergen: '', severity: '', reaction: '' });
  const [newDisease, setNewDisease] = useState('');
  const [newMedication, setNewMedication] = useState({ medicineName: '', dosage: '', frequency: '' });

  const [surgeryForm, setSurgeryForm] = useState({
    surgeryName: '',
    date: '',
    surgeon: '',
    hospital: '',
    notes: ''
  });

  const [vaccinationForm, setVaccinationForm] = useState({
    vaccineName: '',
    date: '',
    dose: '',
    administeredBy: '',
    nextDueDate: ''
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: '',
    followUpDate: ''
  });

  const [labTestForm, setLabTestForm] = useState({
    testName: '',
    testCategory: '',
    urgency: 'routine',
    notes: '',
    cost: ''
  });

  const [patientLabTests, setPatientLabTests] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);

  useEffect(() => {
    fetchPatientDetails();
    fetchPatientLabTests();
    fetchPatientPrescriptions();
  }, [id]);

  const fetchPatientLabTests = async () => {
    try {
      const response = await doctorAPI.getPatientLabTests(id);
      setPatientLabTests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    }
  };

  const fetchPatientPrescriptions = async () => {
    try {
      const response = await doctorAPI.getPatientPrescriptions(id);
      setPatientPrescriptions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getPatientDetails(id);
      const patientData = response.data.data || response.data;
      setPatient(patientData);
      setMedicalData({
        bloodGroup: patientData.bloodGroup || '',
        height: patientData.height || '',
        weight: patientData.weight || '',
        allergies: patientData.allergies || [],
        chronicDiseases: patientData.chronicDiseases || [],
        currentMedications: patientData.currentMedications || []
      });
    } catch (error) {
      toast.error('Failed to load patient details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMedicalHistory = async () => {
    try {
      await doctorAPI.updatePatientMedicalHistory(id, medicalData);
      toast.success('Medical history updated successfully');
      setEditMode(false);
      fetchPatientDetails();
    } catch (error) {
      toast.error('Failed to update medical history');
      console.error(error);
    }
  };

  const addAllergy = () => {
    if (newAllergy.allergen && newAllergy.severity) {
      setMedicalData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy]
      }));
      setNewAllergy({ allergen: '', severity: '', reaction: '' });
    }
  };

  const removeAllergy = (index) => {
    setMedicalData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const addDisease = () => {
    if (newDisease.trim()) {
      setMedicalData(prev => ({
        ...prev,
        chronicDiseases: [...prev.chronicDiseases, newDisease]
      }));
      setNewDisease('');
    }
  };

  const removeDisease = (index) => {
    setMedicalData(prev => ({
      ...prev,
      chronicDiseases: prev.chronicDiseases.filter((_, i) => i !== index)
    }));
  };

  const addMedication = () => {
    if (newMedication.medicineName && newMedication.dosage) {
      setMedicalData(prev => ({
        ...prev,
        currentMedications: [...prev.currentMedications, newMedication]
      }));
      setNewMedication({ medicineName: '', dosage: '', frequency: '' });
    }
  };

  const removeMedication = (index) => {
    setMedicalData(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== index)
    }));
  };

  const handleAddSurgery = async () => {
    try {
      await doctorAPI.addSurgeryRecord(id, surgeryForm);
      toast.success('Surgery record added successfully');
      setSurgeryForm({ surgeryName: '', date: '', surgeon: '', hospital: '', notes: '' });
      fetchPatientDetails();
    } catch (error) {
      toast.error('Failed to add surgery record');
      console.error(error);
    }
  };

  const handleAddVaccination = async () => {
    try {
      await doctorAPI.addVaccinationRecord(id, vaccinationForm);
      toast.success('Vaccination record added successfully');
      setVaccinationForm({ vaccineName: '', date: '', dose: '', administeredBy: '', nextDueDate: '' });
      fetchPatientDetails();
    } catch (error) {
      toast.error('Failed to add vaccination record');
      console.error(error);
    }
  };

  const addPrescriptionMedicine = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const removePrescriptionMedicine = (index) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleAddPrescription = async () => {
    try {
      await doctorAPI.addPrescription(id, prescriptionForm);
      toast.success('Prescription added successfully');
      setPrescriptionForm({
        diagnosis: '',
        medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        notes: '',
        followUpDate: ''
      });
      fetchPatientDetails();
      fetchPatientPrescriptions();
    } catch (error) {
      toast.error('Failed to add prescription');
      console.error(error);
    }
  };

  const handleOrderLabTest = async () => {
    try {
      if (!labTestForm.testName || !labTestForm.testCategory || !labTestForm.cost) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      await doctorAPI.orderLabTest(id, labTestForm);
      toast.success('Lab test ordered successfully');
      setLabTestForm({
        testName: '',
        testCategory: '',
        urgency: 'routine',
        notes: '',
        cost: ''
      });
      fetchPatientLabTests();
    } catch (error) {
      toast.error('Failed to order lab test');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="doctor" />
        <div className="flex-1 ml-64 mt-16 flex items-center justify-center">
          <p className="text-gray-500">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="doctor" />
        <div className="flex-1 ml-64 mt-16 flex items-center justify-center">
          <p className="text-gray-500">Patient not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Sidebar role="doctor" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {patient.user?.firstName} {patient.user?.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Patient ID: {patient.patientId}</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Back
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 mb-6">
            {['overview', 'vitals', 'medical-history', 'surgeries', 'vaccinations', 'prescriptions', 'lab-tests'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize ${
                  activeTab === tab
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Age:</span>
                    <span className="text-gray-900 dark:text-white">{patient.user?.age || 'N/A'} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                    <span className="text-gray-900 dark:text-white capitalize">{patient.user?.gender || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="text-gray-900 dark:text-white">{patient.user?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="text-gray-900 dark:text-white">{patient.user?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Medical Overview</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Blood Group:</span>
                    <span className="text-gray-900 dark:text-white">{patient.bloodGroup || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Height:</span>
                    <span className="text-gray-900 dark:text-white">{patient.height ? `${patient.height} cm` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                    <span className="text-gray-900 dark:text-white">{patient.weight ? `${patient.weight} kg` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Visits:</span>
                    <span className="text-gray-900 dark:text-white">{patient.totalVisits || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vitals Tab */}
          {activeTab === 'vitals' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Patient Vitals History</h2>
              
              {patient.currentAdmission && patient.currentAdmission.vitalsHistory && patient.currentAdmission.vitalsHistory.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      ℹ️ <strong>Current Admission:</strong> Bed {patient.currentAdmission.bed?.bedNumber} - {patient.currentAdmission.reasonForAdmission}
                    </p>
                  </div>

                  {patient.currentAdmission.vitalsHistory.slice().reverse().map((vital, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {new Date(vital.date).toLocaleDateString()} - {new Date(vital.date).toLocaleTimeString()}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Recorded by: Nurse {vital.recordedBy?.user?.firstName} {vital.recordedBy?.user?.lastName}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                          Entry #{patient.currentAdmission.vitalsHistory.length - index}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Blood Pressure</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{vital.bloodPressure || 'N/A'}</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Temperature</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{vital.temperature ? `${vital.temperature}°F` : 'N/A'}</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pulse</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{vital.pulse ? `${vital.pulse} bpm` : 'N/A'}</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Respiratory Rate</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{vital.respiratoryRate ? `${vital.respiratoryRate}/min` : 'N/A'}</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">O2 Saturation</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{vital.oxygenSaturation ? `${vital.oxygenSaturation}%` : 'N/A'}</p>
                        </div>

                        {vital.weight && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Weight</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{vital.weight} kg</p>
                          </div>
                        )}
                      </div>

                      {vital.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Notes:</strong> {vital.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No vitals recorded yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {patient.currentAdmission 
                      ? 'Nurses will record vitals during the patient\'s admission'
                      : 'Patient is not currently admitted'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Medical History Tab */}
          {activeTab === 'medical-history' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Medical History</h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <FiEdit /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateMedicalHistory}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <FiSave /> Save
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        fetchPatientDetails();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      <FiX /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blood Group</label>
                  {editMode ? (
                    <select
                      value={medicalData.bloodGroup}
                      onChange={(e) => setMedicalData({...medicalData, bloodGroup: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white">{medicalData.bloodGroup || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Height (cm)</label>
                  {editMode ? (
                    <input
                      type="number"
                      value={medicalData.height}
                      onChange={(e) => setMedicalData({...medicalData, height: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{medicalData.height || 'N/A'} cm</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weight (kg)</label>
                  {editMode ? (
                    <input
                      type="number"
                      value={medicalData.weight}
                      onChange={(e) => setMedicalData({...medicalData, weight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{medicalData.weight || 'N/A'} kg</p>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Allergies</h3>
                {editMode && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Allergen"
                      value={newAllergy.allergen}
                      onChange={(e) => setNewAllergy({...newAllergy, allergen: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <select
                      value={newAllergy.severity}
                      onChange={(e) => setNewAllergy({...newAllergy, severity: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Severity</option>
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Reaction"
                      value={newAllergy.reaction}
                      onChange={(e) => setNewAllergy({...newAllergy, reaction: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      onClick={addAllergy}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <FiPlus /> Add
                    </button>
                  </div>
                )}
                {medicalData.allergies?.length > 0 ? (
                  <div className="space-y-2">
                    {medicalData.allergies.map((allergy, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{allergy.allergen}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Severity: {allergy.severity} | Reaction: {allergy.reaction || 'N/A'}
                          </p>
                        </div>
                        {editMode && (
                          <button
                            onClick={() => removeAllergy(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No allergies recorded</p>
                )}
              </div>

              {/* Chronic Diseases */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Chronic Diseases</h3>
                {editMode && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Disease name"
                      value={newDisease}
                      onChange={(e) => setNewDisease(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      onClick={addDisease}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <FiPlus /> Add
                    </button>
                  </div>
                )}
                {medicalData.chronicDiseases?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {medicalData.chronicDiseases.map((disease, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                        <span>{disease}</span>
                        {editMode && (
                          <button
                            onClick={() => removeDisease(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiX size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No chronic diseases recorded</p>
                )}
              </div>

              {/* Current Medications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Current Medications</h3>
                {editMode && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Medicine name"
                      value={newMedication.medicineName}
                      onChange={(e) => setNewMedication({...newMedication, medicineName: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Frequency"
                      value={newMedication.frequency}
                      onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      onClick={addMedication}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <FiPlus /> Add
                    </button>
                  </div>
                )}
                {medicalData.currentMedications?.length > 0 ? (
                  <div className="space-y-2">
                    {medicalData.currentMedications.map((med, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{med.medicineName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {med.dosage} | {med.frequency}
                          </p>
                        </div>
                        {editMode && (
                          <button
                            onClick={() => removeMedication(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No current medications</p>
                )}
              </div>
            </div>
          )}

          {/* Surgeries Tab */}
          {activeTab === 'surgeries' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Surgery Records</h2>
              
              {/* Add Surgery Form */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Surgery Record</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Surgery Name"
                    value={surgeryForm.surgeryName}
                    onChange={(e) => setSurgeryForm({...surgeryForm, surgeryName: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  <input
                    type="date"
                    value={surgeryForm.date}
                    onChange={(e) => setSurgeryForm({...surgeryForm, date: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Surgeon"
                    value={surgeryForm.surgeon}
                    onChange={(e) => setSurgeryForm({...surgeryForm, surgeon: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Hospital"
                    value={surgeryForm.hospital}
                    onChange={(e) => setSurgeryForm({...surgeryForm, hospital: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  <textarea
                    placeholder="Notes"
                    value={surgeryForm.notes}
                    onChange={(e) => setSurgeryForm({...surgeryForm, notes: e.target.value})}
                    className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    rows="3"
                  />
                </div>
                <button
                  onClick={handleAddSurgery}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <FiPlus /> Add Surgery
                </button>
              </div>

              {/* Surgery List */}
              {patient.surgeries?.length > 0 ? (
                <div className="space-y-4">
                  {patient.surgeries.map((surgery, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{surgery.surgeryName}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>Date: {new Date(surgery.date).toLocaleDateString()}</p>
                        <p>Surgeon: {surgery.surgeon}</p>
                        <p>Hospital: {surgery.hospital}</p>
                      </div>
                      {surgery.notes && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Notes: {surgery.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No surgery records</p>
              )}
            </div>
          )}

          {/* Vaccinations Tab */}
          {activeTab === 'vaccinations' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Vaccination Records</h2>
              
              {/* Add Vaccination Form */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Vaccination Record</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Vaccine Name"
                    value={vaccinationForm.vaccineName}
                    onChange={(e) => setVaccinationForm({...vaccinationForm, vaccineName: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  <input
                    type="date"
                    value={vaccinationForm.date}
                    onChange={(e) => setVaccinationForm({...vaccinationForm, date: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Dose (e.g., 1st, 2nd)"
                    value={vaccinationForm.dose}
                    onChange={(e) => setVaccinationForm({...vaccinationForm, dose: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Administered By"
                    value={vaccinationForm.administeredBy}
                    onChange={(e) => setVaccinationForm({...vaccinationForm, administeredBy: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  <input
                    type="date"
                    placeholder="Next Due Date"
                    value={vaccinationForm.nextDueDate}
                    onChange={(e) => setVaccinationForm({...vaccinationForm, nextDueDate: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleAddVaccination}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <FiPlus /> Add Vaccination
                </button>
              </div>

              {/* Vaccination List */}
              {patient.vaccinations?.length > 0 ? (
                <div className="space-y-4">
                  {patient.vaccinations.map((vac, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{vac.vaccineName}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>Date: {new Date(vac.date).toLocaleDateString()}</p>
                        <p>Dose: {vac.dose}</p>
                        <p>Administered By: {vac.administeredBy}</p>
                        {vac.nextDueDate && <p>Next Due: {new Date(vac.nextDueDate).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No vaccination records</p>
              )}
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Prescriptions</h2>
              
              {/* Add Prescription Form */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Prescription</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Diagnosis"
                    value={prescriptionForm.diagnosis}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medicines</label>
                    {prescriptionForm.medicines.map((med, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Medicine"
                          value={med.medicineName}
                          onChange={(e) => {
                            const newMeds = [...prescriptionForm.medicines];
                            newMeds[index].medicineName = e.target.value;
                            setPrescriptionForm({...prescriptionForm, medicines: newMeds});
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={med.dosage}
                          onChange={(e) => {
                            const newMeds = [...prescriptionForm.medicines];
                            newMeds[index].dosage = e.target.value;
                            setPrescriptionForm({...prescriptionForm, medicines: newMeds});
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Frequency"
                          value={med.frequency}
                          onChange={(e) => {
                            const newMeds = [...prescriptionForm.medicines];
                            newMeds[index].frequency = e.target.value;
                            setPrescriptionForm({...prescriptionForm, medicines: newMeds});
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Duration"
                          value={med.duration}
                          onChange={(e) => {
                            const newMeds = [...prescriptionForm.medicines];
                            newMeds[index].duration = e.target.value;
                            setPrescriptionForm({...prescriptionForm, medicines: newMeds});
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                        <button
                          onClick={() => removePrescriptionMedicine(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addPrescriptionMedicine}
                      className="mt-2 text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                    >
                      <FiPlus /> Add Medicine
                    </button>
                  </div>

                  <textarea
                    placeholder="Notes"
                    value={prescriptionForm.notes}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    rows="3"
                  />

                  <input
                    type="date"
                    placeholder="Follow-up Date"
                    value={prescriptionForm.followUpDate}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, followUpDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleAddPrescription}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <FiPlus /> Add Prescription
                </button>
              </div>

              {/* Prescription History Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                  Prescription History
                </h3>
                
                {/* Prescription List */}
                {patientPrescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {patientPrescriptions.map((prescription) => (
                      <div 
                        key={prescription._id} 
                        className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {prescription.prescriptionId}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(prescription.createdAt || prescription.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          prescription.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        }`}>
                          {prescription.status || 'Active'}
                        </span>
                      </div>

                      {/* Diagnosis */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Diagnosis</h4>
                        <p className="text-gray-900 dark:text-white">{prescription.diagnosis}</p>
                      </div>

                      {/* Medicines */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Medications</h4>
                        <div className="space-y-2">
                          {prescription.medicines.map((medicine, index) => (
                            <div 
                              key={index}
                              className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {medicine.medicineName || medicine.medicineId?.name || medicine.name || 'Medicine'}
                                  </p>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    <span className="inline-block mr-4">
                                      <span className="font-medium">Dosage:</span> {medicine.dosage}
                                    </span>
                                    <span className="inline-block mr-4">
                                      <span className="font-medium">Frequency:</span> {medicine.frequency}
                                    </span>
                                    <span className="inline-block">
                                      <span className="font-medium">Duration:</span> {medicine.duration}
                                    </span>
                                  </div>
                                  {medicine.instructions && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                      <span className="font-medium">Instructions:</span> {medicine.instructions}
                                    </p>
                                  )}
                                </div>
                                <span className="ml-4 px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded">
                                  {medicine.quantity}x
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      {prescription.notes && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</h4>
                          <p className="text-gray-900 dark:text-white">{prescription.notes}</p>
                        </div>
                      )}

                      {/* Doctor Info */}
                      {prescription.doctor && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Prescribed by: <span className="font-medium text-gray-900 dark:text-white">
                              Dr. {prescription.doctor.user?.firstName || prescription.doctor.firstName} {prescription.doctor.user?.lastName || prescription.doctor.lastName}
                            </span>
                            {prescription.doctor.department && (
                              <span className="ml-2">
                                ({prescription.doctor.department.name})
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <FiClipboard className="mx-auto text-gray-400 text-4xl mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No prescriptions found for this patient</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add a prescription using the form above</p>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Lab Tests Tab */}
          {activeTab === 'lab-tests' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Lab Tests</h2>
              
              {/* Order New Lab Test Form */}
              <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order New Lab Test</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Name *
                    </label>
                    <input
                      type="text"
                      value={labTestForm.testName}
                      onChange={(e) => setLabTestForm({ ...labTestForm, testName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Complete Blood Count"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={labTestForm.testCategory}
                      onChange={(e) => setLabTestForm({ ...labTestForm, testCategory: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      <option value="Blood">Blood Test</option>
                      <option value="Urine">Urine Test</option>
                      <option value="Stool">Stool Test</option>
                      <option value="Radiology">Radiology</option>
                      <option value="ECG">ECG</option>
                      <option value="Ultrasound">Ultrasound</option>
                      <option value="CT Scan">CT Scan</option>
                      <option value="MRI">MRI</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="Biopsy">Biopsy</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Urgency *
                    </label>
                    <select
                      value={labTestForm.urgency}
                      onChange={(e) => setLabTestForm({ ...labTestForm, urgency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT (Immediate)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cost (₹) *
                    </label>
                    <input
                      type="number"
                      value={labTestForm.cost}
                      onChange={(e) => setLabTestForm({ ...labTestForm, cost: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Clinical Notes
                    </label>
                    <textarea
                      value={labTestForm.notes}
                      onChange={(e) => setLabTestForm({ ...labTestForm, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Additional instructions or clinical notes..."
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleOrderLabTest}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <FiPlus /> Order Lab Test
                  </button>
                </div>
              </div>

              {/* Lab Tests History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test History</h3>
                {patientLabTests.length > 0 ? (
                  <div className="space-y-4">
                    {patientLabTests.map((test) => (
                      <div
                        key={test._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{test.testName}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{test.testCategory}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              test.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : test.status === 'in-process'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}
                          >
                            {test.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Test ID:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">{test.testId}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Urgency:</span>
                            <span className={`ml-2 font-medium uppercase ${
                              test.urgency === 'stat' ? 'text-red-600 dark:text-red-400' :
                              test.urgency === 'urgent' ? 'text-orange-600 dark:text-orange-400' :
                              'text-gray-900 dark:text-white'
                            }`}>
                              {test.urgency}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Ordered:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {new Date(test.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">₹{test.cost}</span>
                          </div>
                        </div>
                        {test.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-medium">Notes:</span> {test.notes}
                            </p>
                          </div>
                        )}
                        {test.results && test.results.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Results:</p>
                            <div className="space-y-1">
                              {test.results.map((result, idx) => (
                                <div key={idx} className="text-sm flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">{result.parameter}:</span>
                                  <span className={`font-medium ${result.isAbnormal ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                    {result.value} {result.unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No lab tests ordered yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsPage;

