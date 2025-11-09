import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FiSearch } from 'react-icons/fi';
import { doctorAPI } from '../../api/services';
import toast from 'react-hot-toast';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPatients();
  }, []);

  const fetchAllPatients = async () => {
    setLoading(true);
    try {
      const response = await doctorAPI.getPatients();
      const patientsList = response.data.data || response.data || [];
      setAllPatients(patientsList);
      setPatients(patientsList);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setPatients(allPatients);
      return;
    }
    
    const filtered = allPatients.filter(patient => {
      const fullName = `${patient.user?.firstName} ${patient.user?.lastName}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return fullName.includes(searchLower) || 
             patient.patientId?.toLowerCase().includes(searchLower) ||
             patient.user?.phone?.includes(searchTerm);
    });
    
    setPatients(filtered);
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="doctor" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              My Patients
            </h1>
            
            <div className="mb-6 flex gap-2">
              <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Search
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-gray-500">Loading patients...</p>
            ) : patients.length === 0 ? (
              <p className="text-gray-500">No patients found.</p>
            ) : (
              patients.map((patient) => (
                <div key={patient._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {patient.user?.firstName} {patient.user?.lastName}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>ID: {patient.patientId}</p>
                    <p>Age: {patient.user?.age || 'N/A'} years</p>
                    <p>Blood Group: {patient.bloodGroup || 'N/A'}</p>
                    <p>Phone: {patient.user?.phone}</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/doctor/patients/${patient._id}`)}
                    className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default DoctorPatients;
