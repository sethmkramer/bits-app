import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/hooks/useChildren';
import { ChildForm } from '@/components/ChildForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Pencil, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';

export default function Children() {
  const { user } = useAuth();
  const { children, createChild, updateChild, deleteChild, isLoading, isCreating, isUpdating, isDeleting } = useChildren();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<typeof children[0] | undefined>();
  const [deletingChildId, setDeletingChildId] = useState<string | undefined>();

  const calculateAge = (birthdate: string) => {
    return differenceInYears(new Date(), new Date(birthdate));
  };

  const handleEdit = (child: typeof children[0]) => {
    setEditingChild(child);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingChild(undefined);
  };

  const handleSubmit = (data: { name: string; birthdate: string; color: string; photo?: File }) => {
    if (editingChild) {
      updateChild({ id: editingChild.id, ...data });
    } else {
      createChild(data);
    }
    handleFormClose();
  };

  const handleDelete = () => {
    if (deletingChildId) {
      deleteChild(deletingChildId);
      setDeletingChildId(undefined);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Children</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : children.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">
                No children yet. Add your first child to start capturing their special moments.
              </p>
              <Button onClick={() => setIsFormOpen(true)} size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Child
              </Button>
            </div>
          ) : (
            <>
              {children.map((child) => (
                <Card key={child.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <Avatar className="h-14 w-14 border-2" style={{ borderColor: child.color }}>
                    {child.photo_url ? (
                      <img src={child.photo_url} alt={child.name} className="w-full h-full object-cover" />
                    ) : (
                      <AvatarFallback className="font-semibold text-xl text-white" style={{ backgroundColor: child.color }}>
                        {child.name.split(' ').map(n => n.charAt(0)).filter((_, i) => i < 2).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{child.name}</h3>
                    <p className="text-sm font-medium" style={{ color: child.color }}>
                      Age {calculateAge(child.birthdate)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(child)}
                      disabled={isUpdating}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingChildId(child.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}

              <Button
                onClick={() => setIsFormOpen(true)}
                variant="outline"
                size="lg"
                className="w-full mt-4"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Another Child
              </Button>
            </>
          )}
        </div>
      </main>

      <ChildForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        child={editingChild}
        isLoading={isCreating || isUpdating}
      />

      <AlertDialog open={!!deletingChildId} onOpenChange={() => setDeletingChildId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Child?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this child and all their associated Bits. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
