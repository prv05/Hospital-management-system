import { Link } from 'react-router-dom';
import { FiCalendar, FiHeart, FiActivity, FiAward } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const departments = [
    { name: 'Cardiology', icon: FiHeart, description: 'Expert heart care and treatment' },
    { name: 'Neurology', icon: FiActivity, description: 'Brain and nervous system specialists' },
    { name: 'Orthopedics', icon: FiAward, description: 'Bone and joint care experts' },
    { name: 'Pediatrics', icon: FiCalendar, description: 'Comprehensive child healthcare' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Your Health, Our Priority
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Experience world-class healthcare with our state-of-the-art Hospital Management System. 
              Book appointments, manage health records, and get expert care all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/book-appointment" className="btn-primary text-lg px-8 py-3">
                Book Appointment
              </Link>
              <Link to="/register" className="btn-secondary text-lg px-8 py-3">
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: '24/7 Emergency Care',
                description: 'Round-the-clock emergency services with expert medical staff',
                icon: '🚑',
              },
              {
                title: 'Expert Doctors',
                description: 'Experienced specialists across all medical departments',
                icon: '👨‍⚕️',
              },
              {
                title: 'Modern Facilities',
                description: 'State-of-the-art equipment and comfortable patient rooms',
                icon: '🏥',
              },
            ].map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Our Departments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept, index) => (
              <div
                key={index}
                className="card hover:shadow-xl transition-shadow cursor-pointer"
              >
                <dept.icon className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {dept.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{dept.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients who trust us with their healthcare
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">HealthCare HMS</h3>
              <p className="text-gray-400">
                Your trusted partner in healthcare management and patient care.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/book-appointment" className="hover:text-white">Book Appointment</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>📞 +91 9876543210</li>
                <li>✉️ info@healthcare.com</li>
                <li>📍 Bangalore, Karnataka</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HealthCare HMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
