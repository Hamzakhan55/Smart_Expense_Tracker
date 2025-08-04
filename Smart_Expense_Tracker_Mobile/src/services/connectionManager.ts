import AsyncStorage from '@react-native-async-storage/async-storage';

class ConnectionManager {
  private baseURLs = [
    'http://192.168.1.20:8000', // Current IP
    'http://192.168.1.25:8000', // Previous IP
    'http://192.168.1.1:8000',  // Router IP
    'http://10.0.2.2:8000',     // Android emulator
    'http://localhost:8000',
    'http://127.0.0.1:8000'
  ];
  
  private currentURL: string | null = null;
  private isConnected = false;

  async findWorkingURL(): Promise<string | null> {
    console.log('🔍 Testing backend connections...');
    
    for (const url of this.baseURLs) {
      try {
        console.log(`Testing: ${url}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${url}/health`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'healthy') {
            console.log(`✅ Connected to: ${url}`);
            this.currentURL = url;
            this.isConnected = true;
            await AsyncStorage.setItem('backend_url', url);
            return url;
          }
        }
      } catch (error) {
        console.log(`❌ Failed: ${url}`);
      }
    }
    
    console.log('🚫 No backend connection found');
    this.isConnected = false;
    return null;
  }

  async getBackendURL(): Promise<string> {
    if (this.currentURL && this.isConnected) {
      return this.currentURL;
    }

    // Try cached URL first
    const cachedURL = await AsyncStorage.getItem('backend_url');
    if (cachedURL) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(`${cachedURL}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) {
          this.currentURL = cachedURL;
          this.isConnected = true;
          return cachedURL;
        }
      } catch {}
    }

    // Find new working URL
    const workingURL = await this.findWorkingURL();
    return workingURL || 'http://192.168.1.20:8000'; // fallback to current IP
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async testConnection(): Promise<boolean> {
    const url = await this.getBackendURL();
    try {
      const response = await fetch(`${url}/health`, { timeout: 3000 });
      this.isConnected = response.ok;
      return this.isConnected;
    } catch {
      this.isConnected = false;
      return false;
    }
  }
}

export const connectionManager = new ConnectionManager();