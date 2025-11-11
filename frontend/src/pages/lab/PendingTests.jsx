import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiCalendar, FiUser, FiAlertCircle, FiActivity, FiClock } from 'react-icons/fi';

const PendingTests = () => {
  const [pendingTests, setPendingTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPendingTests();
  }, []);

  const fetchPendingTests = async () => {
    try {
      const { data } = await api.get('/lab/tests');
      const pending = (data.data || []).filter(t => 
        t.status === 'requested' || t.status === 'sample-collected' || t.status === 'in-process'
      );
      setPendingTests(pending);
    } catch (error) {
      console.error('Error fetching pending tests:', error);
      toast.error('Failed to fetch pending tests');
    } finally {
      setLoading(false);
    }
  };

  const updateTestStatus = async (testId, newStatus) => {
    try {
      await api.patch(`/lab/tests/${testId}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchPendingTests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'sample-collected': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'in-process': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      stat: 'text-red-600 dark:text-red-400 font-bold',
      urgent: 'text-orange-600 dark:text-orange-400 font-semibold',
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

  const filteredTests = pendingTests.filter(t => {
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

  const statsByStatus = {
    requested: pendingTests.filter(t => t.status === 'requested').length,
    'sample-collected': pendingTests.filter(t => t.status === 'sample-collected').length,
    'in-process': pendingTests.filter(t => t.status === 'in-process').length
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar role="lab" />
        <div className="flex-1 ml-64 mt-16 overflow-x-hidden">
          <div className="p-8 max-w-full">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Pending Tests ({pendingTests.length})
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Tests awaiting collection, processing, or completion
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Requested</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{statsByStatus.requested}</p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                    <FiClock className="text-2xl text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sample Collected</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{statsByStatus['sample-collected']}</p>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                    <FiActivity className="text-2xl text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Process</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{statsByStatus['in-process']}</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                    <FiActivity className="text-2xl text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by Test ID, Patient, Doctor, Test Name, or Category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
            </div>

            {/* Results Count */}
            {searchQuery && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Found {filteredTests.length} result{filteredTests.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Loading pending tests...</p>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="text-6xl mb-4">{searchQuery ? '🔍' : '🎉'}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No Results Found' : 'All Caught Up!'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? `No tests match "${searchQuery}"` : 'No pending tests at the moment'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTests.map((test) => (
                  <div 
                    key={test._id} 
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      {/* Left Section - Test Details */}
                      <div className="flex-1 space-y-3">
                        {/* Test Name & ID */}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {test.testName}
                          </h3>
                          <p className="text-sm text-sky-600 dark:text-sky-400 font-medium">
                            {test.testId}
                          </p>
                        </div>

                        {/* Patient Info */}
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <FiUser className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          <div>
                            <span className="text-sm">
                              <span className="font-medium">Patient:</span>{' '}
                              {test.patient?.user ? 
                                `${test.patient.user.firstName} ${test.patient.user.lastName}` : 
                                'N/A'}
                            </span>
                            {test.patient?.patientId && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                ({test.patient.patientId})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Doctor Info */}
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <FiUser className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          <span className="text-sm">
                            <span className="font-medium">Requested by:</span>{' '}
                            Dr. {test.doctor?.user ? 
                              `${test.doctor.user.firstName} ${test.doctor.user.lastName}` : 
                              'N/A'}
                          </span>
                        </div>

                        {/* Date & Time */}
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <FiCalendar className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          <span className="text-sm">
                            <span className="font-medium">Requested:</span>{' '}
                            {test.createdAt ? new Date(test.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            }) : 'N/A'}
                          </span>
                        </div>

                        {/* Sample Collection Time */}
                        {test.sampleCollectedAt && (
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <FiActivity className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-sm">
                              <span className="font-medium">Sample Collected:</span>{' '}
                              {new Date(test.sampleCollectedAt).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </span>
                          </div>
                        )}

                        {/* Category & Cost */}
                        <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Category: </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {test.testCategory}
                            </span>
                          </div>
                          {test.cost && (
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Cost: </span>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                ₹{test.cost.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Status & Actions */}
                      <div className="flex flex-col gap-3 lg:min-w-[200px]">
                        {/* Status Badge */}
                        <span className={`px-3 py-2 rounded-lg text-xs font-semibold text-center ${getStatusColor(test.status)}`}>
                          {test.status.replace('-', ' ').toUpperCase()}
                        </span>

                        {/* Urgency Badge */}
                        <div className={`flex items-center justify-center gap-1 ${getUrgencyColor(test.urgency)}`}>
                          <FiAlertCircle className="text-lg" />
                          <span className="text-sm uppercase">
                            {test.urgency}
                          </span>
                        </div>

                        {/* Action Button */}
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
                      </div>
                    </div>
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

export default PendingTests;
