import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Card from '../../components/Card';
import Table from '../../components/Table';

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await api.get('/api/patients/prescriptions');
      setPrescriptions(data.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (filter === 'all') return true;
    return prescription.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewPrescriptionDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetails(true);
  };

  const columns = [
    { 
      header: 'Prescription ID', 
      accessor: 'prescriptionId',
      render: (row) => (
        <button
          onClick={() => viewPrescriptionDetails(row)}
          className="text-blue-600 hover:underline font-medium"
        >
          {row.prescriptionId}
        </button>
      )
    },
    { 
      header: 'Doctor', 
      accessor: 'doctor',
      render: (row) => row.doctor ? `Dr. ${row.doctor.user?.firstName || ''} ${row.doctor.user?.lastName || ''}` : 'N/A'
    },
    { 
      header: 'Date', 
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    { 
      header: 'Medicines', 
      accessor: 'medicines',
      render: (row) => row.medicines?.length || 0
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {row.status.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => viewPrescriptionDetails(row)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          View Details
        </button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading prescriptions...</div>
      </div>
    );
  }

  const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;
  const completedPrescriptions = prescriptions.filter(p => p.status === 'completed').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">My Prescriptions</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-sm text-gray-600 mb-1">Total Prescriptions</div>
          <div className="text-2xl font-bold text-gray-800">{prescriptions.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-green-600">{activePrescriptions}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-2xl font-bold text-blue-600">{completedPrescriptions}</div>
        </Card>
      </div>

      {/* Prescriptions Table */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Prescription History</h2>
        {filteredPrescriptions.length > 0 ? (
          <Table columns={columns} data={filteredPrescriptions} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No prescriptions found for the selected filter
          </div>
        )}
      </Card>

      {/* Prescription Details Modal */}
      {showDetails && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Prescription Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Prescription Header */}
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-600">Prescription ID</p>
                  <p className="font-semibold">{selectedPrescription.prescriptionId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-semibold">
                    Dr. {selectedPrescription.doctor?.user?.firstName || ''} {selectedPrescription.doctor?.user?.lastName || ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPrescription.status)}`}>
                    {selectedPrescription.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Diagnosis */}
              {selectedPrescription.diagnosis && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Diagnosis</p>
                  <p className="font-semibold text-gray-800">{selectedPrescription.diagnosis}</p>
                </div>
              )}

              {/* Medicines */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Prescribed Medicines</h3>
                {selectedPrescription.medicines && selectedPrescription.medicines.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPrescription.medicines.map((med, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{med.medicineName}</h4>
                            {med.medicineId && (
                              <p className="text-sm text-gray-600">Medicine ID: {med.medicineId}</p>
                            )}
                          </div>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {med.dosage}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Frequency:</span>
                            <span className="ml-2 font-medium">{med.frequency}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <span className="ml-2 font-medium">{med.duration}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Quantity:</span>
                            <span className="ml-2 font-medium">{med.quantity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Timing:</span>
                            <span className="ml-2 font-medium">{med.timing || 'As directed'}</span>
                          </div>
                        </div>
                        {med.instructions && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-sm text-gray-600">Instructions:</p>
                            <p className="text-sm text-gray-800">{med.instructions}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No medicines prescribed</p>
                )}
              </div>

              {/* Instructions */}
              {selectedPrescription.instructions && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">General Instructions</p>
                  <p className="text-gray-800">{selectedPrescription.instructions}</p>
                </div>
              )}

              {/* Follow-up */}
              {selectedPrescription.followUpDate && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Follow-up Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedPrescription.followUpDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => toast.success('Download feature coming soon!')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Download Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPrescriptions;
