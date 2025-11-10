import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';
import { FiClock, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const NurseAttendance = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveData, setLeaveData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'sick'
  });

  const attendanceData = {
    currentShift: 'Morning (8 AM - 4 PM)',
    hoursWorked: 6.5,
    overtimeHours: 0,
    thisMonth: {
      present: 22,
      absent: 0,
      leaves: 2
    }
  };

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now);
    setIsCheckedIn(true);
    toast.success(`Checked in at ${now.toLocaleTimeString()}`);
  };

  const handleCheckOut = () => {
    if (checkInTime) {
      const now = new Date();
      const hours = ((now - checkInTime) / (1000 * 60 * 60)).toFixed(1);
      toast.success(`Checked out! Total hours: ${hours}h`);
      setIsCheckedIn(false);
      setCheckInTime(null);
    }
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    toast.success('Leave request submitted successfully!');
    setShowLeaveModal(false);
    setLeaveData({ startDate: '', endDate: '', reason: '', type: 'sick' });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Sidebar role="nurse" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Attendance & Shifts
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900 overflow-hidden hover:shadow-md transition-all">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FiClock className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Current Shift</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {attendanceData.currentShift}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900 overflow-hidden hover:shadow-md transition-all">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <FiCheckCircle className="text-2xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Hours Today</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {attendanceData.hoursWorked}h
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900 overflow-hidden hover:shadow-md transition-all">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <FiCalendar className="text-2xl text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">This Month</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {attendanceData.thisMonth.present} Days
                </p>
              </div>
            </div>
          </div>

          {/* Check In/Out Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900 overflow-hidden mb-6">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Today's Attendance</h2>
              <div className="flex gap-4">
                {!isCheckedIn ? (
                  <button
                    onClick={handleCheckIn}
                    className="flex-1 bg-emerald-600 text-white py-3.5 px-6 rounded-lg hover:bg-emerald-700 font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    ✓ Check In
                  </button>
                ) : (
                  <button
                    onClick={handleCheckOut}
                    className="flex-1 bg-red-600 text-white py-3.5 px-6 rounded-lg hover:bg-red-700 font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    ✕ Check Out
                  </button>
                )}
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="flex-1 bg-blue-600 text-white py-3.5 px-6 rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  📝 Apply for Leave
                </button>
              </div>
              {isCheckedIn && checkInTime && (
                <div className="mt-5 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
                    ✓ Checked in at {checkInTime.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Attendance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900 overflow-hidden mb-6">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Monthly Summary</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 hover:shadow-md transition-all">
                  <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{attendanceData.thisMonth.present}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Present</p>
                </div>
                <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 hover:shadow-md transition-all">
                  <p className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">{attendanceData.thisMonth.absent}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Absent</p>
                </div>
                <div className="text-center p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800 hover:shadow-md transition-all">
                  <p className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-2">{attendanceData.thisMonth.leaves}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Leaves</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shift Schedule */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Shift Schedule</h2>
              <div className="space-y-3">
                {[
                  { day: 'Monday', shift: 'Morning (8 AM - 4 PM)', status: 'Completed' },
                  { day: 'Tuesday', shift: 'Morning (8 AM - 4 PM)', status: 'Completed' },
                  { day: 'Wednesday', shift: 'Morning (8 AM - 4 PM)', status: 'In Progress' },
                  { day: 'Thursday', shift: 'Morning (8 AM - 4 PM)', status: 'Scheduled' },
                  { day: 'Friday', shift: 'Morning (8 AM - 4 PM)', status: 'Scheduled' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{item.day}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.shift}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                      item.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                      item.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">📝 Apply for Leave</h2>
                  <p className="text-blue-100 text-sm mt-1">Submit your leave request</p>
                </div>
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={handleLeaveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Leave Type
                </label>
                <select
                  value={leaveData.type}
                  onChange={(e) => setLeaveData({...leaveData, type: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                >
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="emergency">Emergency Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={leaveData.startDate}
                  onChange={(e) => setLeaveData({...leaveData, startDate: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={leaveData.endDate}
                  onChange={(e) => setLeaveData({...leaveData, endDate: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Reason
                </label>
                <textarea
                  value={leaveData.reason}
                  onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  rows="3"
                  placeholder="Please provide reason for leave..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Submit Application
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
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

export default NurseAttendance;
