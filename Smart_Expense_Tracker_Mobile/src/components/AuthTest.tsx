import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getExpenses, getMonthlySummary, getRunningBalance } from '../services/apiService';

export const AuthTest: React.FC = () => {
  const { login, user, token } = useAuth();
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      await login('demo@example.com', 'demo123');
      Alert.alert('Success', 'Login successful!');
    } catch (error) {
      Alert.alert('Error', 'Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testApiCalls = async () => {
    setLoading(true);
    try {
      const expenses = await getExpenses();
      const currentDate = new Date();
      const summary = await getMonthlySummary(currentDate.getFullYear(), currentDate.getMonth() + 1);
      const balance = await getRunningBalance();
      
      Alert.alert('API Test Success', `
        Expenses: ${expenses.length} items
        Monthly Summary: $${summary.total_expenses}
        Balance: $${balance.total_balance}
      `);
    } catch (error) {
      Alert.alert('API Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentication Test</Text>
      
      <Text style={styles.status}>
        User: {user ? user.email : 'Not logged in'}
      </Text>
      
      <Text style={styles.status}>
        Token: {token ? 'Present' : 'None'}
      </Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={testLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Test Login'}
        </Text>
      </TouchableOpacity>

      {user && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={testApiCalls}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Test API Calls'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});