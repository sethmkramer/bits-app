import { useState, useRef, useEffect } from 'react';
import { ImageCropper } from './ImageCropper';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, X } from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import type { Child } from '@/hooks/useChildren';

const CHILD_COLORS = [
  { name: 'Electric Blue', value: 'hsl(211, 100%, 50%)' },
  { name: 'Pink', value: 'hsl(330, 85%, 55%)' },
  { name: 'Purple', value: 'hsl(270, 70%, 55%)' },
  { name: 'Orange', value: 'hsl(25, 95%, 53%)' },
  { name: 'Green', value: 'hsl(145, 65%, 45%)' },
];

const childSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  birthdate: z.string().refine((date) => {
    const d = new Date(date);
    return d < new Date() && d > new Date('1900-01-01');
  }, 'Please enter a valid birthdate'),
  color: z.string().min(1, 'Please select a color'),
  photo: z.instanceof(File).optional().refine((file) => {
    if (!file) return true;
    const validTypes = ['image/jpeg', 'image/png'];
    return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024;
  }, 'Photo must be JPEG or PNG and under 5MB')
});

interface ChildFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; birthdate: string; color: string; photo?: File }) => void;
  child?: Child;
  isLoading?: boolean;
}

export const ChildForm = ({ open, onOpenChange, onSubmit, child, isLoading }: ChildFormProps) => {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [color, setColor] = useState(CHILD_COLORS[0].value);
  const [photo, setPhoto] = useState<File | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [tempPhotoForCrop, setTempPhotoForCrop] = useState<string | undefined>();
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Update form when child prop changes
  useEffect(() => {
    if (child) {
      setName(child.name);
      setBirthdate(child.birthdate);
      setColor(child.color);
      setPhotoPreview(child.photo_url || undefined);
      setPhoto(undefined);
    } else {
      setName('');
      setBirthdate('');
      setColor(CHILD_COLORS[0].value);
      setPhoto(undefined);
      setPhotoPreview(undefined);
    }
  }, [child, open]);


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPhotoForCrop(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    setPhoto(croppedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(croppedFile);
  };

  const removePhoto = () => {
    setPhoto(undefined);
    setPhotoPreview(child?.photo_url || undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = childSchema.safeParse({ name, birthdate, color, photo });
    if (!result.success) {
      toast({
        title: 'Validation error',
        description: result.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }

    onSubmit({ name, birthdate, color, photo });
    onOpenChange(false);
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
            <Label>Photo (optional)</Label>
            {photoPreview ? (
              <div className="relative w-32 h-32 mx-auto">
                <img
                  src={photoPreview}
                  alt="Child photo"
                  className="w-full h-full object-cover rounded-full border-4"
                  style={{ borderColor: color }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                  onClick={removePhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-32 h-32 rounded-full mx-auto flex flex-col items-center justify-center gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Camera className="h-8 w-8" />
                <span className="text-xs">Add Photo</span>
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground text-center">
              Upload a photo or use initials
            </p>
          </div>
          <div className="space-y-2">
            <Label>Color *</Label>
            <div className="grid grid-cols-5 gap-3">
              {CHILD_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className="relative h-14 w-full rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
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
      
      {tempPhotoForCrop && (
        <ImageCropper
          image={tempPhotoForCrop}
          open={isCropperOpen}
          onClose={() => {
            setIsCropperOpen(false);
            setTempPhotoForCrop(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
        />
      )}
    </Dialog>
  );
};
