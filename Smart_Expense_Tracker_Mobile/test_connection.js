// Quick connection test for mobile app
import { testConnection } from './src/services/apiService';

const testBackendConnection = async () => {
  console.log('🔍 Testing backend connection...');
  
  try {
    const isConnected = await testConnection();
    console.log('Connection result:', isConnected);
    
    if (isConnected) {
      console.log('✅ SUCCESS: Mobile app can connect to backend!');
    } else {
      console.log('❌ FAILED: Mobile app cannot connect to backend');
      console.log('Backend might be blocked by firewall');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
};

testBackendConnection();