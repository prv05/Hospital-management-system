import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FiCalendar, FiUser, FiClock, FiFilter, FiSearch } from 'react-icons/fi';
import { adminAPI } from '../../api/services';
import toast from 'react-hot-toast';

const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    byDoctor: []
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await adminAPI.getAllAppointments();
      console.log('Appointments Response:', response);
      const appointmentsData = response.data.data || response.data || [];
      setAppointments(appointmentsData);
      calculateStats(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      const allUsers = response.data.data || response.data || [];
      const doctorsList = allUsers.filter(user => user.role === 'doctor');
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Failed to fetch doctors');
    }
  };

  const calculateStats = (appointmentsData) => {
    const total = appointmentsData.length;
    const scheduled = appointmentsData.filter(a => a.status === 'scheduled').length;
    const completed = appointmentsData.filter(a => a.status === 'completed').length;
    const cancelled = appointmentsData.filter(a => a.status === 'cancelled').length;

    // Count appointments by doctor
    const doctorCounts = {};
    appointmentsData.forEach(appointment => {
      const doctorId = appointment.doctor?._id || appointment.doctor;
      const doctorName = appointment.doctor?.user 
        ? `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`
        : appointment.doctor?.firstName 
        ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
        : 'Unknown Doctor';
      
      if (!doctorCounts[doctorId]) {
        doctorCounts[doctorId] = { name: doctorName, count: 0 };
      }
      doctorCounts[doctorId].count++;
    });

    const byDoctor = Object.values(doctorCounts).sort((a, b) => b.count - a.count);

    setStats({ total, scheduled, completed, cancelled, byDoctor });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === '' || 
      appointment.patient?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    
    const matchesDoctor = filterDoctor === 'all' || 
      appointment.doctor?._id === filterDoctor ||
      appointment.doctor === filterDoctor;

    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="admin" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Appointments Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all hospital appointments
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Appointments</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FiCalendar className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FiClock className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <FiCalendar className="w-6 h-6 text-green-600 dark:text-green-300" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <FiCalendar className="w-6 h-6 text-red-600 dark:text-red-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments by Doctor */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Appointments by Doctor
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.byDoctor.slice(0, 6).map((doctor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                        <FiUser className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{doctor.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {doctor.count} appointment{doctor.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                      {doctor.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient or doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Doctors</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointments Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Loading appointments...
                      </td>
                    </tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <tr key={appointment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {appointment.patient?.user?.firstName} {appointment.patient?.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {appointment.patient?.user?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Dr. {appointment.doctor?.user?.firstName || appointment.doctor?.firstName} {appointment.doctor?.user?.lastName || appointment.doctor?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {appointment.doctor?.specialization || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(appointment.appointmentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatTime(appointment.appointmentTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white capitalize">
                            {appointment.type || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentsManagement;
