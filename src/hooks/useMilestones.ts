import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Milestone {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export const useMilestones = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['milestones', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Milestone[];
    },
    enabled: !!user,
  });

  const createMilestone = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('milestones')
        .insert({ user_id: user.id, name: name.trim() })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', user?.id] });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        // Duplicate key error - milestone already exists
        toast({
          title: 'Milestone already exists',
          description: 'This milestone has already been saved.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error creating milestone',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
  });

  return {
    milestones,
    isLoading,
    createMilestone: createMilestone.mutate,
    isCreating: createMilestone.isPending,
  };
};