import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Billing from './models/Billing.js';
import Patient from './models/Patient.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const checkBillsByType = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected\n');

    const billTypes = ['OPD', 'IPD', 'Emergency', 'Pharmacy', 'Lab'];
    
    console.log('📊 BILLING SUMMARY BY TYPE:\n');
    console.log('═'.repeat(70));
    
    let grandTotal = 0;
    let grandPending = 0;
    
    for (const type of billTypes) {
      const bills = await Billing.find({ billType: type }).populate('patient');
      const count = bills.length;
      const revenue = bills.reduce((sum, b) => sum + b.totalAmount, 0);
      const pending = bills.reduce((sum, b) => sum + b.balanceAmount, 0);
      const paid = revenue - pending;
      
      grandTotal += revenue;
      grandPending += pending;
      
      console.log(`\n${type.toUpperCase()}`);
      console.log('─'.repeat(70));
      console.log(`  Total Bills:     ${count}`);
      console.log(`  Total Revenue:   ₹${revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
      console.log(`  Paid Amount:     ₹${paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${((paid/revenue)*100).toFixed(1)}%)`);
      console.log(`  Pending Amount:  ₹${pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${((pending/revenue)*100).toFixed(1)}%)`);
      
      if (count > 0) {
        console.log(`\n  Recent Bills:`);
        bills.slice(0, 3).forEach(bill => {
          const patientName = bill.patient?.user ? 
            `${bill.patient.user.firstName} ${bill.patient.user.lastName}` : 
            'Unknown';
          console.log(`    - ${bill.billId}: ${patientName} - ₹${bill.totalAmount.toFixed(2)} (${bill.paymentStatus})`);
        });
      }
    }
    
    console.log('\n' + '═'.repeat(70));
    console.log('\n💰 GRAND TOTAL:');
    console.log(`  Total Revenue:   ₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
    console.log(`  Total Paid:      ₹${(grandTotal - grandPending).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
    console.log(`  Total Pending:   ₹${grandPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
    console.log(`  Collection Rate: ${(((grandTotal - grandPending)/grandTotal)*100).toFixed(1)}%`);
    
    console.log('\n✅ Done!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkBillsByType();
