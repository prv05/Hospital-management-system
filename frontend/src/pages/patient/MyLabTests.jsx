import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Card from '../../components/Card';
import Table from '../../components/Table';

const MyLabTests = () => {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, pending

  useEffect(() => {
    fetchLabTests();
  }, []);

  const fetchLabTests = async () => {
    try {
      const { data } = await api.get('/api/patients/lab-tests');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-process':
        return 'bg-blue-100 text-blue-800';
      case 'sample-collected':
        return 'bg-yellow-100 text-yellow-800';
      case 'requested':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'stat':
        return 'bg-red-100 text-red-800';
      case 'urgent':
        return 'bg-orange-100 text-orange-800';
      case 'routine':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewResults = (test) => {
    setSelectedTest(test);
    setShowResults(true);
  };

  const columns = [
    { 
      header: 'Test ID', 
      accessor: 'testId',
      render: (row) => (
        <span className="font-medium text-blue-600">{row.testId}</span>
      )
    },
    { 
      header: 'Test Name', 
      accessor: 'testName'
    },
    { 
      header: 'Category', 
      accessor: 'testCategory'
    },
    { 
      header: 'Doctor', 
      accessor: 'doctor',
      render: (row) => row.doctor ? `Dr. ${row.doctor.user?.firstName || ''} ${row.doctor.user?.lastName || ''}` : 'N/A'
    },
    { 
      header: 'Date', 
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    { 
      header: 'Urgency', 
      accessor: 'urgency',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(row.urgency)}`}>
          {row.urgency.toUpperCase()}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {row.status.replace('-', ' ').toUpperCase()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => viewResults(row)}
          disabled={row.status !== 'completed'}
          className={`px-3 py-1 rounded text-sm ${
            row.status === 'completed'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {row.status === 'completed' ? 'View Results' : 'Pending'}
        </button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading lab tests...</div>
      </div>
    );
  }

  const completedTests = labTests.filter(t => t.status === 'completed').length;
  const pendingTests = labTests.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">My Lab Tests</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-sm text-gray-600 mb-1">Total Tests</div>
          <div className="text-2xl font-bold text-gray-800">{labTests.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600">{completedTests}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-orange-600">{pendingTests}</div>
        </Card>
      </div>

      {/* Lab Tests Table */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Lab Test History</h2>
        {filteredTests.length > 0 ? (
          <Table columns={columns} data={filteredTests} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No lab tests found for the selected filter
          </div>
        )}
      </Card>

      {/* Test Results Modal */}
      {showResults && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Lab Test Results</h2>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Test Header */}
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-600">Test ID</p>
                  <p className="font-semibold">{selectedTest.testId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Test Name</p>
                  <p className="font-semibold">{selectedTest.testName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold">{selectedTest.testCategory}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ordered By</p>
                  <p className="font-semibold">
                    Dr. {selectedTest.doctor?.user?.firstName || ''} {selectedTest.doctor?.user?.lastName || ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Collected Date</p>
                  <p className="font-semibold">
                    {selectedTest.sampleCollectedAt 
                      ? new Date(selectedTest.sampleCollectedAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Date</p>
                  <p className="font-semibold">
                    {selectedTest.completedAt 
                      ? new Date(selectedTest.completedAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Results */}
              {selectedTest.results && selectedTest.results.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Test Results</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-3 text-left">Parameter</th>
                          <th className="border p-3 text-left">Value</th>
                          <th className="border p-3 text-left">Unit</th>
                          <th className="border p-3 text-left">Normal Range</th>
                          <th className="border p-3 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTest.results.map((result, index) => (
                          <tr key={index} className={result.isAbnormal ? 'bg-red-50' : ''}>
                            <td className="border p-3">{result.parameter}</td>
                            <td className="border p-3 font-semibold">{result.value}</td>
                            <td className="border p-3">{result.unit}</td>
                            <td className="border p-3">{result.normalRange}</td>
                            <td className="border p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                result.isAbnormal ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {result.isAbnormal ? 'ABNORMAL' : 'NORMAL'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No results available yet
                </div>
              )}

              {selectedTest.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-gray-800">{selectedTest.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResults(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => toast.success('Download feature coming soon!')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLabTests;
