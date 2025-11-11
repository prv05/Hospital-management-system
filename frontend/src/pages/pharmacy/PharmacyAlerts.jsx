import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FiAlertTriangle, FiPackage, FiCalendar } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PharmacyAlerts = () => {
  const [alerts, setAlerts] = useState({
    lowStock: [],
    expired: [],
    expiringSoon: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get('/pharmacy/alerts');
      setAlerts(data.data || { lowStock: [], expired: [], expiringSoon: [] });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar role="pharmacy" />
        <div className="flex-1 ml-64 mt-16 overflow-x-hidden">
          <div className="p-8 max-w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Stock Alerts
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor low stock and expiring medicines
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Loading alerts...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Low Stock Alerts */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg mr-3">
                          <FiAlertTriangle className="text-red-600 dark:text-red-400 text-2xl" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Low Stock Alert
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {alerts.lowStock?.length || 0} items need restocking
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {!alerts.lowStock || alerts.lowStock.length === 0 ? (
                      <div className="text-center py-8">
                        <FiPackage className="text-6xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No low stock items</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {alerts.lowStock.map((med) => (
                          <div key={med._id} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <FiPackage className="text-red-600 dark:text-red-400" />
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {med.name}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{med.genericName}</p>
                                <div className="flex gap-4 mt-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Category: {med.category}
                                  </span>
                                  {med.manufacturer && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Mfr: {med.manufacturer}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-red-600 dark:text-red-400 font-bold text-lg">
                                  {med.stock?.quantity || 0} {med.stock?.unit || 'units'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Min: {med.stock?.reorderLevel || 50}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  ₹{med.price?.sellingPrice?.toFixed(2) || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expired Medicines */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg mr-3">
                          <FiCalendar className="text-red-600 dark:text-red-400 text-2xl" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Expired Medicines
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {alerts.expired?.length || 0} items have expired
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {!alerts.expired || alerts.expired.length === 0 ? (
                      <div className="text-center py-8">
                        <FiCalendar className="text-6xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No expired medicines</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {alerts.expired.map((med) => (
                          <div key={med._id} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <FiPackage className="text-red-600 dark:text-red-400" />
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {med.name}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Batch: {med.batchNumber || 'N/A'}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-red-600 dark:text-red-400 font-bold">
                                  {new Date(med.expiryDate).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Stock: {med.stock?.quantity || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expiring Soon */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg mr-3">
                          <FiCalendar className="text-yellow-600 dark:text-yellow-400 text-2xl" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Expiring Soon
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {alerts.expiringSoon?.length || 0} items expiring within 90 days
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {!alerts.expiringSoon || alerts.expiringSoon.length === 0 ? (
                      <div className="text-center py-8">
                        <FiCalendar className="text-6xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No medicines expiring soon</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {alerts.expiringSoon.map((med) => (
                          <div key={med._id} className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <FiPackage className="text-yellow-600 dark:text-yellow-400" />
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {med.name}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Batch: {med.batchNumber || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {med.genericName}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-yellow-600 dark:text-yellow-400 font-bold">
                                  {new Date(med.expiryDate).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Stock: {med.stock?.quantity || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PharmacyAlerts;
