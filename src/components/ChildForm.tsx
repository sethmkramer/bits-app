import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import type { Child } from '@/hooks/useChildren';

const childSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  birthdate: z.string().refine((date) => {
    const d = new Date(date);
    return d < new Date() && d > new Date('1900-01-01');
  }, 'Please enter a valid birthdate')
});

interface ChildFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; birthdate: string }) => void;
  child?: Child;
  isLoading?: boolean;
}

export const ChildForm = ({ open, onOpenChange, onSubmit, child, isLoading }: ChildFormProps) => {
  const [name, setName] = useState(child?.name ?? '');
  const [birthdate, setBirthdate] = useState(child?.birthdate ?? '');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = childSchema.safeParse({ name, birthdate });
    if (!result.success) {
      toast({
        title: 'Validation error',
        description: result.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }

    onSubmit({ name, birthdate });
    onOpenChange(false);
    setName('');
    setBirthdate('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{child ? 'Edit Child' : 'Add Child'}</DialogTitle>
          <DialogDescription>
            {child ? 'Update your child\'s information' : 'Add a new child to your Bits collection'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter child's name"
              required
              maxLength={100}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthdate">Birthdate *</Label>
            <Input
              id="birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (child ? 'Update' : 'Add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
