import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Camera, X, CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { VoiceRecorder } from './VoiceRecorder';
import { ChildForm } from './ChildForm';
import { useChildren } from '@/hooks/useChildren';
import type { Bit } from '@/hooks/useBits';
import type { Child } from '@/hooks/useChildren';

const bitSchema = z.object({
  text: z.string().trim().min(1, 'Text is required').max(5000, 'Text too long (max 5000 characters)'),
  childId: z.string().min(1, 'Please select a child'),
  photo: z.instanceof(File).optional().refine((file) => {
    if (!file) return true;
    const validTypes = ['image/jpeg', 'image/png'];
    return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
  }, 'Photo must be JPEG or PNG and under 10MB')
});

interface BitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { text: string; childId?: string; photo?: File; context?: string; bitDate?: string }) => void;
  bit?: Bit;
  children: Child[];
  isLoading?: boolean;
}

export const BitForm = ({ open, onOpenChange, onSubmit, bit, children, isLoading }: BitFormProps) => {
  const [text, setText] = useState(bit?.text ?? '');
  const [context, setContext] = useState(bit?.context ?? '');
  const [bitDate, setBitDate] = useState<Date>(bit?.bit_date ? new Date(bit.bit_date) : new Date());
  const [childId, setChildId] = useState<string | undefined>(bit?.child_id ?? undefined);
  const [photo, setPhoto] = useState<File | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(bit?.photo_url ?? undefined);
  const [textVoiceStatus, setTextVoiceStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [contextVoiceStatus, setContextVoiceStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [isChildFormOpen, setIsChildFormOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { createChild, isCreating } = useChildren();

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

    const result = bitSchema.safeParse({ text, photo, childId });
    if (!result.success) {
      toast({
        title: 'Validation error',
        description: result.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }

    onSubmit({ 
      text, 
      childId, 
      photo, 
      context: context || undefined,
      bitDate: format(bitDate, 'yyyy-MM-dd')
    });
    onOpenChange(false);
    setText('');
    setContext('');
    setBitDate(new Date());
    setChildId(undefined);
    setPhoto(undefined);
    setPhotoPreview(undefined);
  };

  const handleCreateChild = (data: { name: string; birthdate: string }) => {
    createChild(data, {
      onSuccess: (newChild) => {
        setChildId(newChild.id);
        setIsChildFormOpen(false);
      }
    });
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
            <Label htmlFor="child">Child *</Label>
            <div className="flex gap-2">
              <Select value={childId} onValueChange={setChildId} required>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsChildFormOpen(true)}
                disabled={isLoading}
                title="Add new child"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bitDate">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !bitDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {bitDate ? format(bitDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={bitDate}
                  onSelect={(date) => date && setBitDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="context">Context (optional)</Label>
              <div className="flex items-center gap-2">
                {contextVoiceStatus === 'recording' && (
                  <span className="text-sm text-red-500 animate-pulse">● Listening...</span>
                )}
                {contextVoiceStatus === 'processing' && (
                  <span className="text-sm text-blue-500">Transcribing...</span>
                )}
                <VoiceRecorder 
                  onTranscription={(transcribedText) => setContext(transcribedText)} 
                  onStatusChange={setContextVoiceStatus}
                />
              </div>
            </div>
            <Input
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Where were you? What was happening? (Type or use voice recording)"
              disabled={isLoading || contextVoiceStatus !== 'idle'}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="text">Quote or Memory *</Label>
              <div className="flex items-center gap-2">
                {textVoiceStatus === 'recording' && (
                  <span className="text-sm text-red-500 animate-pulse">● Listening...</span>
                )}
                {textVoiceStatus === 'processing' && (
                  <span className="text-sm text-blue-500">Transcribing...</span>
                )}
                <VoiceRecorder 
                  onTranscription={(transcribedText) => setText(transcribedText)} 
                  onStatusChange={setTextVoiceStatus}
                />
              </div>
            </div>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What did they say or do? (Type or use voice recording)"
              rows={6}
              maxLength={5000}
              required
              disabled={isLoading || textVoiceStatus !== 'idle'}
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
      
      <ChildForm
        open={isChildFormOpen}
        onOpenChange={setIsChildFormOpen}
        onSubmit={handleCreateChild}
        isLoading={isCreating}
      />
    </Dialog>
  );
};
