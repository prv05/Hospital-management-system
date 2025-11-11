import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiCalendar, FiUser, FiActivity, FiAlertCircle } from 'react-icons/fi';

const LabTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data } = await api.get('/lab/tests');
      setTests(data.data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  const updateTestStatus = async (testId, newStatus) => {
    try {
      await api.patch(`/lab/tests/${testId}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchTests();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredTests = tests
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const patientName = t.patient?.user ? `${t.patient.user.firstName} ${t.patient.user.lastName}`.toLowerCase() : '';
      const doctorName = t.doctor?.user ? `${t.doctor.user.firstName} ${t.doctor.user.lastName}`.toLowerCase() : '';
      const testId = t.testId?.toLowerCase() || '';
      const testName = t.testName?.toLowerCase() || '';
      const category = t.testCategory?.toLowerCase() || '';
      
      return testId.includes(query) || testName.includes(query) || 
             patientName.includes(query) || doctorName.includes(query) || 
             category.includes(query);
    });

  const getStatusColor = (status) => {
    const colors = {
      requested: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'sample-collected': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'in-process': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      stat: 'text-red-600 dark:text-red-400',
      urgent: 'text-orange-600 dark:text-orange-400',
      routine: 'text-blue-600 dark:text-blue-400'
    };
    return colors[urgency] || 'text-gray-600 dark:text-gray-400';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      requested: 'sample-collected',
      'sample-collected': 'in-process',
      'in-process': 'completed'
    };
    return statusFlow[currentStatus];
  };

  const getStatusLabel = (status) => {
    const labels = {
      requested: 'Collect Sample',
      'sample-collected': 'Start Processing',
      'in-process': 'Mark Complete'
    };
    return labels[status] || 'Update Status';
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar role="lab" />
        <div className="flex-1 ml-64 mt-16 overflow-x-hidden">
          <div className="p-8 max-w-full">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lab Test Requests</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">View and manage all laboratory test requests</p>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by Test ID, Patient, Doctor, Test Name, or Category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              >
                <option value="all">All Tests</option>
                <option value="requested">Requested</option>
                <option value="sample-collected">Sample Collected</option>
                <option value="in-process">In Process</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Results Count */}
            {searchQuery && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Found {filteredTests.length} result{filteredTests.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Loading tests...</p>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">No tests found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTests.map((test) => (
                  <div 
                    key={test._id} 
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          {test.testName}
                        </h3>
                        <p className="text-sm text-sky-600 dark:text-sky-400 font-medium">
                          {test.testId}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(test.status)}`}>
                        {test.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Patient Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <FiUser className="mr-2 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm">
                          <span className="font-medium">Patient:</span>{' '}
                          {test.patient?.user ? 
                            `${test.patient.user.firstName} ${test.patient.user.lastName}` : 
                            'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <FiUser className="mr-2 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm">
                          <span className="font-medium">Requested by:</span>{' '}
                          Dr. {test.doctor?.user ? 
                            `${test.doctor.user.firstName} ${test.doctor.user.lastName}` : 
                            'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <FiCalendar className="mr-2 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm">
                          <span className="font-medium">Requested:</span>{' '}
                          {test.createdAt ? new Date(test.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          }) : 'Invalid Date'}
                        </span>
                      </div>

                      {test.sampleCollectedAt && (
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <FiActivity className="mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm">
                            <span className="font-medium">Sample:</span>{' '}
                            {new Date(test.sampleCollectedAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Category: </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {test.testCategory}
                          </span>
                        </div>
                        <div className={`flex items-center ${getUrgencyColor(test.urgency)}`}>
                          <FiAlertCircle className="mr-1" />
                          <span className="text-sm font-semibold uppercase">
                            {test.urgency}
                          </span>
                        </div>
                      </div>

                      {test.cost && (
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Cost:</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ₹{test.cost.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {test.status !== 'completed' && test.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          const nextStatus = getNextStatus(test.status);
                          if (nextStatus) {
                            updateTestStatus(test._id, nextStatus);
                          }
                        }}
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 rounded-lg transition-colors duration-200"
                      >
                        {getStatusLabel(test.status)}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LabTests;
