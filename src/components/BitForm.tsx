import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Camera, X, CalendarIcon, Plus, Star } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { VoiceRecorder } from './VoiceRecorder';
import { ChildForm } from './ChildForm';
import { useChildren } from '@/hooks/useChildren';
import { useMilestones } from '@/hooks/useMilestones';
import type { Bit } from '@/hooks/useBits';
import type { Child } from '@/hooks/useChildren';

const DEFAULT_MILESTONES = [
  'First Words',
  'First Steps',
  'First Day of School',
  'Lost First Tooth',
  'First Birthday',
  'Learned to Ride a Bike',
  'Potty Trained',
  'First Sleepover',
  'First Time Swimming',
  'First Solid Food'
];

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
  onSubmit: (data: { text: string; childId?: string; photo?: File; context?: string; bitDate?: string; milestone?: string }) => void;
  bit?: Bit;
  children: Child[];
  isLoading?: boolean;
}

export const BitForm = ({ open, onOpenChange, onSubmit, bit, children, isLoading }: BitFormProps) => {
  const [text, setText] = useState('');
  const [context, setContext] = useState('');
  const [bitDate, setBitDate] = useState<Date>(new Date());
  const [childId, setChildId] = useState<string | undefined>(undefined);
  const [milestone, setMilestone] = useState<string>('');
  const [customMilestone, setCustomMilestone] = useState('');
  const [photo, setPhoto] = useState<File | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [textVoiceStatus, setTextVoiceStatus] = useState<'idle' | 'recording' | 'processing' | 'success'>('idle');
  const [contextVoiceStatus, setContextVoiceStatus] = useState<'idle' | 'recording' | 'processing' | 'success'>('idle');
  const [isChildFormOpen, setIsChildFormOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { createChild, isCreating } = useChildren();
  const { milestones: savedMilestones, createMilestone } = useMilestones();

  // Update form when bit prop changes (for editing)
  useEffect(() => {
    if (bit && open) {
      setText(bit.text);
      setContext(bit.context || '');
      setBitDate(bit.bit_date ? new Date(bit.bit_date) : new Date());
      setChildId(bit.child_id || undefined);
      const allMilestones = [...DEFAULT_MILESTONES, ...savedMilestones.map(m => m.name)];
      const milestoneValue = bit.milestone 
        ? (allMilestones.includes(bit.milestone) ? bit.milestone : 'custom')
        : 'none';
      setMilestone(milestoneValue);
      setCustomMilestone(bit.milestone && !allMilestones.includes(bit.milestone) ? bit.milestone : '');
      setPhotoPreview(bit.photo_url || undefined);
      setPhoto(undefined);
    } else if (!bit && open) {
      // Reset form for new bit
      setText('');
      setContext('');
      setBitDate(new Date());
      setChildId(undefined);
      setMilestone('none');
      setCustomMilestone('');
      setPhoto(undefined);
      setPhotoPreview(undefined);
    }
  }, [bit, open]);

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
      const errors = result.error.errors;
      const errorMessages = errors.map(err => err.message).join(', ');
      
      toast({
        title: 'Cannot save bit',
        description: errorMessages,
        variant: 'destructive'
      });
      return;
    }

    const finalMilestone = milestone === 'custom' ? customMilestone : (milestone === 'none' ? '' : milestone);

    // Save custom milestone if it's new
    if (milestone === 'custom' && customMilestone.trim()) {
      createMilestone(customMilestone.trim());
    }

    onSubmit({ 
      text, 
      childId, 
      photo, 
      context: context || undefined,
      bitDate: format(bitDate, 'yyyy-MM-dd'),
      milestone: finalMilestone || undefined
    });
    onOpenChange(false);
  };

  const handleCreateChild = (data: { name: string; birthdate: string; color: string; photo?: File }) => {
    createChild(data, {
      onSuccess: (newChild) => {
        setChildId(newChild.id);
        setIsChildFormOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{bit ? 'Edit Bit' : 'Create New Bit'}</DialogTitle>
          <DialogDescription>
            {bit ? 'Update this memorable moment' : 'Capture a special moment'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="child">Child *</Label>
            <Select 
              value={childId} 
              onValueChange={(value) => {
                if (value === 'add-new') {
                  setIsChildFormOpen(true);
                } else {
                  setChildId(value);
                }
              }} 
              required
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
                <SelectItem value="add-new" className="text-primary font-medium">
                  + Add New Kid
                </SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="milestone">Milestone (optional)</Label>
            <Select value={milestone} onValueChange={setMilestone}>
              <SelectTrigger>
                <SelectValue placeholder="Select a milestone (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {DEFAULT_MILESTONES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
                {savedMilestones.length > 0 && (
                  <>
                    <SelectItem value="divider" disabled className="text-xs text-muted-foreground font-semibold">
                      Your Custom Milestones
                    </SelectItem>
                    {savedMilestones.map((m) => (
                      <SelectItem key={m.id} value={m.name}>
                        <Star className="inline h-3 w-3 mr-1 text-primary" />
                        {m.name}
                      </SelectItem>
                    ))}
                  </>
                )}
                <SelectItem value="custom" className="text-primary font-medium">
                  + Create Custom Milestone
                </SelectItem>
              </SelectContent>
            </Select>
            {milestone === 'custom' && (
              <Input
                value={customMilestone}
                onChange={(e) => setCustomMilestone(e.target.value)}
                placeholder="Enter custom milestone name"
                maxLength={100}
              />
            )}
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
                {contextVoiceStatus === 'success' && (
                  <span className="text-sm text-green-500">✓ Done!</span>
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
                {textVoiceStatus === 'success' && (
                  <span className="text-sm text-green-500">✓ Done!</span>
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
                  className="w-full object-contain rounded-md max-h-96"
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
              {isLoading ? 'Saving...' : (bit ? 'Update' : 'Save')}
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
