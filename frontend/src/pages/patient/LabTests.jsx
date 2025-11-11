import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { patientAPI } from '../../api/services';
import toast from 'react-hot-toast';
import { FiDownload, FiClock, FiCheckCircle } from 'react-icons/fi';

const LabTests = () => {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLabTests();
  }, []);

  const fetchLabTests = async () => {
    try {
      const response = await patientAPI.getLabTests();
      setLabTests(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch lab tests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, text: 'Pending' },
      'sample-collected': { color: 'bg-blue-100 text-blue-800', icon: FiClock, text: 'Sample Collected' },
      'in-process': { color: 'bg-purple-100 text-purple-800', icon: FiClock, text: 'In Process' },
      completed: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: FiClock, text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const colors = {
      routine: 'bg-gray-100 text-gray-800',
      urgent: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[urgency] || colors.routine}`}>
        {urgency?.toUpperCase() || 'ROUTINE'}
      </span>
    );
  };

  const filteredTests = labTests.filter(test => {
    if (filter === 'all') return true;
    return test.status === filter;
  });

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Sidebar role="patient" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-4xl font-bold text-blue-900 dark:text-white mb-2">
                  Lab Tests
                </h1>
                <p className="text-blue-600 dark:text-blue-400">
                  View your lab test results and reports
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-blue-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    filter === 'pending'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-blue-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    filter === 'completed'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-blue-200'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-xl text-gray-500">Loading...</div>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">No lab tests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <div
                  key={test._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {test.testName}
                        </h3>
                        {getUrgencyBadge(test.urgency)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Test ID: {test.testId}
                      </p>
                    </div>
                    {getStatusBadge(test.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {test.testCategory || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Ordered By</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Dr. {test.doctor?.user?.firstName} {test.doctor?.user?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(test.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {test.status === 'completed' && test.results && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Results</h4>
                      {test.results.findings && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          <span className="font-medium">Findings:</span> {test.results.findings}
                        </p>
                      )}
                      {test.results.interpretation && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          <span className="font-medium">Interpretation:</span> {test.results.interpretation}
                        </p>
                      )}
                      {test.results.values && test.results.values.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-sm mb-2 text-gray-900 dark:text-white">Test Values:</p>
                          <div className="space-y-1">
                            {test.results.values.map((value, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300">{value.parameter}</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {value.value} {value.unit}
                                  {value.normalRange && (
                                    <span className="text-gray-500 ml-2">
                                      (Normal: {value.normalRange})
                                    </span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {test.technician && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                          Processed by: {test.technician.firstName} {test.technician.lastName}
                        </p>
                      )}
                      {test.completedAt && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Completed on: {new Date(test.completedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {test.status === 'sample-collected' && test.sampleCollectedAt && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Sample collected on: {new Date(test.sampleCollectedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {test.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Notes:</span> {test.notes}
                      </p>
                    </div>
                  )}

                  {test.cost && (
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Cost: ₹{test.cost}
                      </span>
                      {test.status === 'completed' && (
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                          onClick={() => toast.info('Download feature coming soon')}
                        >
                          <FiDownload />
                          Download Report
                        </button>
                      )}
                    </div>
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
