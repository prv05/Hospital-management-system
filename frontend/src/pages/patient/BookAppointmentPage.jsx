import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { patientAPI } from '../../api/services';
import toast from 'react-hot-toast';

const BookAppointmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    department: '',
    doctor: '',
    appointmentDate: '',
    appointmentTime: '',
    type: 'consultation',
    symptoms: '',
    notes: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (formData.department) {
      fetchDoctors(formData.department);
    } else {
      setDoctors([]);
      setFormData(prev => ({ ...prev, doctor: '' }));
    }
  }, [formData.department]);

  const fetchDepartments = async () => {
    try {
      const response = await patientAPI.getDepartments();
      console.log('Departments response:', response);
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Departments fetch error:', error);
      toast.error('Failed to load departments');
    }
  };

  const fetchDoctors = async (departmentId) => {
    try {
      setLoading(true);
      setDoctors([]);
      console.log('Fetching doctors for department:', departmentId);
      const response = await patientAPI.getDoctors(departmentId);
      console.log('Doctors API response:', response);
      console.log('Doctors data:', response.data);
      const doctorData = response.data.data || [];
      console.log('Processed doctors:', doctorData);
      setDoctors(doctorData);
      
      if (doctorData.length === 0) {
        console.warn('No doctors available in this department');
      } else {
        console.log(`Found ${doctorData.length} doctor(s)`);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to load doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await patientAPI.bookAppointment(formData);
      toast.success('Appointment booked successfully!');
      setFormData({
        department: '',
        doctor: '',
        appointmentDate: '',
        appointmentTime: '',
        type: 'consultation',
        symptoms: '',
        notes: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Sidebar role="patient" />
        <div className="flex-1 ml-64 mt-16">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-blue-900 dark:text-white mb-2">
                Book Appointment
              </h1>
              <p className="text-blue-600 dark:text-blue-400">
                Schedule an appointment with our healthcare professionals
              </p>
            </div>

            <div className="max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-blue-900 dark:text-white mb-2">
                  Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value, doctor: ''})}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 dark:text-white mb-2">
                  Doctor *
                </label>
                <select
                  value={formData.doctor}
                  onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  required
                  disabled={!formData.department || loading}
                >
                  <option value="">
                    {loading ? 'Loading doctors...' : !formData.department ? 'Select department first' : 'Select Doctor'}
                  </option>
                  {!loading && doctors.length > 0 && doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.user?.firstName || ''} {doc.user?.lastName || ''} 
                      {doc.specialization ? ` - ${doc.specialization}` : ''} 
                      {doc.consultationFee ? ` (₹${doc.consultationFee})` : ''}
                    </option>
                  ))}
                  {!loading && formData.department && doctors.length === 0 && (
                    <option value="" disabled>No doctors available</option>
                  )}
                </select>
                {!loading && formData.department && doctors.length === 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                    ⚠️ No doctors are currently available in this department
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 dark:text-white mb-2">
                  Appointment Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-blue-900 dark:text-white mb-2">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-900 dark:text-white mb-2">
                    Time Slot *
                  </label>
                  <select
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                    required
                  >
                    <option value="">Select Time</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 dark:text-white mb-2">
                  Symptoms *
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  placeholder="Describe your symptoms..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 dark:text-white mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  placeholder="Any additional information..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Book Appointment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default BookAppointmentPage;
