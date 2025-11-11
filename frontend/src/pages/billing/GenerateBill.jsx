import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { billingAPI } from '../../api/services';
import toast from 'react-hot-toast';

const GenerateBill = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    billType: 'OPD',
    items: [],
    discount: 0,
    insuranceCovered: 0
  });

  const [items, setItems] = useState([
    { description: '', amount: 0, quantity: 1 }
  ]);

  const addItem = () => {
    setItems([...items, { description: '', amount: 0, quantity: 1 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
    const afterDiscount = subtotal - formData.discount;
    const final = afterDiscount - formData.insuranceCovered;
    return { subtotal, afterDiscount, final: Math.max(0, final) };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await billingAPI.generateBill({ ...formData, items });
      toast.success('Bill generated successfully!');
      // Reset form
    } catch (error) {
      toast.error('Failed to generate bill');
    }
  };

  const totals = calculateTotal();

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="billing" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Generate Bill
            </h1>
            <p className="text-sky-600 dark:text-sky-400 mb-8">Create a new billing record for patients</p>

            <div className="max-w-4xl bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Patient ID
                    </label>
                    <input
                      type="text"
                      value={formData.patientId}
                      onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200"
                      placeholder="P001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bill Type
                    </label>
                    <select
                      value={formData.billType}
                      onChange={(e) => setFormData({...formData, billType: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white transition-all duration-200"
                    >
                      <option value="OPD">OPD</option>
                      <option value="IPD">IPD</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Lab">Lab</option>
                    </select>
                  </div>
                </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bill Items
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors duration-200"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="col-span-6 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-sky-500"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value))}
                        className="col-span-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-sky-500"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        className="col-span-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="col-span-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Insurance Covered (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.insuranceCovered}
                    onChange={(e) => setFormData({...formData, insuranceCovered: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">After Discount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{totals.afterDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Insurance:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">-₹{formData.insuranceCovered.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-900 dark:text-white">Total Amount:</span>
                  <span className="text-sky-600 dark:text-sky-400">₹{totals.final.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 font-semibold transition-colors duration-200"
              >
                Generate Bill
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default GenerateBill;
