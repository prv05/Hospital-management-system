import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiActivity, FiCheckCircle, FiClock, FiDollarSign, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

const LabAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    total: 0,
    completedToday: 0,
    pending: 0,
    revenue: 0,
    byCategory: [],
    byStatus: [],
    byUrgency: [],
    popularTests: [],
    recentTests: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/lab/tests');
      const tests = data.data || [];

      // Calculate today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Total stats
      const total = tests.length;
      const completedToday = tests.filter(t => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return completedDate >= today && completedDate < tomorrow;
      }).length;
      const pending = tests.filter(t => 
        t.status === 'requested' || t.status === 'sample-collected' || t.status === 'in-process'
      ).length;
      const revenue = tests
        .filter(t => t.paymentStatus === 'paid')
        .reduce((sum, t) => sum + (t.cost || 0), 0);

      // Group by category
      const categoryMap = {};
      tests.forEach(t => {
        const cat = t.testCategory || 'Other';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { category: cat, count: 0, revenue: 0 };
        }
        categoryMap[cat].count++;
        if (t.paymentStatus === 'paid') {
          categoryMap[cat].revenue += t.cost || 0;
        }
      });
      const byCategory = Object.values(categoryMap).sort((a, b) => b.count - a.count);

      // Group by status
      const statusMap = {};
      tests.forEach(t => {
        const status = t.status || 'unknown';
        if (!statusMap[status]) {
          statusMap[status] = { status, count: 0 };
        }
        statusMap[status].count++;
      });
      const byStatus = Object.values(statusMap);

      // Group by urgency
      const urgencyMap = {};
      tests.forEach(t => {
        const urgency = t.urgency || 'routine';
        if (!urgencyMap[urgency]) {
          urgencyMap[urgency] = { urgency, count: 0 };
        }
        urgencyMap[urgency].count++;
      });
      const byUrgency = Object.values(urgencyMap);

      // Popular tests (group by test name)
      const testMap = {};
      tests.forEach(t => {
        const name = t.testName || 'Unknown';
        if (!testMap[name]) {
          testMap[name] = { testName: name, count: 0, category: t.testCategory };
        }
        testMap[name].count++;
      });
      const popularTests = Object.values(testMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Recent completed tests
      const recentTests = tests
        .filter(t => t.status === 'completed')
        .sort((a, b) => {
          const dateA = new Date(a.completedAt || a.createdAt);
          const dateB = new Date(b.completedAt || b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 5);

      setAnalytics({
        total,
        completedToday,
        pending,
        revenue,
        byCategory,
        byStatus,
        byUrgency,
        popularTests,
        recentTests
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'in-process': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'sample-collected': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      requested: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      stat: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      urgent: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      routine: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar role="lab" />
        <div className="flex-1 ml-64 mt-16 overflow-x-hidden">
          <div className="p-8 max-w-full">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Lab Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive overview of laboratory operations and performance
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard 
                    title="Total Tests" 
                    value={analytics.total.toString()} 
                    icon={FiActivity} 
                    color="blue" 
                  />
                  <StatCard 
                    title="Completed Today" 
                    value={analytics.completedToday.toString()} 
                    icon={FiCheckCircle} 
                    color="green" 
                  />
                  <StatCard 
                    title="Pending" 
                    value={analytics.pending.toString()} 
                    icon={FiClock} 
                    color="orange" 
                  />
                  <StatCard 
                    title="Total Revenue" 
                    value={`₹${analytics.revenue.toLocaleString()}`} 
                    icon={FiDollarSign} 
                    color="purple" 
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Popular Tests */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center mb-4">
                      <FiTrendingUp className="text-sky-600 dark:text-sky-400 text-xl mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Popular Tests</h2>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {analytics.popularTests.length > 0 ? (
                        analytics.popularTests.map((item, index) => (
                          <div 
                            key={index} 
                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-gray-900 dark:text-white block">
                                {item.testName}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {item.category}
                              </span>
                            </div>
                            <span className="text-sky-600 dark:text-sky-400 font-bold text-lg ml-4">
                              {item.count}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-center py-4">No data available</p>
                      )}
                    </div>
                  </div>

                  {/* Tests by Category */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center mb-4">
                      <FiActivity className="text-purple-600 dark:text-purple-400 text-xl mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tests by Category</h2>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {analytics.byCategory.length > 0 ? (
                        analytics.byCategory.map((item, index) => (
                          <div 
                            key={index} 
                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-gray-900 dark:text-white block">
                                {item.category}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                Revenue: ₹{item.revenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                                {item.count}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400 block">tests</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-center py-4">No data available</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Tests by Status */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center mb-4">
                      <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">By Status</h2>
                    </div>
                    <div className="space-y-3">
                      {analytics.byStatus.length > 0 ? (
                        analytics.byStatus.map((item, index) => (
                          <div 
                            key={index} 
                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(item.status)}`}>
                              {item.status.replace('-', ' ').toUpperCase()}
                            </span>
                            <span className="text-gray-900 dark:text-white font-bold">
                              {item.count}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-center py-4">No data</p>
                      )}
                    </div>
                  </div>

                  {/* Tests by Urgency */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center mb-4">
                      <FiAlertCircle className="text-orange-600 dark:text-orange-400 text-xl mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">By Urgency</h2>
                    </div>
                    <div className="space-y-3">
                      {analytics.byUrgency.length > 0 ? (
                        analytics.byUrgency.map((item, index) => (
                          <div 
                            key={index} 
                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getUrgencyColor(item.urgency)}`}>
                              {item.urgency.toUpperCase()}
                            </span>
                            <span className="text-gray-900 dark:text-white font-bold">
                              {item.count}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-center py-4">No data</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Completed Tests */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center mb-4">
                      <FiCheckCircle className="text-sky-600 dark:text-sky-400 text-xl mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recently Completed</h2>
                    </div>
                    <div className="space-y-3">
                      {analytics.recentTests.length > 0 ? (
                        analytics.recentTests.map((test, index) => (
                          <div 
                            key={index} 
                            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {test.testName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {test.patient?.user ? 
                                `${test.patient.user.firstName} ${test.patient.user.lastName}` : 
                                'N/A'}
                            </p>
                            <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">
                              {test.completedAt 
                                ? new Date(test.completedAt).toLocaleDateString('en-IN', { 
                                    day: '2-digit', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })
                                : test.createdAt 
                                ? new Date(test.createdAt).toLocaleDateString('en-IN', { 
                                    day: '2-digit', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })
                                : 'Date N/A'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-center py-4">No recent tests</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LabAnalytics;
