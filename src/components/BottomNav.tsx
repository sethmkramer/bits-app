import { Home, Plus, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onAddBit: () => void;
}

export const BottomNav = ({ onAddBit }: BottomNavProps) => {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-4">
        <Link to="/">
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2 px-6",
              location.pathname === "/" && "text-primary"
            )}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Timeline</span>
          </Button>
        </Link>

        <Button
          onClick={onAddBit}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="h-6 w-6" />
        </Button>

        <Link to="/children">
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2 px-6",
              location.pathname === "/children" && "text-primary"
            )}
          >
            <Users className="h-6 w-6" />
            <span className="text-xs font-medium">Children</span>
          </Button>
        </Link>
      </div>
    </nav>
  );
};
