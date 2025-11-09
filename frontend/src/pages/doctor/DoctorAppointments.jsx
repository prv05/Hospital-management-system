import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { doctorAPI } from '../../api/services';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiCheck, FiX, FiEdit2, FiList, FiGrid, FiUser, FiPhone, FiMail, FiActivity, FiFilter } from 'react-icons/fi';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [filterDate, setFilterDate] = useState('all'); // 'all', 'today', 'upcoming'
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await doctorAPI.getAppointments();
      setAppointments(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdating(appointmentId);
    try {
      await doctorAPI.updateAppointmentStatus(appointmentId, newStatus);
      toast.success(`Appointment ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'} successfully`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFuture = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filterDate === 'today') return isToday(apt.appointmentDate);
    if (filterDate === 'upcoming') return isFuture(apt.appointmentDate);
    return true;
  });

  const todayAppointments = appointments.filter(apt => isToday(apt.appointmentDate));

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'scheduled':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'confirmed':
        return 'bg-gray-900 text-white dark:bg-white dark:text-gray-900';
      case 'waiting':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'consultation':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'follow-up':
        return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'emergency':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'routine':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const AppointmentCard = ({ appointment }) => (
    <div className="bg-primary-50 dark:bg-gray-800 rounded-lg border border-primary-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-gray-600 transition-all duration-200">
      {/* Header */}
      <div className="p-6 border-b border-primary-100 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {appointment.patient?.user?.firstName} {appointment.patient?.user?.lastName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {appointment.patient?.patientId || 'N/A'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(appointment.status)}`}>
            {appointment.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-gray-400" />
              {formatDate(appointment.appointmentDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <FiClock className="w-4 h-4 text-gray-400" />
              {appointment.appointmentTime}
            </p>
          </div>
        </div>

        {/* Patient Details */}
        <div className="pt-3 border-t border-primary-100 dark:border-gray-700 space-y-2">
          {appointment.patient?.user?.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiPhone className="w-4 h-4" />
              <span>{appointment.patient.user.phone}</span>
            </div>
          )}
          {appointment.patient?.bloodGroup && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiActivity className="w-4 h-4" />
              <span>Blood Group: {appointment.patient.bloodGroup}</span>
            </div>
          )}
        </div>

        {/* Appointment Type */}
        <div className="flex items-center justify-between pt-3 border-t border-primary-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
          <span className={`px-3 py-1 rounded-md text-xs font-medium ${getTypeColor(appointment.type)}`}>
            {appointment.type || 'General'}
          </span>
        </div>

        {/* Action Buttons */}
        {(appointment.status === 'scheduled' || appointment.status === 'waiting') && (
          <div className="flex gap-3 pt-4 border-t border-primary-100 dark:border-gray-700">
            <button
              onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
              disabled={updating === appointment._id}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {updating === appointment._id ? 'Updating...' : 'Accept'}
            </button>
            <button
              onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
              disabled={updating === appointment._id}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-primary-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-primary-50 dark:bg-gray-900">
        <Sidebar role="doctor" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
                Appointments
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your patient appointments</p>
            </div>

            {/* Today's Stats - Minimalistic */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 border border-primary-100 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Today's Total</p>
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white">{todayAppointments.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-primary-100 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <FiClock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {todayAppointments.filter(a => a.status === 'scheduled' || a.status === 'waiting').length}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-primary-100 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Confirmed</p>
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <FiCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {todayAppointments.filter(a => a.status === 'confirmed').length}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-primary-100 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <FiActivity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {todayAppointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>

            {/* Filters - Minimalistic */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterDate('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filterDate === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-primary-200 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-700'
                  }`}
                >
                  All ({appointments.length})
                </button>
                <button
                  onClick={() => setFilterDate('today')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filterDate === 'today'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-primary-200 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Today ({todayAppointments.length})
                </button>
                <button
                  onClick={() => setFilterDate('upcoming')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filterDate === 'upcoming'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-primary-200 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Upcoming ({appointments.filter(a => isFuture(a.appointmentDate)).length})
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-primary-200 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'calendar' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-primary-200 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Appointments List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
                </div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 border border-primary-100 dark:border-gray-700 rounded-lg p-12 text-center">
                <FiCalendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No appointments found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">There are no appointments matching your filter.</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAppointments.map(appointment => (
                  <AppointmentCard key={appointment._id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-primary-100 dark:border-gray-700 rounded-lg p-8">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Calendar View</h2>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-3">
                      {day}
                    </div>
                  ))}
                  <div className="col-span-7 text-center text-gray-400 dark:text-gray-500 py-12 border-t border-primary-100 dark:border-gray-700">
                    <FiGrid className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Calendar view coming soon</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorAppointments;
