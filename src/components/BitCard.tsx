import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-border/50 rounded-xl overflow-hidden">
      <CardContent className="p-0">
        {/* Header with child badge and menu */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          {bit.children && (
            <Badge className="bg-primary text-primary-foreground font-medium px-3 py-1 rounded-full">
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
          <p className="font-quote text-base sm:text-lg leading-relaxed text-foreground whitespace-pre-wrap break-words">
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
