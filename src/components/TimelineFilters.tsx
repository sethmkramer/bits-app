import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Filter, Search } from 'lucide-react';
import type { Child } from '@/hooks/useChildren';
import { useAnalytics } from '@/hooks/useAnalytics';

interface TimelineFiltersProps {
  children: Child[];
  onFilterChange: (filters: {
    searchText?: string;
    childId?: string;
    dateFrom?: string;
    dateTo?: string;
    hasPhoto?: boolean;
  }) => void;
}

export const TimelineFilters = ({ children, onFilterChange }: TimelineFiltersProps) => {
  const [searchText, setSearchText] = useState('');
  const [childId, setChildId] = useState<string | undefined>();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hasPhoto, setHasPhoto] = useState<boolean | undefined>();
  const { trackEvent } = useAnalytics();

  const handleApply = () => {
    const filters = {
      searchText: searchText || undefined,
      childId: childId === 'all' ? undefined : childId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      hasPhoto
    };
    onFilterChange(filters);
    
    if (searchText) trackEvent('search_performed', { query: searchText });
    if (childId || dateFrom || dateTo || hasPhoto !== undefined) {
      trackEvent('filter_applied', filters);
    }
  };

  const handleReset = () => {
    setSearchText('');
    setChildId(undefined);
    setDateFrom('');
    setDateTo('');
    setHasPhoto(undefined);
    onFilterChange({});
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bits..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className="pl-10"
        />
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Filter Bits</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label>Child</Label>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="All children" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All children</SelectItem>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={dateTo || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Has Photo</Label>
              <Switch
                checked={hasPhoto ?? false}
                onCheckedChange={(checked) => setHasPhoto(checked ? true : undefined)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Reset
              </Button>
              <Button onClick={handleApply} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
