import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FiEdit, FiTrash2, FiPlus, FiPackage, FiDollarSign, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const MedicineInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    manufacturer: '',
    description: '',
    strength: '',
    unit: 'mg',
    packSize: 10,
    price: {
      mrp: 0,
      sellingPrice: 0,
      purchasePrice: 0
    },
    stock: {
      quantity: 0,
      reorderLevel: 50,
      maxStockLevel: 1000
    },
    expiryDate: '',
    batchNumber: '',
    prescriptionRequired: false
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const { data } = await api.get('/pharmacy/medicines');
      setMedicines(data.data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pharmacy/medicines', formData);
      toast.success('Medicine added successfully');
      setShowAddModal(false);
      resetForm();
      fetchMedicines();
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast.error('Failed to add medicine');
    }
  };

  const handleEditMedicine = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/pharmacy/medicines/${selectedMedicine._id}`, formData);
      toast.success('Medicine updated successfully');
      setShowEditModal(false);
      setSelectedMedicine(null);
      resetForm();
      fetchMedicines();
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast.error('Failed to update medicine');
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.delete(`/pharmacy/medicines/${id}`);
        toast.success('Medicine deleted successfully');
        fetchMedicines();
      } catch (error) {
        console.error('Error deleting medicine:', error);
        toast.error('Failed to delete medicine');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      category: '',
      manufacturer: '',
      description: '',
      strength: '',
      unit: 'mg',
      packSize: 10,
      price: {
        mrp: 0,
        sellingPrice: 0,
        purchasePrice: 0
      },
      stock: {
        quantity: 0,
        reorderLevel: 50,
        maxStockLevel: 1000
      },
      expiryDate: '',
      batchNumber: '',
      prescriptionRequired: false
    });
  };

  const openEditModal = (medicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name || '',
      genericName: medicine.genericName || '',
      category: medicine.category || '',
      manufacturer: medicine.manufacturer || '',
      description: medicine.description || '',
      strength: medicine.strength || '',
      unit: medicine.unit || 'mg',
      packSize: medicine.packSize || 10,
      price: {
        mrp: medicine.price?.mrp || 0,
        sellingPrice: medicine.price?.sellingPrice || 0,
        purchasePrice: medicine.price?.purchasePrice || 0
      },
      stock: {
        quantity: medicine.stock?.quantity || 0,
        reorderLevel: medicine.stock?.reorderLevel || 50,
        maxStockLevel: medicine.stock?.maxStockLevel || 1000
      },
      expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : '',
      batchNumber: medicine.batchNumber || '',
      prescriptionRequired: medicine.prescriptionRequired || false
    });
    setShowEditModal(true);
  };

  const filteredMedicines = medicines.filter(med => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      med.name?.toLowerCase().includes(query) ||
      med.genericName?.toLowerCase().includes(query) ||
      med.category?.toLowerCase().includes(query) ||
      med.manufacturer?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar role="pharmacy" />
        <div className="flex-1 ml-64 mt-16 overflow-x-hidden">
          <div className="p-8 max-w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Medicine Inventory
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and track medicine stock
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors duration-200 font-medium"
              >
                <FiPlus className="text-lg" />
                <span>Add Medicine</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by name, generic name, category, or manufacturer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
            </div>

            {/* Results Count */}
            {searchQuery && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Found {filteredMedicines.length} result{filteredMedicines.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Loading medicines...</p>
              </div>
            ) : filteredMedicines.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <FiPackage className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No Results Found' : 'No Medicines Found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? `No medicines match "${searchQuery}"` : 'Click "Add Medicine" to get started'}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Medicine Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Expiry
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredMedicines.map((med) => {
                        const qty = med.stock?.quantity || 0;
                        const reorder = med.stock?.reorderLevel || 50;
                        const expiryDate = new Date(med.expiryDate);
                        const isExpiring = expiryDate <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                        
                        return (
                          <tr key={med._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-sky-100 dark:bg-sky-900 p-2 rounded-lg mr-3">
                                  <FiPackage className="text-sky-600 dark:text-sky-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {med.name}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">{med.genericName}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-500">{med.strength}{med.unit}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                {med.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                                qty <= reorder ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                qty <= reorder * 2 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              }`}>
                                {qty <= reorder && <FiAlertCircle />}
                                {qty} packs
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                ₹{med.price?.sellingPrice?.toFixed(2) || 0}
                              </div>
                              {med.price?.mrp && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  MRP: ₹{med.price.mrp.toFixed(2)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm ${isExpiring ? 'text-orange-600 dark:text-orange-400 font-semibold' : 'text-gray-900 dark:text-white'}`}>
                                {expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              {isExpiring && (
                                <div className="text-xs text-orange-600 dark:text-orange-400">Expiring Soon</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={() => openEditModal(med)}
                                className="text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 mr-4 transition-colors"
                                title="Edit"
                              >
                                <FiEdit className="text-lg" />
                              </button>
                              <button 
                                onClick={() => handleDeleteMedicine(med._id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                                title="Delete"
                              >
                                <FiTrash2 className="text-lg" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Medicine Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-lg flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {showAddModal ? 'Add New Medicine' : 'Edit Medicine'}
              </h2>
            </div>

            <form onSubmit={showAddModal ? handleAddMedicine : handleEditMedicine} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Medicine Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Medicine Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  {/* Generic Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Generic Name
                    </label>
                    <input
                      type="text"
                      value={formData.genericName}
                      onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Drops">Drops</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Manufacturer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Strength */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Strength *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.strength}
                    onChange={(e) => setFormData({...formData, strength: e.target.value})}
                    placeholder="e.g., 500"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit *
                  </label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="g">g</option>
                    <option value="mcg">mcg</option>
                    <option value="IU">IU</option>
                  </select>
                </div>

                {/* Pack Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pack Size *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.packSize}
                    onChange={(e) => setFormData({...formData, packSize: parseInt(e.target.value) || 0})}
                    placeholder="e.g., 10, 20"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Batch Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock.quantity}
                    onChange={(e) => setFormData({...formData, stock: {...formData.stock, quantity: parseInt(e.target.value) || 0}})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Reorder Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    value={formData.stock.reorderLevel}
                    onChange={(e) => setFormData({...formData, stock: {...formData.stock, reorderLevel: parseInt(e.target.value) || 50}})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Max Stock Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Stock Level
                  </label>
                  <input
                    type="number"
                    value={formData.stock.maxStockLevel}
                    onChange={(e) => setFormData({...formData, stock: {...formData.stock, maxStockLevel: parseInt(e.target.value) || 1000}})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* MRP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price.mrp}
                    onChange={(e) => setFormData({...formData, price: {...formData.price, mrp: parseFloat(e.target.value) || 0}})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price.sellingPrice}
                    onChange={(e) => setFormData({...formData, price: {...formData.price, sellingPrice: parseFloat(e.target.value) || 0}})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Purchase Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price.purchasePrice}
                    onChange={(e) => setFormData({...formData, price: {...formData.price, purchasePrice: parseFloat(e.target.value) || 0}})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Requires Prescription */}
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.prescriptionRequired}
                      onChange={(e) => setFormData({...formData, prescriptionRequired: e.target.checked})}
                      className="mr-2 h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Requires Prescription</span>
                  </label>
                </div>
              </div>
              </div>

              <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedMedicine(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors duration-200 font-medium"
                >
                  {showAddModal ? 'Add Medicine' : 'Update Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MedicineInventory;
