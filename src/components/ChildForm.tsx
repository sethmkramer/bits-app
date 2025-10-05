import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import type { Child } from '@/hooks/useChildren';

const CHILD_COLORS = [
  { name: 'Electric Blue', value: 'hsl(211, 100%, 50%)' },
  { name: 'Cyan', value: 'hsl(195, 100%, 45%)' },
  { name: 'Royal Blue', value: 'hsl(230, 85%, 55%)' },
  { name: 'Teal', value: 'hsl(180, 90%, 40%)' },
  { name: 'Sky Blue', value: 'hsl(200, 95%, 48%)' },
  { name: 'Deep Blue', value: 'hsl(220, 80%, 52%)' },
];

const childSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  birthdate: z.string().refine((date) => {
    const d = new Date(date);
    return d < new Date() && d > new Date('1900-01-01');
  }, 'Please enter a valid birthdate'),
  color: z.string().min(1, 'Please select a color'),
});

interface ChildFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; birthdate: string; color: string }) => void;
  child?: Child;
  isLoading?: boolean;
}

export const ChildForm = ({ open, onOpenChange, onSubmit, child, isLoading }: ChildFormProps) => {
  const [name, setName] = useState(child?.name ?? '');
  const [birthdate, setBirthdate] = useState(child?.birthdate ?? '');
  const [color, setColor] = useState(child?.color ?? CHILD_COLORS[0].value);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = childSchema.safeParse({ name, birthdate, color });
    if (!result.success) {
      toast({
        title: 'Validation error',
        description: result.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }

    onSubmit({ name, birthdate, color });
    onOpenChange(false);
    setName('');
    setBirthdate('');
    setColor(CHILD_COLORS[0].value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{child ? 'Edit Child' : 'Add Child'}</DialogTitle>
          <DialogDescription>
            {child ? 'Update your child\'s information' : 'Add a child to start capturing moments'}
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
          <div className="space-y-2">
            <Label>Color *</Label>
            <div className="grid grid-cols-6 gap-3">
              {CHILD_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className="relative h-12 w-12 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: colorOption.value,
                    boxShadow: color === colorOption.value ? `0 0 0 3px white, 0 0 0 5px ${colorOption.value}` : 'none'
                  }}
                  disabled={isLoading}
                  title={colorOption.name}
                >
                  {color === colorOption.value && (
                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-24"
            >
              {isLoading ? 'Saving...' : (child ? 'Update' : 'Add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
