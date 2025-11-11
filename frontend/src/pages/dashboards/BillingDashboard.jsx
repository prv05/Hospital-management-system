import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import Table from '../../components/Table';
import { FiDollarSign, FiFileText, FiTrendingUp, FiClock } from 'react-icons/fi';

const BillingDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    todayCollection: 0,
    totalBills: 0,
    paidToday: 0,
    pendingCount: 0
  });
  const [recentBills, setRecentBills] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/billing/search');
      const bills = data.data || [];

      const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      const pendingPayments = bills.filter(b => b.paymentStatus !== 'paid')
        .reduce((sum, bill) => sum + bill.balanceAmount, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayBills = bills.filter(b => new Date(b.billDate) >= today);
      const todayCollection = todayBills.reduce((sum, bill) => sum + bill.amountPaid, 0);
      const paidToday = todayBills.filter(b => b.paymentStatus === 'paid').length;
      const pendingCount = bills.filter(b => b.paymentStatus === 'pending').length;

      setStats({
        totalRevenue,
        pendingPayments,
        todayCollection,
        totalBills: bills.length,
        paidToday,
        pendingCount
      });

      setAllBills(bills);
      setRecentBills(bills.slice(0, 10));
      setPendingBills(bills.filter(b => b.paymentStatus === 'pending').slice(0, 10));
      
      console.log('Total bills loaded:', bills.length);
      console.log('OPD Revenue:', bills.filter(b => b.billType === 'OPD').reduce((sum, bill) => sum + bill.totalAmount, 0));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch billing data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const recentBillColumns = [
    { header: 'Bill ID', accessor: 'billId', render: (row) => <span className="font-medium text-sky-600 dark:text-sky-400">{row.billId}</span> },
    { header: 'Patient', accessor: 'patient', render: (row) => row.patient?.user ? `${row.patient.user.firstName} ${row.patient.user.lastName}` : 'N/A' },
    { header: 'Type', accessor: 'billType' },
    { header: 'Amount', accessor: 'totalAmount', render: (row) => `₹${row.totalAmount.toFixed(2)}` },
    { header: 'Status', accessor: 'paymentStatus', render: (row) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.paymentStatus)}`}>
        {row.paymentStatus.toUpperCase()}
      </span>
    )},
    { header: 'Date', accessor: 'billDate', render: (row) => new Date(row.billDate).toLocaleDateString() }
  ];

  const pendingBillColumns = [
    { header: 'Bill ID', accessor: 'billId', render: (row) => <span className="font-medium text-sky-600 dark:text-sky-400">{row.billId}</span> },
    { header: 'Patient', accessor: 'patient', render: (row) => row.patient?.user ? `${row.patient.user.firstName} ${row.patient.user.lastName}` : 'N/A' },
    { header: 'Amount', accessor: 'totalAmount', render: (row) => `₹${row.totalAmount.toFixed(2)}` },
    { header: 'Balance', accessor: 'balanceAmount', render: (row) => <span className="font-semibold text-red-600 dark:text-red-400">₹{row.balanceAmount.toFixed(2)}</span> },
    { header: 'Date', accessor: 'billDate', render: (row) => new Date(row.billDate).toLocaleDateString() },
    { header: 'Actions', accessor: 'actions', render: () => (
      <button onClick={() => navigate('/billing/search')} className="px-3 py-1 bg-sky-600 text-white rounded text-sm hover:bg-sky-700">
        Process
      </button>
    )}
  ];

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="billing" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Billing Dashboard</h1>
                <p className="text-sky-600 dark:text-sky-400">Manage billing and payment records</p>
              </div>
              <button
                onClick={() => navigate('/billing/generate')}
                className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium transition-colors duration-200"
              >
                + Generate Bill
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} icon={FiDollarSign} color="green" />
              <StatCard title="Pending Bills" value={stats.pendingCount} icon={FiFileText} color="red" subtitle={`₹${stats.pendingPayments.toFixed(2)}`} />
              <StatCard title="Today's Collection" value={`₹${stats.todayCollection.toFixed(2)}`} icon={FiTrendingUp} color="blue" subtitle={`${stats.paidToday} bills`} />
              <StatCard title="Total Bills" value={stats.totalBills} icon={FiClock} color="orange" />
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Bills</h2>
                    <button onClick={() => navigate('/billing/search')} className="text-sky-600 dark:text-sky-400 hover:underline text-sm font-medium">
                      View All →
                    </button>
                  </div>
                  {recentBills.length > 0 ? <Table columns={recentBillColumns} data={recentBills} /> : <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent bills</p>}
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Pending Payments</h2>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{pendingBills.length} pending</span>
                  </div>
                  {pendingBills.length > 0 ? <Table columns={pendingBillColumns} data={pendingBills} /> : <p className="text-gray-500 dark:text-gray-400 text-center py-8">No pending bills</p>}
                </Card>
              </div>
            )}

            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Revenue by Bill Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['OPD', 'IPD', 'Emergency', 'Lab', 'Pharmacy'].map(type => {
                  const typeRevenue = allBills.filter(b => b.billType === type).reduce((sum, bill) => sum + bill.totalAmount, 0);
                  return (
                    <div key={type} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{typeRevenue.toFixed(0)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{type}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default BillingDashboard;
