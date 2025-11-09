import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Environment Variables Check:\n');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('\nMONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length);
console.log('\nMONGODB_URI (first 30 chars):', process.env.MONGODB_URI?.substring(0, 30));
console.log('MONGODB_URI (last 30 chars):', process.env.MONGODB_URI?.substring(process.env.MONGODB_URI.length - 30));

// Check for common issues
const uri = process.env.MONGODB_URI;
if (uri) {
  console.log('\n✅ Checks:');
  console.log('- Starts with mongodb+srv://', uri.startsWith('mongodb+srv://'));
  console.log('- Contains @', uri.includes('@'));
  console.log('- Contains /', uri.includes('/'));
  console.log('- No spaces', !uri.includes(' '));
  console.log('- No line breaks', !uri.includes('\n') && !uri.includes('\r'));
  
  // Extract components
  try {
    const url = new URL(uri.replace('mongodb+srv://', 'https://'));
    console.log('\n📋 Connection Details:');
    console.log('- Host:', url.hostname);
    console.log('- Username:', url.username);
    console.log('- Database:', uri.split('/').pop()?.split('?')[0]);
  } catch (e) {
    console.log('\n❌ URI parsing error:', e.message);
  }
}
