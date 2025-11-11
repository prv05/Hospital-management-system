import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import Table from '../../components/Table';
import { FiPackage, FiAlertCircle, FiTrendingDown, FiDollarSign } from 'react-icons/fi';

const PharmacyDashboard = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    expiringSoon: 0,
    revenue: 0
  });
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Only fetch medicines since prescriptions endpoint doesn't exist
      const medicinesRes = await api.get('/pharmacy/medicines');
      const allMedicines = medicinesRes.data.data || [];

      setMedicines(allMedicines);
      setPrescriptions([]); // No prescriptions endpoint available

      const lowStock = allMedicines.filter(m => m.stock?.quantity <= m.stock?.reorderLevel).length;
      const expiringSoon = allMedicines.filter(m => {
        const expiryDate = new Date(m.expiryDate);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        return expiryDate <= threeMonthsFromNow;
      }).length;

      setStats({
        totalMedicines: allMedicines.length,
        lowStock,
        expiringSoon,
        revenue: 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch pharmacy data');
    } finally {
      setLoading(false);
    }
  };

  const medicineColumns = [
    { header: 'Medicine Name', accessor: 'name', render: (row) => <span className="font-medium text-sky-600 dark:text-sky-400">{row.name}</span> },
    { header: 'Generic', accessor: 'genericName' },
    { header: 'Category', accessor: 'category' },
    { header: 'Stock', accessor: 'stock', render: (row) => {
      const qty = row.stock?.quantity || 0;
      const reorder = row.stock?.reorderLevel || 50;
      return <span className={qty <= reorder ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-white'}>{qty}</span>;
    }},
    { header: 'Price', accessor: 'price', render: (row) => `₹${row.price?.sellingPrice?.toFixed(2) || 0}` },
    { header: 'Expiry', accessor: 'expiryDate', render: (row) => {
      const expiryDate = new Date(row.expiryDate);
      const isExpiring = expiryDate <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      return <span className={isExpiring ? 'text-orange-600 dark:text-orange-400 font-semibold' : 'text-gray-900 dark:text-white'}>{expiryDate.toLocaleDateString()}</span>;
    }}
  ];

  const prescriptionColumns = [
    { header: 'Prescription ID', accessor: 'prescriptionId', render: (row) => <span className="font-medium text-sky-600 dark:text-sky-400">{row.prescriptionId}</span> },
    { header: 'Patient', accessor: 'patient', render: (row) => row.patient?.user ? `${row.patient.user.firstName} ${row.patient.user.lastName}` : 'N/A' },
    { header: 'Doctor', accessor: 'doctor', render: (row) => row.doctor?.user ? `Dr. ${row.doctor.user.firstName} ${row.doctor.user.lastName}` : 'N/A' },
    { header: 'Medicines', accessor: 'medicines', render: (row) => row.medicines?.length || 0 },
    { header: 'Status', accessor: 'status', render: (row) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>{row.status?.toUpperCase()}</span> },
    { header: 'Date', accessor: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString() }
  ];

  const lowStockMedicines = medicines.filter(m => m.stock?.quantity <= m.stock?.reorderLevel).slice(0, 10);
  const expiringMedicines = medicines.filter(m => {
    const expiryDate = new Date(m.expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow;
  }).slice(0, 10);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar role="pharmacy" />
        <div className="flex-1 ml-64 mt-16 overflow-x-hidden">
          <div className="p-8 max-w-full">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pharmacy Dashboard</h1>
            <p className="text-sky-600 dark:text-sky-400 mb-8">Manage medicines and inventory</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Medicines" value={stats.totalMedicines} icon={FiPackage} color="blue" />
              <StatCard title="Low Stock" value={stats.lowStock} icon={FiAlertCircle} color="red" />
              <StatCard title="Expiring Soon" value={stats.expiringSoon} icon={FiTrendingDown} color="orange" />
              <StatCard title="Today Revenue" value={`₹${stats.revenue.toFixed(2)}`} icon={FiDollarSign} color="green" />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            ) : (
              <div className="space-y-6 overflow-hidden">
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Low Stock Medicines ({lowStockMedicines.length})</h2>
                    <button onClick={() => toast.info('Navigate to inventory management')} className="text-sky-600 dark:text-sky-400 hover:underline text-sm font-medium">
                      View All →
                    </button>
                  </div>
                  <div className="overflow-x-auto -mx-6 px-6">
                    {lowStockMedicines.length > 0 ? <Table columns={medicineColumns} data={lowStockMedicines} /> : <p className="text-gray-600 dark:text-gray-400 text-center py-8">No low stock medicines</p>}
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-orange-600 dark:text-orange-400">Expiring Soon ({expiringMedicines.length})</h2>
                    <button onClick={() => toast.info('Navigate to inventory management')} className="text-sky-600 dark:text-sky-400 hover:underline text-sm font-medium">
                      View All →
                    </button>
                  </div>
                  <div className="overflow-x-auto -mx-6 px-6">
                    {expiringMedicines.length > 0 ? <Table columns={medicineColumns} data={expiringMedicines} /> : <p className="text-gray-600 dark:text-gray-400 text-center py-8">No expiring medicines</p>}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PharmacyDashboard;
