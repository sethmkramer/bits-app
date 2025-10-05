import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/hooks/useChildren';
import { useBits } from '@/hooks/useBits';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BitForm } from '@/components/BitForm';
import { BitCard } from '@/components/BitCard';
import { BottomNav } from '@/components/BottomNav';
import { TimelineFilters } from '@/components/TimelineFilters';
import { LogOut, Download, Settings, Menu, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Bit } from '@/hooks/useBits';
import { format, parseISO } from 'date-fns';

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { children, isLoading: childrenLoading } = useChildren();
  const [filters, setFilters] = useState({});
  const { bits, fetchNextPage, hasNextPage, isFetchingNextPage, createBit, updateBit, deleteBit, isLoading: bitsLoading, isCreating: bitCreating, isUpdating: bitUpdating } = useBits(filters);
  const { trackEvent } = useAnalytics();
  const { isInstallable, promptInstall } = usePWAInstall();

  const [showBitForm, setShowBitForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingBit, setEditingBit] = useState<Bit | undefined>();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Only show onboarding if:
    // 1. User is logged in
    // 2. Children have finished loading
    // 3. No children exist
    // 4. Haven't seen onboarding before (stored in localStorage)
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    
    if (user && !childrenLoading && children.length === 0 && !hasSeenOnboarding) {
      setShowOnboarding(true);
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  }, [user, children, childrenLoading]);

  useEffect(() => {
    if (user) {
      trackEvent('timeline_viewed');
    }
  }, [user, trackEvent]);

  // Group bits by month
  const bitsByMonth = useMemo(() => {
    const grouped: { [key: string]: Bit[] } = {};
    bits.forEach((bit) => {
      const monthKey = format(parseISO(bit.bit_date || bit.created_at), 'MMMM yyyy');
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(bit);
    });
    return grouped;
  }, [bits]);

  const handleCreateBit = (data: { text: string; childId?: string; photo?: File; context?: string; bitDate?: string }) => {
    if (editingBit) {
      updateBit({ id: editingBit.id, ...data });
      setEditingBit(undefined);
    } else {
      createBit(data);
    }
  };

  const handleEditBit = (bit: Bit) => {
    setEditingBit(bit);
    setShowBitForm(true);
  };

  const handleAddBit = () => {
    if (children.length === 0) {
      setShowOnboarding(true);
    } else {
      setShowBitForm(true);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top header with avatar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-10 flex items-center justify-center">
              <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="20" width="16" height="10" rx="2" fill="hsl(var(--primary))" opacity="0.6" stroke="white" strokeWidth="1.5"/>
                <rect x="7" y="10" width="16" height="10" rx="2" fill="hsl(var(--primary))" opacity="0.8" stroke="white" strokeWidth="1.5"/>
                <rect x="12" y="0" width="16" height="10" rx="2" fill="hsl(var(--primary))" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Bits
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isInstallable && (
              <Button size="icon" variant="ghost" onClick={promptInstall}>
                <Download className="h-5 w-5" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/children')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Children
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {showFilters && (
          <TimelineFilters children={children} onFilterChange={setFilters} />
        )}

        {bitsLoading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : bits.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              No Bits yet. Add your first Bit to start the memory lane.
            </p>
            <Button onClick={handleAddBit} size="lg" className="mt-4">
              Create Your First Bit
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(bitsByMonth).map(([month, monthBits]) => (
              <div key={month} className="space-y-4">
                {/* Month divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-primary/20"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-full">
                      {month}
                    </span>
                  </div>
                </div>

                {/* Bits for this month */}
                <div className="space-y-4">
                  {monthBits.map((bit) => (
                    <BitCard
                      key={bit.id}
                      bit={bit}
                      onEdit={handleEditBit}
                      onDelete={deleteBit}
                    />
                  ))}
                </div>
              </div>
            ))}

            {hasNextPage && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <BottomNav onAddBit={handleAddBit} />

      {/* Forms and dialogs */}
      <BitForm
        open={showBitForm}
        onOpenChange={(open) => {
          setShowBitForm(open);
          if (!open) setEditingBit(undefined);
        }}
        onSubmit={handleCreateBit}
        bit={editingBit}
        children={children}
        isLoading={bitCreating || bitUpdating}
      />

      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to Bits!</DialogTitle>
            <DialogDescription>
              To start capturing moments, you'll need to add a child first.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Button
              className="w-full"
              onClick={() => {
                setShowOnboarding(false);
                navigate('/children');
              }}
            >
              Add Your First Child
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowOnboarding(false)}
            >
              Skip for Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
