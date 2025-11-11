import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaFlask, FaCheckCircle, FaClock, FaFilePdf, FaEye } from 'react-icons/fa';

const MyLabTests = () => {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLabTests();
  }, []);

  const fetchLabTests = async () => {
    try {
      const { data } = await api.get('/patients/lab-tests');
      setLabTests(data.data || []);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch lab tests');
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = labTests.filter(test => {
    if (filter === 'all') return true;
    if (filter === 'completed') return test.status === 'completed';
    if (filter === 'pending') return test.status !== 'completed' && test.status !== 'cancelled';
    return true;
  });

  const totalTests = labTests.length;
  const completedTests = labTests.filter(t => t.status === 'completed').length;
  const pendingTests = labTests.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-process':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sample-collected':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'requested':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const viewTestDetails = (test) => {
    setSelectedTest(test);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <Sidebar role="patient" />
        <div className="ml-64 mt-16 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-primary-600 dark:text-primary-400">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Sidebar role="patient" />
      
      <div className="ml-64 mt-16 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white dark:text-white mb-2">My Lab Tests</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400">View and track your laboratory test results</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 text-sm mb-1">Total Tests</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white dark:text-white">{totalTests}</p>
              </div>
              <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-lg">
                <FaFlask className="text-primary-600 dark:text-primary-400 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completedTests}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
                <FaCheckCircle className="text-green-600 dark:text-green-400 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 text-sm mb-1">Pending</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{pendingTests}</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-lg">
                <FaClock className="text-orange-600 dark:text-orange-400 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Tests
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Lab Tests List */}
        {filteredTests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <FaFlask className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Lab Tests Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? 'You have no lab tests yet.'
                : `You have no ${filter} lab tests.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTests.map((test) => (
              <div
                key={test._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{test.testName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(test.status)}`}>
                        {test.status?.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Test ID</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{test.testId || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Ordered By</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          Dr. {test.orderedBy?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Ordered Date</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{formatDate(test.orderDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Sample Type</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{test.sampleType || 'N/A'}</p>
                      </div>
                    </div>

                    {test.status === 'completed' && test.completedDate && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-500">
                          Completed on {formatDate(test.completedDate)}
                          {test.performedBy && ` by ${test.performedBy.name}`}
                        </p>
                      </div>
                    )}

                    {test.notes && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-1">Notes:</p>
                        <p className="text-sm text-gray-700">{test.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => viewTestDetails(test)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                      <FaEye />
                      View Details
                    </button>
                    {test.status === 'completed' && test.reportUrl && (
                      <a
                        href={test.reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 justify-center"
                      >
                        <FaFilePdf />
                        Download PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Details Modal */}
      {showDetails && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedTest.testName}</h2>
                  <p className="text-primary-100">Test ID: {selectedTest.testId || 'N/A'}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white hover:text-primary-100 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Test Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Test Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTest.status)}`}>
                      {selectedTest.status?.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Sample Type</p>
                    <p className="font-medium text-gray-800 dark:text-white">{selectedTest.sampleType || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Ordered By</p>
                    <p className="font-medium text-gray-800 dark:text-white">Dr. {selectedTest.orderedBy?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Ordered Date</p>
                    <p className="font-medium text-gray-800 dark:text-white">{formatDate(selectedTest.orderDate)}</p>
                  </div>
                  {selectedTest.sampleCollectionDate && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Sample Collected</p>
                      <p className="font-medium text-gray-800 dark:text-white">{formatDate(selectedTest.sampleCollectionDate)}</p>
                    </div>
                  )}
                  {selectedTest.completedDate && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Completed Date</p>
                      <p className="font-medium text-gray-800 dark:text-white">{formatDate(selectedTest.completedDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Results */}
              {selectedTest.status === 'completed' && selectedTest.results && selectedTest.results.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Test Results</h3>
                  <div className="space-y-3">
                    {selectedTest.results.map((result, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Parameter</p>
                            <p className="font-medium text-gray-800 dark:text-white">{result.parameter}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Value</p>
                            <p className="font-semibold text-gray-800 dark:text-white">{result.value} {result.unit}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Reference Range</p>
                            <p className="text-sm text-gray-700">{result.referenceRange || 'N/A'}</p>
                          </div>
                        </div>
                        {result.remarks && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">Remarks:</p>
                            <p className="text-sm text-gray-700">{result.remarks}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTest.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Notes</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-gray-700">{selectedTest.notes}</p>
                  </div>
                </div>
              )}

              {/* Performed By */}
              {selectedTest.performedBy && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Performed By</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-white">{selectedTest.performedBy.name}</p>
                    {selectedTest.performedBy.employeeId && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">ID: {selectedTest.performedBy.employeeId}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-200 text-gray-800 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
                {selectedTest.status === 'completed' && selectedTest.reportUrl && (
                  <a
                    href={selectedTest.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FaFilePdf />
                    Download Full Report
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLabTests;
