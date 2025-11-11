import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { FiSearch, FiX } from 'react-icons/fi';
import { billingAPI } from '../../api/services';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const SearchBills = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bills, setBills] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'cash',
    transactionId: '',
    notes: ''
  });

  useEffect(() => {
    fetchAllBills();
  }, []);

  const fetchAllBills = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/billing/search');
      const billsData = data.data || [];
      setBills(billsData);
      setAllBills(billsData);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setBills(allBills);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = allBills.filter(bill => {
      const billId = bill.billId?.toLowerCase() || '';
      const patientName = `${bill.patient?.user?.firstName} ${bill.patient?.user?.lastName}`.toLowerCase();
      const patientId = bill.patient?.patientId?.toLowerCase() || '';
      const billType = bill.billType?.toLowerCase() || '';
      
      return billId.includes(term) || 
             patientName.includes(term) || 
             patientId.includes(term) ||
             billType.includes(term);
    });

    setBills(filtered);
    if (filtered.length === 0) {
      toast.info('No bills found matching your search');
    }
  };

  const handleViewDetails = (bill) => {
    setSelectedBill(bill);
    setShowDetailsModal(true);
  };

  const handleDownloadPDF = async (bill) => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf' });
      
      // Create a simple PDF content
      const pdfContent = generatePDFContent(bill);
      
      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${bill.billId}_Invoice.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully', { id: 'pdf' });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice', { id: 'pdf' });
    }
  };

  const generatePDFContent = (bill) => {
    const patientName = bill.patient?.user ? 
      `${bill.patient.user.firstName} ${bill.patient.user.lastName}` : 
      'N/A';
    
    return `
═══════════════════════════════════════════════════════
              HEALTHCARE HMS - INVOICE
═══════════════════════════════════════════════════════

Invoice Number: ${bill.billId}
Date: ${new Date(bill.billDate || bill.createdAt).toLocaleDateString()}
Bill Type: ${bill.billType}

───────────────────────────────────────────────────────
PATIENT INFORMATION
───────────────────────────────────────────────────────
Name: ${patientName}
Patient ID: ${bill.patient?.patientId || 'N/A'}

───────────────────────────────────────────────────────
BILL DETAILS
───────────────────────────────────────────────────────
${bill.items?.map((item, idx) => 
  `${idx + 1}. ${item.description}
   Quantity: ${item.quantity} × ₹${item.unitPrice.toFixed(2)} = ₹${item.totalPrice.toFixed(2)}`
).join('\n') || 'No items listed'}

───────────────────────────────────────────────────────
Subtotal:                              ₹${bill.subtotal?.toFixed(2) || '0.00'}
Discount:                              ₹${bill.discount?.amount?.toFixed(2) || '0.00'}
Insurance Covered:                     ₹${bill.insuranceCovered?.toFixed(2) || '0.00'}
───────────────────────────────────────────────────────
TOTAL AMOUNT:                          ₹${bill.totalAmount?.toFixed(2) || '0.00'}
Amount Paid:                           ₹${bill.amountPaid?.toFixed(2) || '0.00'}
Balance Due:                           ₹${bill.balanceAmount?.toFixed(2) || '0.00'}
───────────────────────────────────────────────────────

Payment Status: ${bill.paymentStatus?.toUpperCase()}

${bill.paymentHistory?.length > 0 ? `
Payment History:
${bill.paymentHistory.map((payment, idx) => 
  `${idx + 1}. ₹${payment.amount.toFixed(2)} - ${payment.method} - ${new Date(payment.date).toLocaleDateString()}`
).join('\n')}
` : ''}

Thank you for choosing HealthCare HMS
═══════════════════════════════════════════════════════
    `;
  };

  const handleAddPayment = (bill) => {
    setSelectedBill(bill);
    setPaymentData({
      amount: bill.balanceAmount?.toString() || '',
      method: 'cash',
      transactionId: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(paymentData.amount) > selectedBill.balanceAmount) {
      toast.error('Payment amount cannot exceed balance amount');
      return;
    }

    try {
      toast.loading('Processing payment...', { id: 'payment' });
      
      const response = await api.post(`/billing/${selectedBill._id}/payment`, {
        amount: parseFloat(paymentData.amount),
        method: paymentData.method,
        transactionId: paymentData.transactionId || `TXN${Date.now()}`,
        notes: paymentData.notes
      });

      toast.success('Payment added successfully', { id: 'payment' });
      setShowPaymentModal(false);
      fetchAllBills(); // Refresh the list
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to add payment', { id: 'payment' });
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="billing" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Search Bills
            </h1>
            <p className="text-sky-600 dark:text-sky-400 mb-8">View and manage all billing records</p>

            <div className="mb-6 flex gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-3.5 text-sky-600 dark:text-sky-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by invoice number, patient ID, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium transition-colors duration-200"
              >
                Search
              </button>
            </div>

          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading bills...</p>
          ) : bills.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No bills found.</p>
          ) : (
            <div className="space-y-4">
              {bills.map((bill) => (
                <div key={bill._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-400 mb-1">{bill.billId}</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Patient: {bill.patient?.user?.firstName} {bill.patient?.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Date: {new Date(bill.billDate || bill.createdAt).toLocaleDateString()} • Type: <span className="text-sky-600 dark:text-sky-400 font-medium">{bill.billType}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      bill.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {bill.paymentStatus?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                      <p className="font-semibold text-base text-gray-900 dark:text-white">₹{bill.totalAmount?.toFixed(2) || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paid Amount</p>
                      <p className="font-semibold text-base text-green-600 dark:text-green-400">₹{bill.amountPaid?.toFixed(2) || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance</p>
                      <p className="font-semibold text-base text-red-600 dark:text-red-400">
                        ₹{bill.balanceAmount?.toFixed(2) || 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button 
                      onClick={() => handleViewDetails(bill)}
                      className="px-4 py-2 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 transition-colors duration-200"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleDownloadPDF(bill)}
                      className="px-4 py-2 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 transition-colors duration-200"
                    >
                      Download PDF
                    </button>
                    {bill.paymentStatus !== 'paid' && (
                      <button 
                        onClick={() => handleAddPayment(bill)}
                        className="px-4 py-2 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 transition-colors duration-200"
                      >
                        Add Payment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-sky-600 dark:text-sky-400 mb-1">{selectedBill.billId}</h2>
                <p className="text-gray-600 dark:text-gray-400">Bill Details</p>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Name</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedBill.patient?.user?.firstName} {selectedBill.patient?.user?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Patient ID</p>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedBill.patient?.patientId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Bill Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bill Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Bill Type</p>
                    <p className="text-sky-600 dark:text-sky-400 font-medium">{selectedBill.billType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Date</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(selectedBill.billDate || selectedBill.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Status</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      selectedBill.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      selectedBill.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {selectedBill.paymentStatus?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bill Items</h3>
                <div className="space-y-2">
                  {selectedBill.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start border-b border-gray-200 dark:border-gray-600 pb-2">
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium">{item.description}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {item.quantity} × ₹{item.unitPrice?.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-gray-900 dark:text-white font-semibold">₹{item.totalPrice?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">₹{selectedBill.subtotal?.toFixed(2)}</span>
                  </div>
                  {selectedBill.discount?.amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Discount</span>
                      <span className="text-green-600 dark:text-green-400">-₹{selectedBill.discount.amount?.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedBill.insuranceCovered > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Insurance</span>
                      <span className="text-green-600 dark:text-green-400">-₹{selectedBill.insuranceCovered?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span className="text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-sky-600 dark:text-sky-400">₹{selectedBill.totalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Paid</span>
                    <span className="text-green-600 dark:text-green-400">₹{selectedBill.amountPaid?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Balance</span>
                    <span className="text-red-600 dark:text-red-400">₹{selectedBill.balanceAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {selectedBill.paymentHistory?.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Payment History</h3>
                  <div className="space-y-2">
                    {selectedBill.paymentHistory.map((payment, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-200 dark:border-gray-600 pb-2">
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">₹{payment.amount?.toFixed(2)}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {payment.method} • {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{payment.transactionId}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
              <button
                onClick={() => handleDownloadPDF(selectedBill)}
                className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                Download Invoice
              </button>
              {selectedBill.paymentStatus !== 'paid' && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleAddPayment(selectedBill);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-sky-600 dark:text-sky-400 mb-1">Add Payment</h2>
                <p className="text-gray-600 dark:text-gray-400">{selectedBill.billId}</p>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                  <span className="text-gray-900 dark:text-white font-semibold">₹{selectedBill.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Already Paid</span>
                  <span className="text-green-600 dark:text-green-400">₹{selectedBill.amountPaid?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <span className="text-gray-900 dark:text-white">Balance Due</span>
                  <span className="text-red-600 dark:text-red-400">₹{selectedBill.balanceAmount?.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white"
                  placeholder="Enter amount"
                  required
                  max={selectedBill.balanceAmount}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method *
                </label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="net-banking">Net Banking</option>
                  <option value="insurance">Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={paymentData.transactionId}
                  onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Optional notes"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default SearchBills;
