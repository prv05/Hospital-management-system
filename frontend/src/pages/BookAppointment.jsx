import Navbar from '../components/Navbar';

const BookAppointment = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Book an Appointment
          </h1>
          <div className="card">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Please login as a patient to book an appointment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
