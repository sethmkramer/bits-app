import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, X } from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import type { Bit } from '@/hooks/useBits';
import type { Child } from '@/hooks/useChildren';

const bitSchema = z.object({
  text: z.string().trim().min(1, 'Text is required').max(5000, 'Text too long (max 5000 characters)'),
  photo: z.instanceof(File).optional().refine((file) => {
    if (!file) return true;
    const validTypes = ['image/jpeg', 'image/png'];
    return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
  }, 'Photo must be JPEG or PNG and under 10MB')
});

interface BitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { text: string; childId?: string; photo?: File }) => void;
  bit?: Bit;
  children: Child[];
  isLoading?: boolean;
}

export const BitForm = ({ open, onOpenChange, onSubmit, bit, children, isLoading }: BitFormProps) => {
  const [text, setText] = useState(bit?.text ?? '');
  const [childId, setChildId] = useState<string | undefined>(bit?.child_id ?? undefined);
  const [photo, setPhoto] = useState<File | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(bit?.photo_url ?? undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(undefined);
    setPhotoPreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = bitSchema.safeParse({ text, photo });
    if (!result.success) {
      toast({
        title: 'Validation error',
        description: result.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }

    onSubmit({ text, childId, photo });
    onOpenChange(false);
    setText('');
    setChildId(undefined);
    setPhoto(undefined);
    setPhotoPreview(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{bit ? 'Edit Bit' : 'Create New Bit'}</DialogTitle>
          <DialogDescription>
            {bit ? 'Update your memorable moment' : 'Capture a memorable quote or moment from your child'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="child">Child</Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a child (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No child selected</SelectItem>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">Quote or Memory *</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What did they say or do?"
              rows={6}
              maxLength={5000}
              required
              disabled={isLoading}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {text.length} / 5000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removePhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full h-32"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Camera className="mr-2 h-5 w-5" />
                Add Photo
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              JPEG or PNG, max 10MB
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (bit ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
