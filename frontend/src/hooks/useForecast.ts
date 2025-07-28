'use client';

import { useQuery } from '@tanstack/react-query';
import { getForecast } from '@/services/apiService';

export const useForecast = () => {
  return useQuery({
    queryKey: ['forecast'],
    queryFn: getForecast,
    staleTime: 1000 * 60 * 60,
  });
};