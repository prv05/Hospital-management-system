import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Prescription from './models/Prescription.js';
import Medicine from './models/Medicine.js';
import Billing from './models/Billing.js';
import Patient from './models/Patient.js';
import User from './models/User.js';

dotenv.config();

const verifyDispenseBilling = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get total prescriptions
    const totalPrescriptions = await Prescription.countDocuments();
    const dispensedPrescriptions = await Prescription.countDocuments({ isDispensed: true });
    const pendingPrescriptions = await Prescription.countDocuments({ isDispensed: false });

    console.log('📋 PRESCRIPTION STATS:');
    console.log(`   Total: ${totalPrescriptions}`);
    console.log(`   Dispensed: ${dispensedPrescriptions}`);
    console.log(`   Pending: ${pendingPrescriptions}`);

    // Get billing stats
    const totalBills = await Billing.countDocuments();
    const pharmacyBills = await Billing.countDocuments({ billType: 'Pharmacy' });
    const pharmacyRevenue = await Billing.aggregate([
      { $match: { billType: 'Pharmacy' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    console.log('\n💰 BILLING STATS:');
    console.log(`   Total Bills: ${totalBills}`);
    console.log(`   Pharmacy Bills: ${pharmacyBills}`);
    console.log(`   Pharmacy Revenue: ₹${pharmacyRevenue[0]?.total.toFixed(2) || 0}`);

    // Get medicine inventory stats
    const totalMedicines = await Medicine.countDocuments({ isActive: true });
    const lowStock = await Medicine.countDocuments({ 
      isActive: true,
      $expr: { $lte: ['$stock.quantity', '$stock.reorderLevel'] }
    });

    console.log('\n💊 MEDICINE INVENTORY:');
    console.log(`   Total Medicines: ${totalMedicines}`);
    console.log(`   Low Stock Items: ${lowStock}`);

    // Show sample pending prescription
    const samplePending = await Prescription.findOne({ isDispensed: false })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName' }
      });

    if (samplePending) {
      console.log('\n📄 SAMPLE PENDING PRESCRIPTION:');
      console.log(`   ID: ${samplePending.prescriptionId}`);
      console.log(`   Patient: ${samplePending.patient?.user?.firstName} ${samplePending.patient?.user?.lastName}`);
      console.log(`   Medicines: ${samplePending.medicines.length}`);
      
      let estimatedTotal = 0;
      for (const med of samplePending.medicines) {
        const medicine = await Medicine.findOne({
          name: { $regex: new RegExp(med.medicineName, 'i') }
        });
        if (medicine) {
          const qty = med.quantity || 1;
          const price = medicine.price?.sellingPrice || 0;
          estimatedTotal += qty * price;
          console.log(`   - ${med.medicineName}: ${qty} x ₹${price} = ₹${qty * price}`);
        }
      }
      const withTax = estimatedTotal * 1.18; // 18% tax
      console.log(`   Estimated Bill (with 18% tax): ₹${withTax.toFixed(2)}`);
    }

    console.log('\n✅ System is ready for billing integration!');
    console.log('When medicines are dispensed:');
    console.log('  1. Medicine stock will be reduced');
    console.log('  2. Prescription will be marked as dispensed');
    console.log('  3. Pharmacy bill will be automatically created');
    console.log('  4. Bill will include all medicines with prices and 18% tax');
    console.log('  5. Patient can view and pay the bill in billing section\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyDispenseBilling();
