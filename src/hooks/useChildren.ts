import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from './useAnalytics';

export interface Child {
  id: string;
  user_id: string;
  name: string;
  birthdate: string;
  color: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useChildren = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  const { data: children = [], isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Child[];
    }
  });

  const createChild = useMutation({
    mutationFn: async ({ name, birthdate, color, photo }: { name: string; birthdate: string; color: string; photo?: File }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let photoUrl: string | null = null;

      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('child-photos')
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('child-photos')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('children')
        .insert({ user_id: user.id, name, birthdate, color, photo_url: photoUrl })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      trackEvent('child_created');
      toast({ title: 'Child added successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add child',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateChild = useMutation({
    mutationFn: async ({ id, name, birthdate, color, photo }: { id: string; name: string; birthdate: string; color: string; photo?: File }) => {
      let photoUrl: string | undefined = undefined;

      if (photo) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const fileExt = photo.name.split('.').pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('child-photos')
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('child-photos')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      const updateData: any = { name, birthdate, color };
      if (photoUrl !== undefined) {
        updateData.photo_url = photoUrl;
      }

      const { error } = await supabase
        .from('children')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      toast({ title: 'Child updated successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update child',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteChild = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['bits'] });
      toast({ title: 'Child removed successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove child',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    children,
    isLoading,
    createChild: createChild.mutate,
    updateChild: updateChild.mutate,
    deleteChild: deleteChild.mutate,
    isCreating: createChild.isPending,
    isUpdating: updateChild.isPending,
    isDeleting: deleteChild.isPending
  };
};
