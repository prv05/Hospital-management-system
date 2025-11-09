import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { pharmacyAPI } from '../../api/services';
import toast from 'react-hot-toast';

const DispenseMedicine = () => {
  const [prescriptionId, setPrescriptionId] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearchPrescription = async () => {
    if (!prescriptionId.trim()) return;
    setLoading(true);
    try {
      const response = await pharmacyAPI.getPrescription(prescriptionId);
      setMedicines(response.data.medicines);
    } catch (error) {
      toast.error('Prescription not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async () => {
    try {
      await pharmacyAPI.dispenseMedicine({ prescriptionId, medicines });
      toast.success('Medicines dispensed successfully!');
      setPrescriptionId('');
      setMedicines([]);
    } catch (error) {
      toast.error('Failed to dispense medicines');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="pharmacy" />
      <div className="flex-1 ml-64 mt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Dispense Medicine
          </h1>

          <div className="max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                placeholder="Enter Prescription ID..."
                value={prescriptionId}
                onChange={(e) => setPrescriptionId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchPrescription()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleSearchPrescription}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Search
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : medicines.length === 0 ? (
              <p className="text-gray-500">Enter prescription ID to view medicines</p>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {medicines.map((med, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {med.medicineId?.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {med.dosage} - {med.frequency}
                          </p>
                          <p className="text-sm text-gray-500">
                            Duration: {med.duration}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">Qty: {med.quantity}</p>
                          <p className="text-sm text-gray-500">
                            ₹{(med.medicineId?.pricePerUnit * med.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span>Total Amount:</span>
                    <span className="text-primary-600">
                      ₹{medicines.reduce((sum, m) => sum + (m.medicineId?.pricePerUnit * m.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleDispense}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold"
                  >
                    Dispense Medicines
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispenseMedicine;
