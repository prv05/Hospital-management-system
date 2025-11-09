import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FiEdit, FiTrash2, FiPlus, FiUsers, FiUserCheck, FiX } from 'react-icons/fi';
import { adminAPI } from '../../api/services';
import toast from 'react-hot-toast';

const DepartmentsManagement = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDoctors, setShowDoctors] = useState({});
  const [departmentDoctors, setDepartmentDoctors] = useState({});
  const [showHeadModal, setShowHeadModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedHead, setSelectedHead] = useState('');
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    location: { building: '', floor: '', wing: '' },
    phone: '',
    email: '',
    specialties: '',
    isActive: true
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await adminAPI.getDepartments();
      setDepartments(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentDoctors = async (deptId) => {
    try {
      const response = await adminAPI.getDepartmentDoctors(deptId);
      setDepartmentDoctors(prev => ({ ...prev, [deptId]: response.data.data }));
      setShowDoctors(prev => ({ ...prev, [deptId]: true }));
    } catch (error) {
      toast.error('Failed to fetch doctors');
    }
  };

  const toggleDoctors = (deptId) => {
    if (showDoctors[deptId]) {
      setShowDoctors(prev => ({ ...prev, [deptId]: false }));
    } else {
      if (!departmentDoctors[deptId]) {
        fetchDepartmentDoctors(deptId);
      } else {
        setShowDoctors(prev => ({ ...prev, [deptId]: true }));
      }
    }
  };

  const openHeadModal = async (dept) => {
    setSelectedDepartment(dept);
    setSelectedHead(dept.head?._id || '');
    setShowHeadModal(true);
    
    // Fetch doctors from this department
    try {
      const response = await adminAPI.getDepartmentDoctors(dept._id);
      setAvailableDoctors(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch doctors');
    }
  };

  const closeHeadModal = () => {
    setShowHeadModal(false);
    setSelectedDepartment(null);
    setSelectedHead('');
    setAvailableDoctors([]);
  };

  const handleAssignHead = async () => {
    if (!selectedHead) {
      toast.error('Please select a doctor');
      return;
    }

    try {
      // Find the selected doctor to get their user ID
      const selectedDoctor = availableDoctors.find(d => d._id === selectedHead);
      
      await adminAPI.updateDepartment(selectedDepartment._id, {
        head: selectedDoctor.user._id
      });
      
      toast.success('Department head assigned successfully');
      closeHeadModal();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign head');
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      code: '',
      description: '',
      location: { building: '', floor: '', wing: '' },
      phone: '',
      email: '',
      specialties: '',
      isActive: true
    });
    setShowDeptModal(true);
  };

  const openEditModal = (dept) => {
    setIsEditMode(true);
    setSelectedDepartment(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      location: dept.location || { building: '', floor: '', wing: '' },
      phone: dept.phone || '',
      email: dept.email || '',
      specialties: dept.specialties?.join(', ') || '',
      isActive: dept.isActive
    });
    setShowDeptModal(true);
  };

  const closeDeptModal = () => {
    setShowDeptModal(false);
    setSelectedDepartment(null);
    setIsEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [locationField]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      if (isEditMode) {
        await adminAPI.updateDepartment(selectedDepartment._id, submitData);
        toast.success('Department updated successfully');
      } else {
        await adminAPI.createDepartment(submitData);
        toast.success('Department created successfully');
      }
      closeDeptModal();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} department`);
    }
  };

  const handleDelete = async (deptId, deptName) => {
    if (!window.confirm(`Are you sure you want to delete ${deptName}?`)) {
      return;
    }

    try {
      await adminAPI.deleteDepartment(deptId);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete department');
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
              Departments Management
            </h1>
            <button 
              onClick={openAddModal}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              <FiPlus />
              <span>Add Department</span>
            </button>
          </div>

          {/* Departments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : departments.length === 0 ? (
              <p className="text-gray-500">No departments found</p>
            ) : (
              departments.map((dept) => (
                <div key={dept._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-gray-500">{dept.code}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditModal(dept)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Department"
                      >
                        <FiEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept._id, dept.name)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Department"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{dept.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Head:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {dept.head ? `Dr. ${dept.head.firstName} ${dept.head.lastName}` : 'Not Assigned'}
                        </span>
                        <button
                          onClick={() => openHeadModal(dept)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Assign Head"
                        >
                          <FiUserCheck size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Doctors:</span>
                      <span className="font-semibold text-primary-600">
                        {dept.doctorCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500">Operating Hours</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {dept.operatingHours?.start && dept.operatingHours?.end 
                        ? `${dept.operatingHours.start} - ${dept.operatingHours.end}`
                        : '24/7'
                      }
                    </p>
                  </div>

                  {/* View Doctors Button */}
                  {dept.doctorCount > 0 && (
                    <button
                      onClick={() => toggleDoctors(dept._id)}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <FiUsers />
                      <span>{showDoctors[dept._id] ? 'Hide Doctors' : 'View Doctors'}</span>
                    </button>
                  )}

                  {/* Doctors List */}
                  {showDoctors[dept._id] && departmentDoctors[dept._id] && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Department Doctors:</p>
                      {departmentDoctors[dept._id].map((doctor) => (
                        <div key={doctor._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Dr. {doctor.user.firstName} {doctor.user.lastName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{doctor.specialization}</p>
                          <p className="text-xs text-gray-500">{doctor.user.email}</p>
                          <p className="text-xs text-gray-500">Fee: ₹{doctor.consultationFee}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Assign Head Modal */}
      {showHeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Assign Department Head
              </h2>
              <button
                onClick={closeHeadModal}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Department: <span className="font-semibold text-gray-900 dark:text-white">{selectedDepartment?.name}</span>
              </p>
              {selectedDepartment?.head && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Current Head: <span className="font-semibold text-gray-900 dark:text-white">
                    Dr. {selectedDepartment.head.firstName} {selectedDepartment.head.lastName}
                  </span>
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Doctor
              </label>
              <select
                value={selectedHead}
                onChange={(e) => setSelectedHead(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Select a Doctor --</option>
                {availableDoctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.user.firstName} {doctor.user.lastName} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeHeadModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignHead}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Assign Head
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'Edit Department' : 'Add New Department'}
              </h2>
              <button
                onClick={closeDeptModal}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Building
                  </label>
                  <input
                    type="text"
                    name="location.building"
                    value={formData.location.building}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Floor
                  </label>
                  <input
                    type="text"
                    name="location.floor"
                    value={formData.location.floor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wing
                  </label>
                  <input
                    type="text"
                    name="location.wing"
                    value={formData.location.wing}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specialties (comma-separated)
                </label>
                <input
                  type="text"
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleInputChange}
                  placeholder="e.g., Emergency Care, Trauma Surgery"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Active Department
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeDeptModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {isEditMode ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default DepartmentsManagement;
