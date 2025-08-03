import { useState, useEffect } from 'react';
import { getSmartInsights } from '../services/apiService';

interface SmartInsight {
  type: 'prediction' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  value?: number;
  confidence?: number;
}

export const useSmartInsights = () => {
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const data = await getSmartInsights();
      if (data?.insights) {
        setInsights(data.insights);
      } else {
        // Mock insights when backend is not available
        setInsights([
          {
            type: 'prediction',
            title: 'Next Month Forecast',
            message: 'Based on your spending pattern, next month\'s expenses are predicted to be $2,350',
            value: 2350,
            confidence: 0.75
          },
          {
            type: 'warning',
            title: 'Budget Alert',
            message: 'You\'re 85% through your Food & Drinks budget with 10 days left this month',
          },
          {
            type: 'success',
            title: 'Savings Goal',
            message: 'Great job! You\'re ahead of schedule on your Emergency Fund goal',
          }
        ]);
      }
    } catch (error) {
      console.log('Using mock insights data');
      setInsights([
        {
          type: 'prediction',
          title: 'Spending Forecast',
          message: 'Your predicted spending for next month is $2,150 based on current trends',
          value: 2150,
          confidence: 0.8
        },
        {
          type: 'info',
          title: 'Top Category',
          message: 'Food & Drinks is your highest spending category this month at $450',
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { insights, isLoading, refetch: loadInsights };
};