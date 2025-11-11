import mongoose from 'mongoose';
import Billing from './models/Billing.js';

const MONGODB_URI = 'mongodb+srv://romevernekar_db_user:VlSdY0rYQOEYUSra@hms.x7ljtzw.mongodb.net/hospital_management?retryWrites=true&w=majority&appName=HMS';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas\n');
    
    const totalCount = await Billing.countDocuments();
    console.log(`📊 Total bills in database: ${totalCount}\n`);
    
    const revenueByType = await Billing.aggregate([
      {
        $group: {
          _id: '$billType',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
    
    console.log('💰 Revenue by Bill Type:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    revenueByType.forEach(item => {
      console.log(`${item._id}: ₹${item.totalRevenue.toFixed(2)} (${item.count} bills)`);
    });
    
    const totalRevenue = revenueByType.reduce((sum, item) => sum + item.totalRevenue, 0);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`TOTAL: ₹${totalRevenue.toFixed(2)} (${totalCount} bills)\n`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
