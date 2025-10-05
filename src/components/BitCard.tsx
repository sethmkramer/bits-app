import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { Bit } from '@/hooks/useBits';
import { format } from 'date-fns';

interface BitCardProps {
  bit: Bit;
  onEdit: (bit: Bit) => void;
  onDelete: (id: string) => void;
}

export const BitCard = ({ bit, onEdit, onDelete }: BitCardProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {bit.children && (
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
                {bit.children.name}
              </div>
            )}
            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
              {truncateText(bit.text, 200)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(bit)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(bit.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {bit.photo_url && (
          <img
            src={bit.photo_url}
            alt="Bit photo"
            className="w-full h-48 object-cover rounded-md"
          />
        )}

        <p className="text-xs text-muted-foreground">
          {formatDate(bit.created_at)}
        </p>
      </CardContent>
    </Card>
  );
};
