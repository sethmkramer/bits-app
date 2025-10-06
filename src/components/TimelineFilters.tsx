import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Search } from 'lucide-react';
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
    milestone?: string;
  }) => void;
}

export const TimelineFilters = ({ children, onFilterChange }: TimelineFiltersProps) => {
  const [searchText, setSearchText] = useState('');
  const [childId, setChildId] = useState<string | undefined>();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hasPhoto, setHasPhoto] = useState<boolean | undefined>();
  const [milestone, setMilestone] = useState<string | undefined>();
  const { trackEvent } = useAnalytics();

  const handleApply = () => {
    const filters = {
      searchText: searchText || undefined,
      childId: childId === 'all' ? undefined : childId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      hasPhoto,
      milestone: milestone === 'all' ? undefined : milestone
    };
    onFilterChange(filters);
    
    if (searchText) trackEvent('search_performed', { query: searchText });
    if (childId || dateFrom || dateTo || hasPhoto !== undefined || milestone) {
      trackEvent('filter_applied', filters);
    }
  };

  const handleReset = () => {
    setSearchText('');
    setChildId(undefined);
    setDateFrom('');
    setDateTo('');
    setHasPhoto(undefined);
    setMilestone(undefined);
    onFilterChange({});
  };

  return (
    <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border/50">
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Child</Label>
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm">Date From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Date To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Milestone</Label>
          <Select value={milestone} onValueChange={setMilestone}>
            <SelectTrigger>
              <SelectValue placeholder="All milestones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All milestones</SelectItem>
              <SelectItem value="has_milestone">Has any milestone</SelectItem>
              <SelectItem value="no_milestone">No milestone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between py-2">
          <Label className="text-sm">Has Photo</Label>
          <Switch
            checked={hasPhoto ?? false}
            onCheckedChange={(checked) => setHasPhoto(checked ? true : undefined)}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
