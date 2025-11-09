import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { patientAPI } from '../../api/services';
import toast from 'react-hot-toast';

const PatientBilling = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await patientAPI.getBillingHistory();
      setBills(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to fetch billing history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="patient" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Billing & Payments
          </h1>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : bills.length === 0 ? (
            <p className="text-gray-500">No billing records found</p>
          ) : (
            <div className="space-y-4">
              {bills.map((bill) => (
                <div key={bill._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Invoice #{bill.invoiceNumber}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(bill.createdAt).toLocaleDateString()}
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
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold">₹{bill.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid Amount:</span>
                      <span className="font-semibold text-green-600">₹{bill.paidAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Balance:</span>
                      <span className="font-semibold text-red-600">
                        ₹{(bill.totalAmount - bill.paidAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {bill.paymentStatus !== 'paid' && (
                    <button className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">
                      Pay Now
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

export default PatientBilling;
