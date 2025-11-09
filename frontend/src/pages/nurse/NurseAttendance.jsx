import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { FiClock, FiCheckCircle, FiCalendar } from 'react-icons/fi';

const NurseAttendance = () => {
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
    </div>
  );
};

export default NurseAttendance;
