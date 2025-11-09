import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { labAPI } from '../../api/services';
import toast from 'react-hot-toast';

const LabTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await labAPI.getAllTests();
      setTests(response.data.data || response.data);
    } catch (error) {
      toast.error('Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = filter === 'all' ? tests : tests.filter(t => t.status === filter);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'sample-collected': 'bg-blue-100 text-blue-800',
      'in-process': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="lab" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Lab Test Requests
          </h1>

          <div className="mb-6">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="all">All Tests</option>
              <option value="pending">Pending</option>
              <option value="sample-collected">Sample Collected</option>
              <option value="in-process">In Process</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : filteredTests.length === 0 ? (
            <p className="text-gray-500">No tests found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTests.map((test) => (
                <div key={test._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {test.testName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Patient: {test.patientId?.firstName} {test.patientId?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Requested by: Dr. {test.doctorId?.firstName}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>📅 Requested: {new Date(test.requestDate).toLocaleDateString()}</p>
                    <p>🧪 Sample: {test.sampleType}</p>
                    {test.urgency && (
                      <p className="text-red-600 font-semibold">⚠️ {test.urgency.toUpperCase()}</p>
                    )}
                  </div>

                  {test.status !== 'completed' && (
                    <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">
                      Update Status
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabTests;
