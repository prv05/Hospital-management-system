import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaFileInvoiceDollar, FaCheckCircle, FaExclamationTriangle, FaClock, FaEye, FaDownload, FaCreditCard } from 'react-icons/fa';

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data } = await api.get('/patients/bills');
      setBills(data.data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(bill => {
    if (filter === 'all') return true;
    if (filter === 'paid') return bill.paymentStatus === 'paid';
    if (filter === 'pending') return bill.paymentStatus === 'pending';
    if (filter === 'overdue') {
      return bill.paymentStatus === 'pending' && bill.dueDate && new Date(bill.dueDate) < new Date();
    }
    return true;
  });

  const totalAmount = bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
  const amountPaid = bills.reduce((sum, bill) => sum + (bill.amountPaid || 0), 0);
  const balanceDue = bills.reduce((sum, bill) => sum + (bill.balanceAmount || 0), 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'partial':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const viewBillDetails = (bill) => {
    setSelectedBill(bill);
    setShowDetails(true);
  };

  const isOverdue = (bill) => {
    return bill.paymentStatus === 'pending' && bill.dueDate && new Date(bill.dueDate) < new Date();
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white dark:text-white mb-2">My Bills</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400">View and manage your medical billing history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="bg-primary-100 p-4 rounded-lg">
                <FaFileInvoiceDollar className="text-primary-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(amountPaid)}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Balance Due</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(balanceDue)}</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              All Bills
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'paid'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'overdue'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              Overdue
            </button>
          </div>
        </div>

        {/* Bills List */}
        {filteredBills.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <FaFileInvoiceDollar className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Bills Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? 'You have no billing records yet.'
                : `You have no ${filter} bills.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBills.map((bill) => (
              <div
                key={bill._id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border transition-all duration-200 ${
                  isOverdue(bill) 
                    ? 'border-red-300 hover:border-red-400' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Bill #{bill.billNumber || bill.billId || 'N/A'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(isOverdue(bill) ? 'overdue' : bill.paymentStatus)}`}>
                        {isOverdue(bill) ? 'OVERDUE' : bill.paymentStatus?.toUpperCase()}
                      </span>
                      {isOverdue(bill) && (
                        <FaExclamationTriangle className="text-red-500" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Bill Date</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{formatDate(bill.billDate || bill.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{formatCurrency(bill.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                        <p className="text-sm font-medium text-green-600">{formatCurrency(bill.amountPaid || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Balance</p>
                        <p className={`text-sm font-bold ${bill.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(bill.balanceAmount || 0)}
                        </p>
                      </div>
                    </div>

                    {bill.dueDate && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-500">
                          Due Date: {formatDate(bill.dueDate)}
                          {isOverdue(bill) && <span className="text-red-600 font-medium ml-2">(Overdue)</span>}
                        </p>
                      </div>
                    )}

                    {bill.description && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-1">Description:</p>
                        <p className="text-sm text-gray-700">{bill.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => viewBillDetails(bill)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <FaEye />
                      View Details
                    </button>
                    {bill.paymentStatus !== 'paid' && (
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <FaCreditCard />
                        Pay Now
                      </button>
                    )}
                    <button
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <FaDownload />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Details Modal */}
      {showDetails && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Bill Details</h2>
                  <p className="text-primary-100">Bill #{selectedBill.billNumber || selectedBill.billId || 'N/A'}</p>
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
              {/* Bill Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Bill Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedBill.paymentStatus)}`}>
                      {selectedBill.paymentStatus?.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Bill Date</p>
                    <p className="font-medium text-gray-800 dark:text-white">{formatDate(selectedBill.billDate || selectedBill.createdAt)}</p>
                  </div>
                  {selectedBill.dueDate && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Due Date</p>
                      <p className="font-medium text-gray-800 dark:text-white">{formatDate(selectedBill.dueDate)}</p>
                    </div>
                  )}
                  {selectedBill.patientId && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Patient ID</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedBill.patientId.patientId || 'N/A'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Itemized Charges */}
              {selectedBill.items && selectedBill.items.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Itemized Charges</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-primary-600 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left">Description</th>
                          <th className="px-4 py-3 text-center">Quantity</th>
                          <th className="px-4 py-3 text-right">Unit Price</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.items.map((item, index) => (
                          <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="px-4 py-3 text-gray-800 dark:text-white">{item.description || item.itemName}</td>
                            <td className="px-4 py-3 text-center text-gray-800 dark:text-white">{item.quantity || 1}</td>
                            <td className="px-4 py-3 text-right text-gray-800 dark:text-white">{formatCurrency(item.unitPrice || item.price)}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-white">
                              {formatCurrency((item.quantity || 1) * (item.unitPrice || item.price))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bill Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Bill Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(selectedBill.subtotal || selectedBill.totalAmount)}</span>
                  </div>
                  {selectedBill.cgst && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">CGST ({selectedBill.cgstPercentage || 9}%)</span>
                      <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(selectedBill.cgst)}</span>
                    </div>
                  )}
                  {selectedBill.sgst && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">SGST ({selectedBill.sgstPercentage || 9}%)</span>
                      <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(selectedBill.sgst)}</span>
                    </div>
                  )}
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">- {formatCurrency(selectedBill.discount)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800 dark:text-white">Total Amount</span>
                    <span className="text-xl font-bold text-primary-600">{formatCurrency(selectedBill.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Amount Paid</span>
                    <span className="font-medium text-green-600">{formatCurrency(selectedBill.amountPaid || 0)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800 dark:text-white">Balance Due</span>
                    <span className={`text-xl font-bold ${selectedBill.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(selectedBill.balanceAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {selectedBill.paymentHistory && selectedBill.paymentHistory.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Payment History</h3>
                  <div className="space-y-2">
                    {selectedBill.paymentHistory.map((payment, index) => (
                      <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(payment.date)} • {payment.method} • {payment.transactionId}
                            </p>
                          </div>
                          <FaCheckCircle className="text-green-600 text-xl" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedBill.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Notes</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-gray-700">{selectedBill.notes}</p>
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
                {selectedBill.paymentStatus !== 'paid' && (
                  <button
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FaCreditCard />
                    Pay {formatCurrency(selectedBill.balanceAmount)}
                  </button>
                )}
                <button
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FaDownload />
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBills;
