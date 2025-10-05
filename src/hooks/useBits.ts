import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from './useAnalytics';

export interface Bit {
  id: string;
  user_id: string;
  child_id: string | null;
  text: string;
  photo_url: string | null;
  context: string | null;
  bit_date: string;
  created_at: string;
  updated_at: string;
  children?: {
    id: string;
    name: string;
    color: string;
    photo_url: string | null;
  } | null;
}

interface BitFilters {
  searchText?: string;
  childId?: string;
  dateFrom?: string;
  dateTo?: string;
  hasPhoto?: boolean;
}

const BITS_PER_PAGE = 20;

export const useBits = (filters: BitFilters = {}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['bits', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('bits')
        .select('*, children(id, name, color, photo_url)', { count: 'exact' })
        .order('bit_date', { ascending: false })
        .range(pageParam * BITS_PER_PAGE, (pageParam + 1) * BITS_PER_PAGE - 1);

      if (filters.searchText) {
        query = query.textSearch('text', filters.searchText);
      }
      if (filters.childId) {
        query = query.eq('child_id', filters.childId);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters.hasPhoto !== undefined) {
        if (filters.hasPhoto) {
          query = query.not('photo_url', 'is', null);
        } else {
          query = query.is('photo_url', null);
        }
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        bits: data as Bit[],
        nextPage: data.length === BITS_PER_PAGE ? pageParam + 1 : undefined,
        totalCount: count ?? 0
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0
  });

  const bits = data?.pages.flatMap(page => page.bits) ?? [];

  const createBit = useMutation({
    mutationFn: async ({ text, childId, photo, context, bitDate }: { text: string; childId?: string; photo?: File; context?: string; bitDate?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let photoUrl: string | null = null;

      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('bit-photos')
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('bit-photos')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('bits')
        .insert({
          user_id: user.id,
          text,
          child_id: childId || null,
          photo_url: photoUrl,
          context: context || null,
          bit_date: bitDate || new Date().toISOString().split('T')[0]
        })
        .select('*, children(id, name, color, photo_url)')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bits'] });
      trackEvent('bit_created');
      toast({ title: 'Bit created successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create bit',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateBit = useMutation({
    mutationFn: async ({ id, text, childId, photo, context, bitDate }: { id: string; text: string; childId?: string; photo?: File; context?: string; bitDate?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let photoUrl: string | undefined = undefined;

      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('bit-photos')
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('bit-photos')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      const updateData: any = { text, child_id: childId || null };
      if (photoUrl !== undefined) {
        updateData.photo_url = photoUrl;
      }
      if (context !== undefined) {
        updateData.context = context;
      }
      if (bitDate !== undefined) {
        updateData.bit_date = bitDate;
      }

      const { error } = await supabase
        .from('bits')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bits'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update bit',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteBit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bits')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bits'] });
      trackEvent('bit_deleted');
      toast({ title: 'Bit deleted successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete bit',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    bits,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createBit: createBit.mutate,
    updateBit: updateBit.mutate,
    deleteBit: deleteBit.mutate,
    isCreating: createBit.isPending,
    isUpdating: updateBit.isPending,
    isDeleting: deleteBit.isPending
  };
};
