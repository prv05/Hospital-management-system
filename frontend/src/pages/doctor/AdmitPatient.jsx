import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiGrid, FiAlertCircle, FiUser, FiCalendar, FiFileText } from 'react-icons/fi';
import { doctorAPI } from '../../api/services';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function AdmitPatient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [bedsLoading, setBedsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [availableBeds, setAvailableBeds] = useState([]);

  const [formData, setFormData] = useState({
    bedId: '',
    admissionType: 'Scheduled',
    reasonForAdmission: '',
    provisionalDiagnosis: '',
    treatmentPlan: '',
    admissionDate: new Date().toISOString().split('T')[0]
  });

  const [bedFilters, setBedFilters] = useState({
    wardType: '',
    floor: ''
  });

  // Fetch available beds
  useEffect(() => {
    fetchAvailableBeds();
  }, [bedFilters]);

  const fetchAvailableBeds = async () => {
    setBedsLoading(true);
    try {
      const response = await doctorAPI.getAvailableBeds(bedFilters);
      setAvailableBeds(response.data.data);
    } catch (err) {
      console.error('Error fetching beds:', err);
    } finally {
      setBedsLoading(false);
    }
  };

  const handleSearchPatient = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setError('');
    try {
      const response = await doctorAPI.searchPatients(searchQuery);
      setSearchResults(response.data.data);
      if (response.data.data.length === 0) {
        setError('No patients found matching your search');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search patients');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchResults([]);
    setSearchQuery('');
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBedFilterChange = (e) => {
    setBedFilters({
      ...bedFilters,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setError('Please select a patient first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const admissionData = {
        patientId: selectedPatient._id,
        ...formData
      };

      await doctorAPI.admitPatient(admissionData);
      
      setSuccess('Patient admitted successfully!');
      setTimeout(() => {
        navigate('/doctor/patients');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to admit patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Sidebar role="doctor" />
      
      <div className="ml-64 pt-16">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admit Patient</h1>
            <p className="text-gray-600 dark:text-gray-400">Admit a patient and assign a bed</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
              <FiAlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start">
              <FiAlertCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-green-800 dark:text-green-200">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Patient Search & Selection */}
            <div className="space-y-6">
              {/* Patient Search */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FiSearch className="mr-2" />
                  Search Patient
                </h2>
                
                <form onSubmit={handleSearchPatient} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, email, or patient ID..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={searchLoading}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {searchLoading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((patient) => (
                      <div
                        key={patient._id}
                        onClick={() => handleSelectPatient(patient)}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {patient.user?.firstName} {patient.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {patient.patientId} • {patient.user?.email}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {patient.bloodGroup} • {patient.user?.phone}
                            </p>
                          </div>
                          <FiUser className="text-primary-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Patient Card */}
              {selectedPatient && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FiUser className="mr-2 text-primary-600" />
                    Selected Patient
                  </h2>
                  <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                    <p className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      {selectedPatient.user?.firstName} {selectedPatient.user?.lastName}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">ID:</span> {selectedPatient.patientId}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Blood:</span> {selectedPatient.bloodGroup}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Phone:</span> {selectedPatient.user?.phone}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Gender:</span> {selectedPatient.user?.gender}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPatient(null)}
                      className="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              )}

              {/* Available Beds */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FiGrid className="mr-2" />
                  Available Beds ({availableBeds.length})
                </h2>

                {/* Bed Filters */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ward Type
                    </label>
                    <select
                      name="wardType"
                      value={bedFilters.wardType}
                      onChange={handleBedFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="general">General</option>
                      <option value="semi-private">Semi-Private</option>
                      <option value="private">Private</option>
                      <option value="icu">ICU</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Floor
                    </label>
                    <select
                      name="floor"
                      value={bedFilters.floor}
                      onChange={handleBedFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="">All Floors</option>
                      <option value="1">Floor 1</option>
                      <option value="2">Floor 2</option>
                      <option value="3">Floor 3</option>
                      <option value="4">Floor 4</option>
                    </select>
                  </div>
                </div>

                {/* Beds List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {bedsLoading ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">Loading beds...</p>
                  ) : availableBeds.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">No beds available</p>
                  ) : (
                    availableBeds.map((bed) => (
                      <label
                        key={bed._id}
                        className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.bedId === bed._id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="bedId"
                          value={bed._id}
                          checked={formData.bedId === bed._id}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {bed.bedNumber} - {bed.wardNumber}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {bed.wardType.charAt(0).toUpperCase() + bed.wardType.slice(1)} • Floor {bed.floor}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                            ₹{bed.dailyCharge}/day
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Admission Form */}
            <div>
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <FiFileText className="mr-2" />
                  Admission Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Admission Type *
                    </label>
                    <select
                      name="admissionType"
                      value={formData.admissionType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiCalendar className="inline mr-1" />
                      Admission Date *
                    </label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Admission *
                    </label>
                    <textarea
                      name="reasonForAdmission"
                      value={formData.reasonForAdmission}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Brief description of why the patient is being admitted"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Provisional Diagnosis
                    </label>
                    <textarea
                      name="provisionalDiagnosis"
                      value={formData.provisionalDiagnosis}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Initial diagnosis or suspected conditions"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Treatment Plan
                    </label>
                    <textarea
                      name="treatmentPlan"
                      value={formData.treatmentPlan}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Planned treatment and care procedures"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => navigate('/doctor/patients')}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedPatient || !formData.bedId}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Admitting Patient...' : 'Admit Patient'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
