import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FiEdit, FiPlus, FiTrash2, FiX, FiUser, FiUserCheck } from 'react-icons/fi';
import { adminAPI } from '../../api/services';
import toast from 'react-hot-toast';

const BedsManagement = () => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    bedNumber: '',
    ward: '',
    roomNumber: '',
    floor: '',
    bedType: 'general',
    department: '',
    dailyCharge: '',
    status: 'vacant',
    isAvailable: true
  });

  useEffect(() => {
    fetchBeds();
    fetchDepartments();
  }, []);

  const fetchBeds = async () => {
    try {
      const response = await adminAPI.getBeds();
      setBeds(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch beds');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await adminAPI.getDepartments();
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const filteredBeds = filterStatus === 'all' 
    ? beds 
    : beds.filter(bed => bed.status === filterStatus);

  const getStatusColor = (status) => {
    const colors = {
      vacant: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      occupied: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      reserved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getBedTypeStyles = (type) => {
    const styles = {
      'general': {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-l-4 border-blue-500',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        icon: '🏥'
      },
      'icu': {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-l-4 border-red-500',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        icon: '🚨'
      },
      'private': {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-l-4 border-purple-500',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        icon: '👑'
      },
      'semi-private': {
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        border: 'border-l-4 border-indigo-500',
        badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
        icon: '🏨'
      },
      'emergency': {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-l-4 border-orange-500',
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        icon: '⚡'
      }
    };
    return styles[type] || styles['general'];
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedBed(null);
    setFormData({
      bedNumber: '',
      ward: '',
      roomNumber: '',
      floor: '',
      bedType: 'general',
      department: '',
      dailyCharge: '',
      status: 'vacant',
      isAvailable: true
    });
    setShowModal(true);
  };

  const openEditModal = (bed) => {
    setIsEditMode(true);
    setSelectedBed(bed);
    setFormData({
      bedNumber: bed.bedNumber || '',
      ward: bed.ward || '',
      roomNumber: bed.roomNumber || '',
      floor: bed.floor || '',
      bedType: bed.bedType || 'general',
      department: bed.department?._id || '',
      dailyCharge: bed.dailyCharge || '',
      status: bed.status || 'vacant',
      isAvailable: bed.isAvailable !== false
    });
    setShowModal(true);
  };

  const openDetailsModal = (bed) => {
    setSelectedBed(bed);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowDetailsModal(false);
    setSelectedBed(null);
    setIsEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditMode) {
        await adminAPI.updateBed(selectedBed._id, formData);
        toast.success('Bed updated successfully');
      } else {
        await adminAPI.createBed(formData);
        toast.success('Bed created successfully');
      }
      
      closeModal();
      fetchBeds();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} bed`);
    }
  };

  const handleDelete = async (bedId, bedNumber) => {
    if (!window.confirm(`Are you sure you want to delete bed ${bedNumber}?`)) {
      return;
    }

    try {
      await adminAPI.deleteBed(bedId);
      toast.success('Bed deleted successfully');
      fetchBeds();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete bed');
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="admin" />
        <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Beds Management
            </h1>
            <button 
              onClick={openAddModal}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              <FiPlus />
              <span>Add Bed</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Beds</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{beds.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
              <p className="text-3xl font-bold text-green-600">
                {beds.filter(b => b.status === 'vacant' || b.status === 'available').length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">Occupied</p>
              <p className="text-3xl font-bold text-red-600">
                {beds.filter(b => b.status === 'occupied').length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400">Occupancy Rate</p>
              <p className="text-3xl font-bold text-blue-600">
                {beds.length > 0 ? Math.round((beds.filter(b => b.status === 'occupied').length / beds.length) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="all">All Beds</option>
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          {/* Beds Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : filteredBeds.length === 0 ? (
              <p className="text-gray-500">No beds found</p>
            ) : (
              filteredBeds.map((bed) => {
                const bedStyles = getBedTypeStyles(bed.bedType);
                return (
                  <div
                    key={bed._id}
                    className={`${bedStyles.bg} ${bedStyles.border} rounded-lg p-4 hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span>{bedStyles.icon}</span>
                          {bed.bedNumber}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{bed.ward} - {bed.roomNumber}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(bed)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(bed._id, bed.bedNumber)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(bed.status)}`}>
                          {bed.status}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${bedStyles.badge}`}>
                          {(bed.bedType || 'general').replace('-', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Ward:</span> {bed.wardNumber || bed.ward || 'N/A'}
                      </p>

                      {bed.status === 'occupied' && bed.currentPatient && (
                        <div className="mt-2 space-y-1.5">
                          <div className="text-xs">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Patient:</span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {bed.currentPatient.user?.firstName || bed.currentPatient.firstName || 'N/A'} {bed.currentPatient.user?.lastName || bed.currentPatient.lastName || ''}
                            </p>
                          </div>
                          
                          {bed.assignedDoctor && (
                            <div className="text-xs">
                              <span className="font-semibold text-gray-700 dark:text-gray-300">Doctor:</span>
                              <p className="text-gray-600 dark:text-gray-400">
                                Dr. {bed.assignedDoctor.firstName} {bed.assignedDoctor.lastName}
                              </p>
                            </div>
                          )}
                          
                          {bed.assignedNurse && (
                            <div className="text-xs">
                              <span className="font-semibold text-gray-700 dark:text-gray-300">Nurse:</span>
                              <p className="text-gray-600 dark:text-gray-400">
                                {bed.assignedNurse.firstName} {bed.assignedNurse.lastName}
                              </p>
                            </div>
                          )}

                          <button
                            onClick={() => openDetailsModal(bed)}
                            className="w-full text-xs text-white bg-primary-600 hover:bg-primary-700 rounded py-2 px-3 flex items-center justify-center gap-1 mt-2"
                          >
                            <FiUser size={12} />
                            View Full Details
                          </button>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Rate:</span> ₹{bed.dailyCharge || 0}/day
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Bed Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditMode ? 'Edit Bed' : 'Add New Bed'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <FiX size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bed Number *
                  </label>
                  <input
                    type="text"
                    name="bedNumber"
                    value={formData.bedNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ward Number *
                  </label>
                  <input
                    type="text"
                    name="wardNumber"
                    value={formData.wardNumber || formData.ward || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., GW-01, SPW-05, PW-10, ICU-01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Floor *
                  </label>
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 1, 2, 3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ward Type *
                  </label>
                  <select
                    name="wardType"
                    value={formData.wardType || formData.bedType || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Ward Type</option>
                    <option value="general">General Ward</option>
                    <option value="icu">ICU Ward</option>
                    <option value="private">Private Ward</option>
                    <option value="semi-private">Semi-Private Ward</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bed Type *
                  </label>
                  <select
                    name="bedType"
                    value={formData.bedType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Bed Type</option>
                    <option value="general">General Ward</option>
                    <option value="icu">ICU Ward</option>
                    <option value="private">Private Ward</option>
                    <option value="semi-private">Semi-Private Ward</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Daily Charge (₹) *
                  </label>
                  <input
                    type="number"
                    name="dailyCharge"
                    value={formData.dailyCharge}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="e.g., 1000, 2000, 3000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Available for Booking
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {isEditMode ? 'Update Bed' : 'Create Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showDetailsModal && selectedBed && selectedBed.currentPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Bed {selectedBed.bedNumber} - Patient Details
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <FiX size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiUser /> Patient Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedBed.currentPatient.user?.firstName || selectedBed.currentPatient.firstName} {selectedBed.currentPatient.user?.lastName || selectedBed.currentPatient.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedBed.currentPatient.user?.email || selectedBed.currentPatient.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedBed.currentPatient.user?.phone || selectedBed.currentPatient.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {selectedBed.currentPatient.user?.gender || selectedBed.currentPatient.gender || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Doctor Information */}
              {selectedBed.assignedDoctor && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FiUserCheck /> Assigned Doctor
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Dr. {selectedBed.assignedDoctor.firstName} {selectedBed.assignedDoctor.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedBed.assignedDoctor.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedBed.assignedDoctor.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!selectedBed.assignedDoctor && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    ⚠️ No doctor assigned to this bed yet.
                  </p>
                </div>
              )}

              {/* Nurse Information */}
              {selectedBed.assignedNurse && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FiUserCheck /> Assigned Nurse
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedBed.assignedNurse.firstName} {selectedBed.assignedNurse.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedBed.assignedNurse.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedBed.assignedNurse.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!selectedBed.assignedNurse && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    ⚠️ No nurse assigned to this bed yet.
                  </p>
                </div>
              )}

              {/* Bed Details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bed Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bed Number</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedBed.bedNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ward Number</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedBed.wardNumber || selectedBed.ward || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {(selectedBed.bedType || 'general').replace('-', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Daily Charge</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">₹{selectedBed.dailyCharge}/day</p>
                  </div>
                  {selectedBed.admittedAt && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Admitted On</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(selectedBed.admittedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default BedsManagement;
