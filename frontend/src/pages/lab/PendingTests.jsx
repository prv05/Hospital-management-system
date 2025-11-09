import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { labAPI } from '../../api/services';
import toast from 'react-hot-toast';

const PendingTests = () => {
  const [pendingTests, setPendingTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingTests();
  }, []);

  const fetchPendingTests = async () => {
    try {
      const response = await labAPI.getPendingTests();
      setPendingTests(response.data.data || response.data);
    } catch (error) {
      toast.error('Failed to fetch pending tests');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectSample = async (testId) => {
    try {
      await labAPI.updateTestStatus(testId, { status: 'sample-collected' });
      toast.success('Sample collected');
      fetchPendingTests();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="lab" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Pending Tests ({pendingTests.length})
          </h1>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : pendingTests.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">🎉 No pending tests!</p>
              <p className="text-gray-400 text-sm mt-2">All tests are up to date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTests.map((test) => (
                <div key={test._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {test.testName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Patient: {test.patientId?.firstName} {test.patientId?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {test.patientId?.patientId}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Requested by:</p>
                      <p className="font-medium">Dr. {test.doctorId?.firstName} {test.doctorId?.lastName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(test.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex flex-col justify-between">
                      {test.urgency === 'urgent' && (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold mb-2">
                          ⚠️ URGENT
                        </span>
                      )}
                      <button
                        onClick={() => handleCollectSample(test._id)}
                        className="bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                      >
                        Collect Sample
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
  );
};

export default PendingTests;
