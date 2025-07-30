'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGoals, createGoal, updateGoalProgress, deleteGoal } from '@/services/apiService';

export const useGoals = () => {
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: getGoals,
  });

  const createMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateGoalProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  return {
    goals,
    isLoading,
    createGoal: createMutation.mutate,
    updateGoal: updateMutation.mutate,
    deleteGoal: deleteMutation.mutate,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
};