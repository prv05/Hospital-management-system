import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { patientAPI } from '../../api/services';
import toast from 'react-hot-toast';
import { FiFileText, FiDollarSign, FiCheckCircle } from 'react-icons/fi';

const PatientBilling = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await patientAPI.getBillingHistory();
      console.log('Billing response:', response);
      setBills(response.data.data || response.data || []);
    } catch (error) {
      console.error('Billing fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch billing history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'partial':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-red-50 text-red-700 border border-red-200';
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Sidebar role="patient" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-blue-900 dark:text-white mb-2">
                Billing & Payments
              </h1>
              <p className="text-blue-600 dark:text-blue-400">
                View your bills and payment history
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : bills.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 p-12 text-center">
                <FiFileText className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No billing records
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  You don't have any bills yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bills.map((bill) => (
                  <div key={bill._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <FiDollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Invoice #{bill.invoiceNumber || bill.billId || bill._id.slice(-6)}
                            </h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {new Date(bill.createdAt).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-xs font-semibold ${getStatusColor(bill.paymentStatus)}`}>
                          {bill.paymentStatus?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                          <span className="font-bold text-gray-900 dark:text-white text-lg">
                            ₹{bill.totalAmount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">Paid Amount</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ₹{bill.paidAmount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">Balance Due</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            ₹{((bill.totalAmount || 0) - (bill.paidAmount || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {bill.items && bill.items.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bill Items</h4>
                          <div className="space-y-2">
                            {bill.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                <span className="text-gray-700 dark:text-gray-300">
                                  {item.description || item.itemType}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  ₹{item.amount?.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {bill.paymentStatus !== 'paid' && (
                        <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
                          <FiDollarSign className="w-5 h-5" />
                          Pay Now
                        </button>
                      )}
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

export default PatientBilling;
