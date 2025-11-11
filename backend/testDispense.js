import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Prescription from './models/Prescription.js';
import Medicine from './models/Medicine.js';
import Billing from './models/Billing.js';
import Patient from './models/Patient.js';
import User from './models/User.js';

dotenv.config();

const testDispense = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a pending prescription
    const prescription = await Prescription.findOne({ isDispensed: false })
      .populate('patient');

    if (!prescription) {
      console.log('❌ No pending prescriptions found');
      process.exit(0);
    }

    console.log('\n📋 Selected Prescription:');
    console.log('ID:', prescription.prescriptionId);
    console.log('Patient:', prescription.patient?.patientId);
    console.log('Medicines:', prescription.medicines.length);

    // Check if medicines exist in inventory
    console.log('\n💊 Checking Medicine Inventory:');
    for (const med of prescription.medicines) {
      const medicine = await Medicine.findOne({
        name: { $regex: new RegExp(med.medicineName, 'i') }
      });

      if (medicine) {
        console.log(`✅ ${med.medicineName} - Stock: ${medicine.stock.quantity}, Price: ₹${medicine.price.sellingPrice}`);
      } else {
        console.log(`❌ ${med.medicineName} - Not found in inventory`);
      }
    }

    // Check billing before
    const billsBefore = await Billing.countDocuments({ 
      patient: prescription.patient._id,
      billType: 'Pharmacy'
    });
    console.log(`\n💰 Pharmacy Bills Before: ${billsBefore}`);

    console.log('\n✅ Test complete. Ready to dispense.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testDispense();
