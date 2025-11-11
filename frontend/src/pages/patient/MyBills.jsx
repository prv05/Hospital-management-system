import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Card from '../../components/Card';
import Table from '../../components/Table';

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, paid

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data } = await api.get('/api/patients/bills');
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
    return bill.paymentStatus === filter;
  });

  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalPaid = filteredBills.reduce((sum, bill) => sum + bill.amountPaid, 0);
  const totalBalance = filteredBills.reduce((sum, bill) => sum + bill.balanceAmount, 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-orange-100 text-orange-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBillTypeColor = (type) => {
    switch (type) {
      case 'OPD':
        return 'bg-blue-100 text-blue-800';
      case 'IPD':
        return 'bg-purple-100 text-purple-800';
      case 'Emergency':
        return 'bg-red-100 text-red-800';
      case 'Lab':
        return 'bg-teal-100 text-teal-800';
      case 'Pharmacy':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewBillDetails = (bill) => {
    setSelectedBill(bill);
    setShowDetails(true);
  };

  const columns = [
    { 
      header: 'Bill ID', 
      accessor: 'billId',
      render: (row) => (
        <button
          onClick={() => viewBillDetails(row)}
          className="text-blue-600 hover:underline font-medium"
        >
          {row.billId}
        </button>
      )
    },
    { 
      header: 'Date', 
      accessor: 'billDate',
      render: (row) => new Date(row.billDate).toLocaleDateString()
    },
    { 
      header: 'Type', 
      accessor: 'billType',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBillTypeColor(row.billType)}`}>
          {row.billType}
        </span>
      )
    },
    { 
      header: 'Total Amount', 
      accessor: 'totalAmount',
      render: (row) => `₹${row.totalAmount.toFixed(2)}`
    },
    { 
      header: 'Paid', 
      accessor: 'amountPaid',
      render: (row) => `₹${row.amountPaid.toFixed(2)}`
    },
    { 
      header: 'Balance', 
      accessor: 'balanceAmount',
      render: (row) => (
        <span className={`font-semibold ${row.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
          ₹{row.balanceAmount.toFixed(2)}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'paymentStatus',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.paymentStatus)}`}>
          {row.paymentStatus.toUpperCase()}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading bills...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">My Bills</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg ${filter === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Paid
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-sm text-gray-600 mb-1">Total Bills Amount</div>
          <div className="text-2xl font-bold text-gray-800">₹{totalAmount.toFixed(2)}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">Amount Paid</div>
          <div className="text-2xl font-bold text-green-600">₹{totalPaid.toFixed(2)}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">Balance Due</div>
          <div className="text-2xl font-bold text-red-600">₹{totalBalance.toFixed(2)}</div>
        </Card>
      </div>

      {/* Bills Table */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Billing History</h2>
        {filteredBills.length > 0 ? (
          <Table columns={columns} data={filteredBills} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No bills found for the selected filter
          </div>
        )}
      </Card>

      {/* Bill Details Modal */}
      {showDetails && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Bill Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Bill Header */}
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-600">Bill ID</p>
                  <p className="font-semibold">{selectedBill.billId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bill Date</p>
                  <p className="font-semibold">{new Date(selectedBill.billDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bill Type</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBillTypeColor(selectedBill.billType)}`}>
                    {selectedBill.billType}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBill.paymentStatus)}`}>
                    {selectedBill.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedBill.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × ₹{item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="font-semibold">₹{item.totalPrice.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{selectedBill.subtotal.toFixed(2)}</span>
                </div>
                {selectedBill.discount && selectedBill.discount.amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{selectedBill.discount.amount.toFixed(2)}</span>
                  </div>
                )}
                {selectedBill.tax && (selectedBill.tax.cgst > 0 || selectedBill.tax.sgst > 0 || selectedBill.tax.igst > 0) && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹{((selectedBill.tax.cgst || 0) + (selectedBill.tax.sgst || 0) + (selectedBill.tax.igst || 0)).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Amount</span>
                  <span>₹{selectedBill.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid</span>
                  <span>₹{selectedBill.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Balance Due</span>
                  <span>₹{selectedBill.balanceAmount.toFixed(2)}</span>
                </div>
              </div>

              {selectedBill.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-gray-800">{selectedBill.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBills;
