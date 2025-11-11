import mongoose from 'mongoose';
import Appointment from './models/Appointment.js';
import Billing from './models/Billing.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import User from './models/User.js';

const MONGODB_URI = 'mongodb+srv://romevernekar_db_user:VlSdY0rYQOEYUSra@hms.x7ljtzw.mongodb.net/hospital_management?retryWrites=true&w=majority&appName=HMS';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas\n');
    console.log('🔄 Creating bills for existing appointments...\n');
    
    // Find all appointments that don't have bills yet
    const appointments = await Appointment.find()
      .populate('doctor')
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'firstName lastName' }
      });
    
    console.log(`📋 Found ${appointments.length} total appointments\n`);
    
    let created = 0;
    let skipped = 0;
    
    for (const appointment of appointments) {
      // Check if bill already exists
      const existingBill = await Billing.findOne({ appointment: appointment._id });
      
      if (existingBill) {
        skipped++;
        continue;
      }
      
      if (!appointment.doctor || !appointment.patient) {
        console.log(`⏭️  Skipped appointment ${appointment.appointmentId} - missing doctor or patient`);
        skipped++;
        continue;
      }
      
      // Create bill
      const billId = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const consultationFee = appointment.consultationFee || 500;
      
      // Get doctor's user ID for generatedBy
      const doctorUserId = appointment.doctor.user?._id || appointment.doctor.user;
      
      await Billing.create({
        billId,
        patient: appointment.patient._id || appointment.patient,
        billType: 'OPD',
        billDate: appointment.appointmentDate || new Date(),
        appointment: appointment._id,
        items: [{
          itemType: 'consultation',
          description: `Consultation with Dr. ${appointment.doctor.user?.firstName || 'Doctor'} ${appointment.doctor.user?.lastName || ''}`,
          quantity: 1,
          unitPrice: consultationFee,
          totalPrice: consultationFee
        }],
        subtotal: consultationFee,
        totalAmount: consultationFee,
        amountPaid: 0,
        balanceAmount: consultationFee,
        paymentStatus: 'pending',
        generatedBy: doctorUserId
      });
      
      created++;
      console.log(`✅ Created bill for appointment ${appointment.appointmentId}`);
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created} bills`);
    console.log(`   ⏭️  Skipped: ${skipped} (already had bills or invalid)`);
    console.log(`\n🎉 Done! All appointments now have bills.`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
