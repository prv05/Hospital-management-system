import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
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
      <Sidebar role="nurse" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Attendance & Shifts
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Current Shift"
              value={attendanceData.currentShift}
              icon={FiClock}
              color="blue"
            />
            <StatCard
              title="Hours Today"
              value={`${attendanceData.hoursWorked}h`}
              icon={FiCheckCircle}
              color="green"
            />
            <StatCard
              title="This Month"
              value={`${attendanceData.thisMonth.present} Days`}
              icon={FiCalendar}
              color="purple"
            />
          </div>

          {/* Check In/Out Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Today's Attendance</h2>
            <div className="flex gap-4">
              {!isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold"
                >
                  ✓ Check In
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 font-semibold"
                >
                  ✕ Check Out
                </button>
              )}
              <button
                onClick={() => setShowLeaveModal(true)}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold"
              >
                📝 Apply for Leave
              </button>
            </div>
            {isCheckedIn && checkInTime && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-green-800 dark:text-green-200">
                  ✓ Checked in at {checkInTime.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Attendance</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{attendanceData.thisMonth.present}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Present</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{attendanceData.thisMonth.absent}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Absent</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{attendanceData.thisMonth.leaves}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Leaves</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Shift Schedule</h2>
            <div className="space-y-3">
              {[
                { day: 'Monday', shift: 'Morning (8 AM - 4 PM)', status: 'Completed' },
                { day: 'Tuesday', shift: 'Morning (8 AM - 4 PM)', status: 'Completed' },
                { day: 'Wednesday', shift: 'Morning (8 AM - 4 PM)', status: 'In Progress' },
                { day: 'Thursday', shift: 'Morning (8 AM - 4 PM)', status: 'Scheduled' },
                { day: 'Friday', shift: 'Morning (8 AM - 4 PM)', status: 'Scheduled' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-semibold">{item.day}</p>
                    <p className="text-sm text-gray-500">{item.shift}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Apply for Leave
            </h2>
            
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Leave Type
                </label>
                <select
                  value={leaveData.type}
                  onChange={(e) => setLeaveData({...leaveData, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="emergency">Emergency Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={leaveData.startDate}
                  onChange={(e) => setLeaveData({...leaveData, startDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={leaveData.endDate}
                  onChange={(e) => setLeaveData({...leaveData, endDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason
                </label>
                <textarea
                  value={leaveData.reason}
                  onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows="3"
                  placeholder="Please provide reason for leave..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Submit Application
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
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
