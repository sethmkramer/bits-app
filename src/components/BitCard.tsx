import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { Bit } from '@/hooks/useBits';
import { format, formatDistanceToNow } from 'date-fns';

// Generate consistent color for each child from electric blue palette
const getChildColor = (childId: string) => {
  const colors = [
    'hsl(211, 100%, 50%)',  // Electric blue
    'hsl(195, 100%, 45%)',  // Cyan blue
    'hsl(230, 85%, 55%)',   // Royal blue
    'hsl(180, 90%, 40%)',   // Teal
    'hsl(200, 95%, 48%)',   // Sky blue
    'hsl(220, 80%, 52%)',   // Deep blue
  ];
  
  // Use child ID to consistently select a color
  const hash = childId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

interface BitCardProps {
  bit: Bit;
  onEdit: (bit: Bit) => void;
  onDelete: (id: string) => void;
}

export const BitCard = ({ bit, onEdit, onDelete }: BitCardProps) => {
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const childColor = bit.children ? getChildColor(bit.children.id) : 'hsl(211, 100%, 50%)';
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-border/50 rounded-xl overflow-hidden">
      <CardContent className="p-0">
        {/* Header with child badge and menu */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          {bit.children && (
            <Badge 
              className="font-medium px-3 py-1 rounded-full text-white" 
              style={{ backgroundColor: childColor }}
            >
              {bit.children.name}
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(bit)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(bit.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quote text */}
        <div className="px-4 pb-3">
          <p className="text-base sm:text-lg leading-relaxed text-foreground whitespace-pre-wrap break-words">
            {bit.text}
          </p>
          {bit.context && (
            <p className="text-sm text-muted-foreground mt-2 italic">
              {bit.context}
            </p>
          )}
        </div>

        {/* Photo */}
        {bit.photo_url && (
          <div className="w-full">
            <img
              src={bit.photo_url}
              alt="Bit memory"
              className="w-full h-64 sm:h-80 object-cover"
            />
          </div>
        )}

        {/* Timestamp */}
        <div className="px-4 py-3 text-xs text-muted-foreground">
          {formatDate(bit.bit_date || bit.created_at)}
        </div>
      </CardContent>
    </Card>
  );
};
