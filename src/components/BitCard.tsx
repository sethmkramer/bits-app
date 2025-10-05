import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { Bit } from '@/hooks/useBits';
import { format, formatDistanceToNow } from 'date-fns';

interface BitCardProps {
  bit: Bit;
  onEdit: (bit: Bit) => void;
  onDelete: (id: string) => void;
}

export const BitCard = ({ bit, onEdit, onDelete }: BitCardProps) => {
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const childColor = bit.children?.color || 'hsl(211, 100%, 50%)';
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-border/50 rounded-xl overflow-hidden">
      <CardContent className="p-0">
        {/* Header with child badge and menu */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4">
          {bit.children && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2" style={{ borderColor: childColor }}>
                {bit.children.photo_url ? (
                  <img src={bit.children.photo_url} alt={bit.children.name} className="w-full h-full object-cover" />
                ) : (
                  <AvatarFallback className="text-sm font-semibold text-white" style={{ backgroundColor: childColor }}>
                    {bit.children.name.split(' ').map(n => n.charAt(0)).filter((_, i) => i < 2).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              <Badge 
                className="font-medium px-3 py-1 rounded-full text-white" 
                style={{ backgroundColor: childColor }}
              >
                {bit.children.name}
              </Badge>
            </div>
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
          {bit.context && (
            <p className="text-sm text-muted-foreground mb-2 italic">
              {bit.context}
            </p>
          )}
          <p className="text-base sm:text-lg leading-relaxed text-foreground whitespace-pre-wrap break-words">
            {bit.text}
          </p>
        </div>

        {/* Photo */}
        {bit.photo_url && (
          <div className="px-4 pb-3">
            <div className="w-full overflow-hidden rounded-3xl bg-muted">
              <img
                src={bit.photo_url}
                alt="Bit memory"
                className="w-full h-auto object-cover"
                style={{ maxHeight: '320px' }}
              />
            </div>
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
