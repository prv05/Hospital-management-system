import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { FiAlertTriangle } from 'react-icons/fi';
import { pharmacyAPI } from '../../api/services';
import toast from 'react-hot-toast';

const PharmacyAlerts = () => {
  const [alerts, setAlerts] = useState({ lowStock: [], expiring: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await pharmacyAPI.getAlerts();
      setAlerts(response.data.data || response.data);
    } catch (error) {
      toast.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="pharmacy" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Stock Alerts
          </h1>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-6">
              {/* Low Stock Alerts */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <FiAlertTriangle className="text-red-600 text-2xl mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Low Stock Alert ({alerts.lowStock.length})
                  </h2>
                </div>
                {alerts.lowStock.length === 0 ? (
                  <p className="text-gray-500">No low stock items</p>
                ) : (
                  <div className="space-y-3">
                    {alerts.lowStock.map((med) => (
                      <div key={med._id} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {med.name}
                            </h3>
                            <p className="text-sm text-gray-500">{med.genericName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-red-600 font-bold">{med.stockQuantity} {med.unit}</p>
                            <p className="text-xs text-gray-500">Min: {med.minStockLevel}</p>
                          </div>
                        </div>
                        <button className="mt-3 px-4 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700">
                          Reorder Stock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expiring Soon */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <FiAlertTriangle className="text-yellow-600 text-2xl mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Expiring Soon ({alerts.expiring.length})
                  </h2>
                </div>
                {alerts.expiring.length === 0 ? (
                  <p className="text-gray-500">No expiring medicines</p>
                ) : (
                  <div className="space-y-3">
                    {alerts.expiring.map((med) => (
                      <div key={med._id} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {med.name}
                            </h3>
                            <p className="text-sm text-gray-500">Batch: {med.batchNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-600 font-bold">
                              {new Date(med.expiryDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">Stock: {med.stockQuantity}</p>
                          </div>
                        </div>
                        <button className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                          Mark for Removal
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyAlerts;
