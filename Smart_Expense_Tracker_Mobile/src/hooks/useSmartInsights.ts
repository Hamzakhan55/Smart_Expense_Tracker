import { useState, useEffect } from 'react';
import { getSmartInsights } from '../services/apiService';

interface Insight {
  type: 'prediction' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  confidence?: number;
}

export const useSmartInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
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
        // Mock insights if API fails
        setInsights([
          {
            type: 'info',
            title: 'Spending Analysis',
            message: 'Your spending is within normal range this month.',
          },
          {
            type: 'prediction',
            title: 'Budget Forecast',
            message: 'Based on current trends, you may exceed your monthly budget by 5%.',
            confidence: 0.75,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
      setInsights([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { insights, isLoading, refresh: loadInsights };
};