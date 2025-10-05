import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/hooks/useChildren';
import { useBits } from '@/hooks/useBits';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { ChildForm } from '@/components/ChildForm';
import { BitForm } from '@/components/BitForm';
import { BitCard } from '@/components/BitCard';
import { TimelineFilters } from '@/components/TimelineFilters';
import { Plus, Users, LogOut, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Bit } from '@/hooks/useBits';

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { children, createChild, isLoading: childrenLoading, isCreating } = useChildren();
  const [filters, setFilters] = useState({});
  const { bits, fetchNextPage, hasNextPage, isFetchingNextPage, createBit, updateBit, deleteBit, isLoading: bitsLoading, isCreating: bitCreating, isUpdating: bitUpdating } = useBits(filters);
  const { trackEvent } = useAnalytics();
  const { isInstallable, promptInstall } = usePWAInstall();

  const [showChildForm, setShowChildForm] = useState(false);
  const [showBitForm, setShowBitForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editingBit, setEditingBit] = useState<Bit | undefined>();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && !childrenLoading && children.length === 0) {
      setShowOnboarding(true);
    }
  }, [user, children, childrenLoading]);

  useEffect(() => {
    if (user) {
      trackEvent('timeline_viewed');
    }
  }, [user, trackEvent]);

  const handleCreateChild = (data: { name: string; birthdate: string }) => {
    createChild(data);
  };

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

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Bits</h1>
            <div className="flex items-center gap-2">
              {isInstallable && (
                <Button size="icon" variant="outline" onClick={promptInstall}>
                  <Download className="h-5 w-5" />
                </Button>
              )}
              <Button size="icon" variant="outline" onClick={() => setShowChildForm(true)}>
                <Users className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="outline" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <TimelineFilters children={children} onFilterChange={setFilters} />

        <div className="space-y-4">
          {bitsLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading bits...</p>
          ) : bits.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground">No bits yet. Start capturing moments!</p>
              <Button onClick={() => setShowBitForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Bit
              </Button>
            </div>
          ) : (
            <>
              {bits.map((bit) => (
                <BitCard
                  key={bit.id}
                  bit={bit}
                  onEdit={handleEditBit}
                  onDelete={deleteBit}
                />
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
            </>
          )}
        </div>
      </main>

      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowBitForm(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <ChildForm
        open={showChildForm}
        onOpenChange={setShowChildForm}
        onSubmit={handleCreateChild}
        isLoading={isCreating}
      />

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
              Let's start by adding your first child so you can begin capturing their memorable moments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Button
              className="w-full"
              onClick={() => {
                setShowOnboarding(false);
                setShowChildForm(true);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
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
