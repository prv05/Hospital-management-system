import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiCalendar, FiUser, FiCheckCircle, FiFileText } from 'react-icons/fi';

const CompletedTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchCompletedTests();
  }, []);

  const fetchCompletedTests = async () => {
    try {
      const { data } = await api.get('/lab/tests?status=completed');
      setTests(data.data || []);
    } catch (error) {
      console.error('Error fetching completed tests:', error);
      toast.error('Failed to fetch completed tests');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      stat: 'text-red-600 dark:text-red-400',
      urgent: 'text-orange-600 dark:text-orange-400',
      routine: 'text-blue-600 dark:text-blue-400'
    };
    return colors[urgency] || 'text-gray-600 dark:text-gray-400';
  };

  const handleViewDetails = (test) => {
    setSelectedTest(test);
    setShowDetailsModal(true);
  };

  const filteredTests = tests.filter(t => {
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
                Completed Tests
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View all completed laboratory tests and results
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Completed</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{tests.length}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                    <FiCheckCircle className="text-2xl text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ₹{tests.reduce((sum, test) => sum + (test.cost || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                    <FiFileText className="text-2xl text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paid Tests</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {tests.filter(t => t.paymentStatus === 'paid').length}
                    </p>
                  </div>
                  <div className="bg-sky-100 dark:bg-sky-900 p-3 rounded-lg">
                    <FiCheckCircle className="text-2xl text-sky-600 dark:text-sky-400" />
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
                <p className="text-gray-600 dark:text-gray-400">Loading completed tests...</p>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                {searchQuery ? (
                  <>
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Results Found</h3>
                    <p className="text-gray-600 dark:text-gray-400">No tests match "{searchQuery}"</p>
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="text-6xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg">No completed tests found</p>
                  </>
                )}
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
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        COMPLETED
                      </span>
                    </div>

                    {/* Patient & Doctor Info */}
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
                          <span className="font-medium">Doctor:</span>{' '}
                          Dr. {test.doctor?.user ? 
                            `${test.doctor.user.firstName} ${test.doctor.user.lastName}` : 
                            'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <FiCalendar className="mr-2 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm">
                          <span className="font-medium">Completed:</span>{' '}
                          {test.completedAt ? new Date(test.completedAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          }) : 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Category: </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {test.testCategory}
                          </span>
                        </div>
                        <div className={`text-sm font-semibold uppercase ${getUrgencyColor(test.urgency)}`}>
                          {test.urgency}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Cost:</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{test.cost?.toLocaleString()}
                        </span>
                      </div>

                      {test.paymentStatus && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Payment:</span>
                          <span className={`text-sm font-semibold px-2 py-1 rounded ${
                            test.paymentStatus === 'paid' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          }`}>
                            {test.paymentStatus.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => handleViewDetails(test)}
                      className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 rounded-lg transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Details</h2>
              <p className="text-sky-600 dark:text-sky-400 font-medium mt-1">{selectedTest.testId}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Test Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Test Information</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Test Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedTest.testName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedTest.testCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Urgency:</span>
                    <span className={`font-medium uppercase ${getUrgencyColor(selectedTest.urgency)}`}>
                      {selectedTest.urgency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">Completed</span>
                  </div>
                </div>
              </div>

              {/* Patient & Doctor */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Patient & Doctor</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Patient:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedTest.patient?.user ? 
                        `${selectedTest.patient.user.firstName} ${selectedTest.patient.user.lastName}` : 
                        'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Doctor:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Dr. {selectedTest.doctor?.user ? 
                        `${selectedTest.doctor.user.firstName} ${selectedTest.doctor.user.lastName}` : 
                        'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Timeline</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Requested:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedTest.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {selectedTest.sampleCollectedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Sample Collected:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedTest.sampleCollectedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {selectedTest.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedTest.completedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost & Payment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Cost & Payment</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Test Cost:</span>
                    <span className="font-bold text-xl text-gray-900 dark:text-white">
                      ₹{selectedTest.cost?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                    <span className={`font-semibold px-2 py-1 rounded ${
                      selectedTest.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    }`}>
                      {selectedTest.paymentStatus?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Results */}
              {selectedTest.results && selectedTest.results.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Test Results</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                    {selectedTest.results.map((result, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{result.parameter}</span>
                          <span className="font-bold text-gray-900 dark:text-white">{result.value} {result.unit}</span>
                        </div>
                        {result.normalRange && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Normal Range: {result.normalRange}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTest.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300">{selectedTest.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompletedTests;
