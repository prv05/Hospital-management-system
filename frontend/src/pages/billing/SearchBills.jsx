import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { FiSearch } from 'react-icons/fi';
import { billingAPI } from '../../api/services';
import toast from 'react-hot-toast';

const SearchBills = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const response = await billingAPI.searchBills(searchTerm);
      setBills(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to search bills');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="billing" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Search Bills
          </h1>

          <div className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice number, patient ID, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Search
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500">Searching...</p>
          ) : bills.length === 0 ? (
            <p className="text-gray-500">No bills found. Try searching...</p>
          ) : (
            <div className="space-y-4">
              {bills.map((bill) => (
                <div key={bill._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Invoice #{bill.invoiceNumber}</h3>
                      <p className="text-sm text-gray-500">
                        Patient: {bill.patientId?.firstName} {bill.patientId?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(bill.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      bill.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {bill.paymentStatus}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Amount</p>
                      <p className="font-semibold text-lg">₹{bill.totalAmount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Paid Amount</p>
                      <p className="font-semibold text-lg text-green-600">₹{bill.paidAmount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Balance</p>
                      <p className="font-semibold text-lg text-red-600">
                        ₹{(bill.totalAmount - bill.paidAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      Download PDF
                    </button>
                    {bill.paymentStatus !== 'paid' && (
                      <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
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
    </div>
  );
};

export default SearchBills;
