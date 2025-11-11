import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import Table from '../../components/Table';
import { FiFileText, FiClock, FiCheckCircle, FiDollarSign } from 'react-icons/fi';

const LabDashboard = () => {
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    total: 0,
    revenue: 0
  });
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', results: [] });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data } = await api.get('/lab/tests');
      const allTests = data.data || [];
      
      setTests(allTests);
      setStats({
        pending: allTests.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length,
        completed: allTests.filter(t => t.status === 'completed').length,
        total: allTests.length,
        revenue: allTests.filter(t => t.paymentStatus === 'paid').reduce((sum, t) => sum + t.cost, 0)
      });
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to fetch lab tests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-process': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'sample-collected': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'requested': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const updateTestStatus = async (testId, status) => {
    try {
      await api.patch(`/lab/tests/${testId}/status`, { status });
      toast.success('Status updated successfully');
      fetchTests();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    { header: 'Test ID', accessor: 'testId', render: (row) => <span className="font-medium text-sky-600 dark:text-sky-400">{row.testId}</span> },
    { header: 'Patient', accessor: 'patient', render: (row) => row.patient?.user ? `${row.patient.user.firstName} ${row.patient.user.lastName}` : 'N/A' },
    { header: 'Test Name', accessor: 'testName' },
    { header: 'Category', accessor: 'testCategory' },
    { header: 'Urgency', accessor: 'urgency', render: (row) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.urgency === 'stat' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : row.urgency === 'urgent' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>{row.urgency.toUpperCase()}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>{row.status.replace('-', ' ').toUpperCase()}</span> },
    { header: 'Date', accessor: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { header: 'Actions', accessor: 'actions', render: (row) => (
      <div className="flex gap-2">
        {row.status === 'requested' && (
          <button onClick={() => updateTestStatus(row._id, 'sample-collected')} className="px-3 py-1 bg-sky-600 text-white rounded-lg text-xs hover:bg-sky-700 transition-colors duration-200">
            Collect
          </button>
        )}
        {row.status === 'sample-collected' && (
          <button onClick={() => updateTestStatus(row._id, 'in-process')} className="px-3 py-1 bg-sky-600 text-white rounded-lg text-xs hover:bg-sky-700 transition-colors duration-200">
            Process
          </button>
        )}
        {row.status === 'in-process' && (
          <button onClick={() => { setSelectedTest(row); setShowUpdateModal(true); }} className="px-3 py-1 bg-sky-600 text-white rounded-lg text-xs hover:bg-sky-700 transition-colors duration-200">
            Complete
          </button>
        )}
      </div>
    )}
  ];

  const pendingTests = tests.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const completedTests = tests.filter(t => t.status === 'completed');

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar role="lab" />
        <div className="flex-1 ml-64 mt-16 overflow-x-hidden">
          <div className="p-8 max-w-full">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lab Dashboard</h1>
            <p className="text-sky-600 dark:text-sky-400 mb-8">Manage laboratory tests and results</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Pending Tests" value={stats.pending} icon={FiClock} color="orange" />
              <StatCard title="Completed Tests" value={stats.completed} icon={FiCheckCircle} color="green" />
              <StatCard title="Total Requests" value={stats.total} icon={FiFileText} color="blue" />
              <StatCard title="Revenue" value={`₹${stats.revenue.toFixed(2)}`} icon={FiDollarSign} color="purple" />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            ) : (
              <div className="space-y-6 overflow-hidden">
                <Card>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Completed Tests</h2>
                  <div className="overflow-x-auto -mx-6 px-6">
                    {completedTests.length > 0 ? <Table columns={columns} data={completedTests.slice(0, 10)} /> : <p className="text-gray-600 dark:text-gray-400 text-center py-8">No completed tests</p>}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Test Modal */}
      {showUpdateModal && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-sky-600 dark:text-sky-400">Complete Test: {selectedTest.testName}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">Add test results to mark as completed</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowUpdateModal(false); setSelectedTest(null); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                Cancel
              </button>
              <button onClick={async () => {
                await updateTestStatus(selectedTest._id, 'completed');
                setShowUpdateModal(false);
                setSelectedTest(null);
              }} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors duration-200">
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LabDashboard;
